import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, Injectable } from '@nestjs/common';
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
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 랭킹 패치
   * 순서대로 Sorted Set의 이름, 점수(score), 키(key)
   */
  async fetchRanking(totalScore: number, userId: number): Promise<void> {
    await this.redis.zadd('rank', totalScore, userId);
  }

  /**
   * 탑 랭킹 조회 (1등부터 10등까지)
   */
  async getTopRankingList(): Promise<RankingInfo[]> {
    const ranking: string[] = await this.redis.zrevrange('rank', 0, 9);
    const rankingInfoList: RankingInfo[] = [];

    ranking.forEach(async (userId, rank) =>
      rankingInfoList.push({
        ranking: rank,
        userId: parseInt(userId),
        totalScore: parseInt(await this.redis.zscore('rank', userId)),
      }),
    );
    return rankingInfoList;
  }

  /**
   * 나의 랭킹 조회
   */
  async getMyRanking(userId: number): Promise<RankingInfo> {
    const totalScore = parseInt(await this.redis.zscore('rank', userId));
    const ranking = await this.redis.zrevrank('rank', userId.toString());
    return { ranking, userId, totalScore };
  }
}
