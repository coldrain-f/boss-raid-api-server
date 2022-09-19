import { IsNotEmpty, IsNumber } from 'class-validator';

export class EnterBossRaidDTO {
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @IsNumber()
  @IsNotEmpty()
  level: number;
}
