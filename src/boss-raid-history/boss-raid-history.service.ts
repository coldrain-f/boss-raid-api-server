import { RedlockService } from '@anchan828/nest-redlock';
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
import { BossRaidService } from 'src/boss-raid/boss-raid.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { BossRaidHistory } from './entities/boss-raid-history.entity';

export interface BossRaidStatusInfo {
  canEnter: boolean;
  enteredUserId: number;
}

@Injectable()
export class BossRaidHistoryService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(BossRaidHistory)
    private readonly bossRaidHistoriesRepository: Repository<BossRaidHistory>,
    private readonly usersService: UsersService,
    private readonly redlock: RedlockService,
    private readonly bossRaidService: BossRaidService,
  ) {
    // 싱글톤 객체 생성 시 필요한 Redis 캐시 데이터 초기화
    this.initBossRaidCacheData();
  }

  /**
   * 보스레이드 상태 조회
   * @returns 입장 가능 여부와 입장한 유저의 아이디 값
   */
  async findBossRaidStatus(): Promise<BossRaidStatusInfo> {
    return await this.cacheManager.get('bossRaidStatus');
  }

  /**
   * 보스레이드 시작
   */
  async enter(
    userId: number,
    level: number,
  ): Promise<{ isEntered: boolean; raidRecordId: number }> {
    // lock을 걸었으므로 다른 사용자는 이곳에서 unlock 전까지 대기한다.
    const lock = await this.redlock.acquire(['lock'], 3000);

    const bossRaidStatus: BossRaidStatusInfo = await this.cacheManager.get(
      'bossRaidStatus',
    );

    if (!bossRaidStatus.canEnter) {
      await lock.release();
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          error: '다른 유저가 보스 레이드를 진행중입니다.',
          isEntered: false,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const savedRaidRecord = await this.createBossRaidHistory(userId, level);

    // Todo: Redis에서 canEnter와 enteredUserId를 갱신
    await this.cacheManager.set(
      'bossRaidStatus',
      { canEnter: false, enteredUserId: userId },
      { ttl: 0 },
    );
    await lock.release();

    return {
      isEntered: true,
      raidRecordId: savedRaidRecord.id,
    };
  }

  /**
   * 보스레이드 종료
   */
  async end(userId: number, raidRecordId: number) {
    const bossRaidHistory = await this.findOne(raidRecordId);

    if (bossRaidHistory.enteredUser.id !== userId) {
      throw new BadRequestException('일치하지 않는 유저입니다.');
    }
    if (bossRaidHistory.id !== raidRecordId) {
      throw new BadRequestException('일치하지 않은 보스 레이드 기록입니다.');
    }
    if (bossRaidHistory.endTime) {
      throw new BadRequestException('이미 종료된 보스 레이드입니다.');
    }

    // Todo: 시작한 시간으로부터 레이드 제한시간이 지났다면 예외 처리
    const isGameTimeout = await this.isGameTimeout(bossRaidHistory);
    if (isGameTimeout) {
      // Todo: 어쨌든 다음 유저는 보스레이드를 시작할 수 있어야 하므로 레이드 상태변경을 한다.
      await this.cacheManager.set(
        'bossRaidStatus',
        { canEnter: true, enteredUserId: null },
        { ttl: 0 },
      );
      bossRaidHistory.endTime = new Date();
      await this.bossRaidHistoriesRepository.save(bossRaidHistory);
      throw new BadRequestException(
        '보스 레이드 제한 시간이 지나 강제 종료 처리되었습니다.',
      );
    }

    // Todo: 가져온 bossRaidHistory를 갱신한다.
    const score: number = await this.bossRaidService.getBossRaidScore(
      bossRaidHistory.level,
    );
    bossRaidHistory.score = score;
    bossRaidHistory.endTime = new Date();

    await this.bossRaidHistoriesRepository.save(bossRaidHistory);

    // Todo: canEnter 값을 true로 변경하고 enteredUserId를 null로 변경한다.
    await this.cacheManager.set(
      'bossRaidStatus',
      { canEnter: true, enteredUserId: null },
      { ttl: 0 },
    );

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
  private async initBossRaidCacheData(): Promise<void> {
    const bossRaidStatus: BossRaidStatusInfo = await this.cacheManager.get(
      'bossRaidStatus',
    );
    if (!bossRaidStatus) {
      await this.cacheManager.set(
        'bossRaidStatus',
        { canEnter: true, enteredUserId: null },
        { ttl: 0 },
      );
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

  /**
   * 보스레이드 시작 시간으로부터 제한시간이 경과했는지 확인한다.
   */
  private async isGameTimeout(bossRaidHistory: BossRaidHistory) {
    const { enterTime } = bossRaidHistory;
    const bossRaidLimitSeconds: number =
      await this.bossRaidService.getBossRaidLimitSeconds();

    const enterSeconds = this.toSeconds(enterTime);
    const currentSeconds = this.toSeconds(new Date());
    const gameTotalSeconds = enterSeconds + bossRaidLimitSeconds;

    if (currentSeconds > gameTotalSeconds) {
      return true;
    }
    return false;
  }

  /**
   * Date의 시,분,초를 초로 변환해서 더하여 반환한다.
   */
  private toSeconds(date: Date): number {
    let seconds = date.getHours() * 3600;
    seconds += date.getMinutes() * 60;
    seconds += date.getSeconds();
    return seconds;
  }
}
