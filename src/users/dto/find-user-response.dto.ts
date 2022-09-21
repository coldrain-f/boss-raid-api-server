import { BossRaidHistory } from 'src/boss-raid-history/entities/boss-raid-history.entity';

export class FindUserResponseDTO {
  totalScore: number;
  bossRaidHistory: BossRaidHistory[];
}
