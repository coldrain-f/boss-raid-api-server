import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

export interface BossRaidInfo {
  bossRaidLimitSeconds: number;
  levels: { level: number; score: number }[];
}

@Injectable()
export class BossRaidService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cacheManager: Cache,
  ) {
    // 싱글톤 객체 생성 시 필요한 Redis 캐시 데이터 초기화
    this.initBossRaidStaticDataCaching();
  }

  /**
   * 캐싱한 staticData 반환
   */
  private async fetchBossRaidCachingData(): Promise<BossRaidInfo> {
    return await this.cacheManager.get<BossRaidInfo>('bossRaidInfo');
  }

  /**
   * 레벨에 따른 보스 레이드 스코어 반환
   */
  async getBossRaidScore(level: number) {
    if (!this.existBossRaidLevel) {
      throw new BadRequestException('존재하지 않는 레벨입니다.');
    }
    const bossRaidInfo: BossRaidInfo = await this.fetchBossRaidCachingData();
    return bossRaidInfo.levels[level].score;
  }

  /**
   * 게임 제한시간 seconds로 반환
   */
  async getBossRaidLimitSeconds() {
    const bossRaidInfo = await this.fetchBossRaidCachingData();
    return bossRaidInfo.bossRaidLimitSeconds;
  }

  /**
   * staticData에 존재하는 레벨 범위인지 체크하여 true/false 반환
   */
  private existBossRaidLevel(level: number): boolean {
    if (level < 0 || level > 3) {
      return false;
    }
    return true;
  }

  /**
   * staticData Redis에 캐싱
   */
  private async initBossRaidStaticDataCaching() {
    const BOSS_RAID_DATA_URL =
      'https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json';

    const response = await this.httpService.axiosRef.get(BOSS_RAID_DATA_URL);
    const bossRaidInfo: BossRaidInfo = response.data.bossRaid[0];

    // Todo: Redis에 staticData 캐싱
    await this.cacheManager.set('bossRaidInfo', bossRaidInfo, { ttl: 0 });
  }
}
