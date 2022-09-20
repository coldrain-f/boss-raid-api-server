import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';
import { EndBossRaidDTO } from './dto/end-boss-raid-dto';
import { EnterBossRaidDTO } from './dto/enter-boss-raid-dto';

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

  /**
   * 보스레이드 시작 API
   */
  @Post('enter')
  async enterBossRaid(
    @Body() request: EnterBossRaidDTO,
  ): Promise<{ isEntered: boolean; raidRecordId: number }> {
    const { userId, level } = request;
    return await this.bossRaidHistoryService.enter(userId, level);
  }

  /**
   * 보스레이드 종료 API
   */
  @Patch('end')
  async endBossRaid(@Body() request: EndBossRaidDTO) {
    const { userId, raidRecordId } = request;
    return await this.bossRaidHistoryService.end(userId, raidRecordId);
  }
}
