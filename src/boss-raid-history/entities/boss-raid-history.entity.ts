import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BossRaidHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  score: number;

  @Column()
  enterTime: Date;

  @Column()
  endTime: Date;

  @Column()
  level: string;

  @ManyToOne(() => User, (user) => user.bossRaidHistories)
  enteredUser: User;
}
