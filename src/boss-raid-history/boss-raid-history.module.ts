import { Module } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';
import { BossRaidHistoryController } from './boss-raid-history.controller';

@Module({
  controllers: [BossRaidHistoryController],
  providers: [BossRaidHistoryService]
})
export class BossRaidHistoryModule {}
