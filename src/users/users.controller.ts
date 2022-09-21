import { Controller, Get, Param, Post } from '@nestjs/common';
import { BossRaidHistory } from 'src/boss-raid-history/entities/boss-raid-history.entity';
import { FindUserResponseDTO } from './dto/find-user-response.dto';
import { SignupUserResponseDTO } from './dto/signup-user-response.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 유저 생성 API
   */
  @Post()
  async signup(): Promise<SignupUserResponseDTO> {
    return await this.usersService.signup();
  }

  /**
   * 유저 조회 API
   */
  @Get(':userId')
  async findOne(@Param('userId') userId: number): Promise<FindUserResponseDTO> {
    const user: User = await this.usersService.findOne(userId);
    let totalScore = 0;

    user.bossRaidHistories
      .filter((history) => history.enterTime)
      .forEach((history) => (totalScore += history.score));

    return {
      totalScore,
      bossRaidHistory: user.bossRaidHistories || [],
    };
  }
}
