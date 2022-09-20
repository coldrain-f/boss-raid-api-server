import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

interface BossRaidInfo {
  bossRaidLimitSeconds: number;
  levels: { level: number; score: number }[];
}

@Injectable()
export class BossRaidService {
  constructor(private readonly httpService: HttpService) {}

  async getBossRaidCacheData(): Promise<BossRaidInfo> {
    // Todo: Redis에 올려놓고 캐싱하여 사용하도록 변경
    const BOSS_RAID_DATA_URL =
      'https://dmpilf5svl7rv.cloudfront.net/assignment/backend/bossRaidData.json';

    const response = await firstValueFrom(
      this.httpService.get(BOSS_RAID_DATA_URL),
    );
    return response.data;
  }
}
