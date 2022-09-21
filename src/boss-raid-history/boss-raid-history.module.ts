import { CacheModule, forwardRef, Module } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';
import { BossRaidHistoryController } from './boss-raid-history.controller';
import * as redisStore from 'cache-manager-ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BossRaidHistory } from './entities/boss-raid-history.entity';
import { UsersModule } from 'src/users/users.module';
import Redis from 'ioredis';
import { RedlockModule } from '@anchan828/nest-redlock';
import { HttpModule } from '@nestjs/axios';
import { BossRaidModule } from 'src/boss-raid/boss-raid.module';
import { RankModule } from 'src/rank/rank.module';

@Module({
  imports: [
    RedlockModule.register({
      // See https://github.com/mike-marcacci/node-redlock#configuration
      clients: [new Redis({ host: '127.0.0.1', port: 6379 })],
      settings: {
        driftFactor: 0.01,
        retryCount: 10,
        retryDelay: 200,
        retryJitter: 200,
        automaticExtensionThreshold: 500,
      },
      // Default duratiuon to use with Redlock decorator
      duration: 1000,
    }),
    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
    }),
    TypeOrmModule.forFeature([BossRaidHistory]),
    RankModule,
    HttpModule,
    UsersModule,
    BossRaidModule,
  ],
  controllers: [BossRaidHistoryController],
  providers: [BossRaidHistoryService],
})
export class BossRaidHistoryModule {}
