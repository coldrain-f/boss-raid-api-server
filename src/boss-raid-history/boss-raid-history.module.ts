import { CacheModule, Module } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';
import { BossRaidHistoryController } from './boss-raid-history.controller';
import * as redisStore from 'cache-manager-ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BossRaidHistory } from './entities/boss-raid-history.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: '127.0.0.1',
      port: 6379,
    }),
    TypeOrmModule.forFeature([BossRaidHistory]),
    UsersModule,
  ],
  controllers: [BossRaidHistoryController],
  providers: [BossRaidHistoryService],
})
export class BossRaidHistoryModule {}
