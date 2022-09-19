import { Controller, Get } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';

@Controller('bossRaid')
export class BossRaidHistoryController {
  constructor(
    private readonly bossRaidHistoryService: BossRaidHistoryService,
  ) {}

  /**
   * 보스레이드 상태 조회 API
   * @returns 입장 가능 여부와 입장한 유저의 아이디 값
   */
  @Get()
  async findBossRaidStatus(): Promise<{
    canEnter: boolean;
    enteredUserId: number;
  }> {
    return await this.bossRaidHistoryService.findBossRaidStatus();
  }
}
