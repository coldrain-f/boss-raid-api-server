import { Injectable } from '@nestjs/common';
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
}
