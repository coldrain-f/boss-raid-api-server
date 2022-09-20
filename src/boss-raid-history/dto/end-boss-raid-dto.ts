import { IsNotEmpty, IsNumber } from 'class-validator';

export class EndBossRaidDTO {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  raidRecordId: number;
}
