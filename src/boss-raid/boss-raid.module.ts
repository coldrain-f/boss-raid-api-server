import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { BossRaidService } from './boss-raid.service';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
    }),
    HttpModule,
  ],
  providers: [BossRaidService],
  exports: [BossRaidService],
})
export class BossRaidModule {}
