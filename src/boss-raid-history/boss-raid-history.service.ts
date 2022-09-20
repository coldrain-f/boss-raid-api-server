import { RedlockService } from '@anchan828/nest-redlock';
import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import Redlock, { Lock } from 'redlock';
import { BossRaidService } from 'src/boss-raid/boss-raid.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { BossRaidHistory } from './entities/boss-raid-history.entity';

@Injectable()
export class BossRaidHistoryService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(BossRaidHistory)
    private readonly bossRaidHistoriesRepository: Repository<BossRaidHistory>,
    private readonly usersService: UsersService,
    private readonly redlock: RedlockService,
    private readonly bossRaidService: BossRaidService,
  ) {}

  /**
   * 보스레이드 상태 조회
   * @returns 입장 가능 여부와 입장한 유저의 아이디 값
   */
  async findBossRaidStatus(): Promise<{
    canEnter: boolean;
    enteredUserId: number;
  }> {
    // Redis에서 canEnter 값을 가지고 온다.
    // 값이 없으면 입장 내역이 없는 것이므로 입장 가능으로 처리한다.
    let canEnter = await this.cacheManager.get<boolean>('canEnter');

    if (canEnter === null) {
      canEnter = true;
    }

    // Redis에서 현재 입장중인 유저의 아이디 값을 가지고 온다.
    // 값이 없으면 입장한 사용자가 없는 것이므로 null로 처리한다.
    const enteredUserId = await this.cacheManager.get<number>('enteredUserId');

    return {
      canEnter: canEnter,
      enteredUserId,
    };
  }

  /**
   * 보스레이드 시작
   */
  async enter(
    userId: number,
    level: number,
  ): Promise<{ isEntered: boolean; raidRecordId: number }> {
    // Todo: 앱이 로딩될 때 필요한 Redis 캐시 데이터 초기화 하기
    await this.initCanEnterData();

    // lock을 걸었으므로 다른 사용자는 이곳에서 unlock 전까지 대기한다.
    const lock = await this.redlock.acquire(['lock'], 3000);

    const canEnter: boolean = await this.cacheManager.get('canEnter');

    await this.cacheManager.get<boolean>('key');

    if (!canEnter) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          error: '다른 유저가 보스 레이드를 진행중입니다.',
          isEntered: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const savedBossRaidHistory = await this.createBossRaidHistory(
      userId,
      level,
    );

    await this.cacheManager.set('canEnter', false, { ttl: 0 });

    // unlock
    await lock.release();

    return {
      isEntered: true,
      raidRecordId: savedBossRaidHistory.id,
    };
  }

  /**
   * 보스레이드 종료
   */
  async end(userId: number, raidRecordId: number) {
    // Todo: raidRecordId로 bossRaidHistory를 하나 가지고 온다.
    const bossRaidHistory = await this.findOne(raidRecordId);

    // Todo: 저장된 userId와 raidRecordId가 일치하지 않다면 예외 처리
    if (bossRaidHistory.enteredUser.id !== userId) {
      throw new BadRequestException('일치하지 않는 유저입니다.');
    }
    if (bossRaidHistory.id !== raidRecordId) {
      throw new BadRequestException('일치하지 않은 보스 레이드 기록입니다.');
    }

    // Todo: 시작한 시간으로부터 레이드 제한시간이 지났다면 예외 처리
    // 만약 9:52에 시작했고 보스 종료를 9:55분에 했다면 exception
    // 시작 시간 + bossRaidLimitSeconds  > 현재 시간 = Exception
    const { enterTime } = bossRaidHistory;
    const bossRaidLimitSeconds: number =
      await this.bossRaidService.getBossRaidLimitSeconds();

    const enterSeconds =
      enterTime.getHours() * 3600 +
      enterTime.getMinutes() * 60 +
      enterTime.getSeconds();

    const currentSeconds =
      new Date().getHours() * 3600 +
      new Date().getMinutes() * 60 +
      new Date().getSeconds();

    // Todo: 시간 계산이 잘 되는지 검증 필요
    if (enterSeconds + bossRaidLimitSeconds > currentSeconds) {
      throw new BadRequestException('입장 시간에서 3분이 지났습니다.');
    }

    // Todo: 가져온 bossRaidHistory를 갱신한다.
    // 레이드 level에 따른 score 반영
    // endTime 갱신
    const level = bossRaidHistory.level;
    const score: number = await this.bossRaidService.getBossRaidScore(level);
    bossRaidHistory.score = score;
    bossRaidHistory.endTime = new Date();

    await this.bossRaidHistoriesRepository.save(bossRaidHistory);

    // Todo: Redis에서 랭킹 갱신
  }

  async findOne(raidRecordId: number): Promise<BossRaidHistory> {
    const bossRaidHistory = await this.bossRaidHistoriesRepository.findOne({
      where: { id: raidRecordId },
      relations: ['enteredUser'],
    });
    if (!bossRaidHistory) {
      throw new NotFoundException('보스 레이드 기록을 찾을 수 없습니다.');
    }
    return bossRaidHistory;
  }

  /**
   * 입장 가능여부 Redis 데이터 초기화
   * Redis에 canEnter 값이 설정되어 있지 않다면 값 설정 및 초기화
   */
  private async initCanEnterData(): Promise<void> {
    const canEnter = await this.cacheManager.get<boolean>('canEnter');
    if (canEnter === null) {
      await this.cacheManager.set('canEnter', true, { ttl: 0 });
    }
  }

  /**
   * 새로운 보스 레이드 기록을 생성한다.
   */
  private async createBossRaidHistory(
    userId: number,
    level: number,
  ): Promise<BossRaidHistory> {
    const bossRaidHistory = new BossRaidHistory();
    bossRaidHistory.level = level;
    bossRaidHistory.enteredUser = await this.usersService.findOne(userId);
    const savedBossRaidHistory = await this.bossRaidHistoriesRepository.save(
      bossRaidHistory,
    );
    return savedBossRaidHistory;
  }
}
