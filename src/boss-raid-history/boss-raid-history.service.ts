import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class BossRaidHistoryService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * 보스레이드 상태 조회
   * @returns 입장 가능 여부와 입장한 유저의 아이디 값
   */
  async findBossRaidStatus(): Promise<{
    canEnter: boolean;
    enteredUserId: number;
  }> {
    // Redis에서 canEnter 값을 가지고 온다.
    // 값이 없으면 입장 내역이 없는 것이므로 입장 가능으로 처리한다.
    const canEnter = (await this.cacheManager.get<boolean>('canEnter')) || true;

    // Redis에서 현재 입장중인 유저의 아이디 값을 가지고 온다.
    // 값이 없으면 입장한 사용자가 없는 것이므로 null로 처리한다.
    const enteredUserId = await this.cacheManager.get<number>('enteredUserId');

    return {
      canEnter,
      enteredUserId,
    };
  }
}
