import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * 유저 생성
   */
  async signup(): Promise<{ userId: number }> {
    const userEntity: User = new User();
    const savedUser = await this.usersRepository.save(userEntity);
    return {
      userId: savedUser.id,
    };
  }

  /**
   * 유저 조회
   */
  async findOne(userId: number): Promise<User> {
    const userEntity: User = await this.usersRepository.findOne({
      where: { id: userId, isDeleted: false },
      relations: ['bossRaidHistories'],
    });

    if (!userEntity) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return userEntity;
  }

  /**
   * 모든 유저 조회
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      relations: ['bossRaidHistories'],
    });
  }
}
