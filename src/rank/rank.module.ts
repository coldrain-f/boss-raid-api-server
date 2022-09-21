import { Module } from '@nestjs/common';
import { RankService } from './rank.service';

@Module({
  providers: [RankService],
  exports: [RankService],
})
export class RankModule {}
