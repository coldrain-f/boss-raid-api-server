import { CacheModule, Module } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';
import { BossRaidHistoryController } from './boss-raid-history.controller';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
    }),
  ],
  controllers: [BossRaidHistoryController],
  providers: [BossRaidHistoryService],
})
export class BossRaidHistoryModule {}
