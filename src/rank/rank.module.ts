import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { RankService } from './rank.service';

// Redis sorted set을 위해서
// npm install @liaoliaots/nestjs-redis ioredis 설치
@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: '127.0.0.1',
        port: 6379,
      },
    }),
    UsersModule,
  ],
  providers: [RankService],
  exports: [RankService],
})
export class RankModule {}
