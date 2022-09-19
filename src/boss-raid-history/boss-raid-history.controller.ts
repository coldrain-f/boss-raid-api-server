import { Controller } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';

@Controller('boss-raid-history')
export class BossRaidHistoryController {
  constructor(
    private readonly bossRaidHistoryService: BossRaidHistoryService,
  ) {}
}
