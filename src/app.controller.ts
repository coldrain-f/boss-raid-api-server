import { CACHE_MANAGER, Controller, Get, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cache')
  async getCache() {
    // 없으면 null
    const canEnter: boolean = await this.cacheManager.get('canEnter');

    if (!canEnter) {
      await this.cacheManager.set('canEnter', true, { ttl: 600 });
      return true;
    }

    return canEnter;
  }
}
