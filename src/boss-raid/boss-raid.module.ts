import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { BossRaidService } from './boss-raid.service';

@Module({
  imports: [HttpModule],
  providers: [BossRaidService],
  exports: [BossRaidService],
})
export class BossRaidModule {}
