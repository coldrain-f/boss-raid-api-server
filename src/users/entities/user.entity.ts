import { BossRaidHistory } from 'src/boss-raid-history/entities/boss-raid-history.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: false,
  })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => BossRaidHistory,
    (bossRaidHistory) => bossRaidHistory.enteredUser,
  )
  bossRaidHistories: BossRaidHistory[];
}
