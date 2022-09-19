import { Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 유저 생성 API
   * @returns 생성된 유저의 아이디 값(PK)
   */
  @Post()
  async signup(): Promise<{ userId: number }> {
    return await this.usersService.signup();
  }
}
