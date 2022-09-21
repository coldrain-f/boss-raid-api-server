import { Controller, Get, Param, Post } from '@nestjs/common';
import { BossRaidHistory } from 'src/boss-raid-history/entities/boss-raid-history.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @Todo: 반환 타입을 DTO로 변경하기

  /**
   * 유저 생성 API
   * @returns 생성된 유저의 아이디 값(PK)
   */
  @Post()
  async signup(): Promise<{ userId: number }> {
    return await this.usersService.signup();
  }

  /**
   * 유저 조회 API
   * @param userId 조회하고자 하는 유저의 아이디 값(PK)
   * @returns 조회한 사용자의 보스 레이드 총 점수와 보스 레이드 히스토리 목록
   */
  @Get(':userId')
  async findOne(
    @Param('userId') userId: number,
  ): Promise<{ totalScore: number; bossRaidHistory: BossRaidHistory[] }> {
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
