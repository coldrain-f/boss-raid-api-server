import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { BossRaidHistoryService } from 'src/boss-raid-history/boss-raid-history.service';
import { BossRaidHistory } from 'src/boss-raid-history/entities/boss-raid-history.entity';
import { UsersService } from 'src/users/users.service';

export interface RankingInfo {
  ranking: number;
  userId: number;
  totalScore: number;
}

@Injectable()
export class RankService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly bossRaidHistoryService: BossRaidHistoryService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 랭킹 패치
   * 순서대로 Sorted Set의 이름, 점수(score), 키(key)
   */
  async fetchRanking(totalScore: number, userId: number) {
    await this.redis.zadd('rank', totalScore, userId);
  }

  /**
   * 모든 랭킹 조회
   */
  getAllRanking() {}

  /**
   * 나의 랭킹 조회
   */
  getMyRanking(userId: number) {}
}
