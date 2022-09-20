import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

class BossRaidInfo {
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
    if (level < 0 || level > 3) {
      throw new HttpException(
        '존재하지 않는 레벨입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
    const response = await this.fetchBossRaidCachingData();
    const staticData = response.data.bossRaids[0];
    return staticData.levels[level].score;
  }

  async getBossRaidLimitSeconds() {
    const response = await this.fetchBossRaidCachingData();
    const staticData = response.data.bossRaid[0];
    return staticData.bossRaidLimitSeconds;
  }
}
