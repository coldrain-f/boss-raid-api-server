import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
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
    await this.initCanEnterData();

    const canEnter = await this.cacheManager.get<boolean>('canEnter');

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

    return {
      isEntered: true,
      raidRecordId: savedBossRaidHistory.id,
    };
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
