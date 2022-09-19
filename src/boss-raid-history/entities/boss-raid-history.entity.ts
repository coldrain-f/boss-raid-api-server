import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class BossRaidHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  score: number;

  @CreateDateColumn()
  enterTime: Date;

  @Column({ nullable: true })
  endTime: Date;

  @Column()
  level: number;

  @ManyToOne(() => User, (user) => user.bossRaidHistories)
  enteredUser: User;
}
