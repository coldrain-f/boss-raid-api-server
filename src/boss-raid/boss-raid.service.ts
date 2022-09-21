import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

export interface BossRaidInfo {
  bossRaids: [
    bossRaidLimitSeconds: number,
    levels: { level: number; score: number }[],
  ];
}

@Injectable()
export class BossRaidService {
  constructor(private readonly httpService: HttpService) {}

  private async fetchBossRaidCachingData() {
    // Todo: Redis에 올려놓고 캐싱하여 사용하도록 변경
    const BOSS_RAID_DATA_URL =
      'https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json';

    return this.httpService.axiosRef.get(BOSS_RAID_DATA_URL);
  }

  async getBossRaidScore(level: number) {
    if (!this.existBossRaidLevel) {
      throw new BadRequestException('존재하지 않는 레벨입니다.');
    }
    const response = await this.fetchBossRaidCachingData();
    const staticData = response.data.bossRaids[0];
    return staticData.levels[level].score;
  }

  /**
   * 게임 제한시간 seconds로 반환
   */
  async getBossRaidLimitSeconds() {
    const response = await this.fetchBossRaidCachingData();
    const staticData = response.data.bossRaid[0];
    return staticData.bossRaidLimitSeconds;
  }

  private existBossRaidLevel(level: number): boolean {
    if (level < 0 || level > 3) {
      return false;
    }
    return true;
  }
}
