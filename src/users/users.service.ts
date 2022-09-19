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
   * @returns 생성된 유저의 아이디 값(PK)
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
   * @param userId 조회하고자 하는 유저의 아이디 값(PK)
   * @returns 조회한 사용자 Entity
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
}
