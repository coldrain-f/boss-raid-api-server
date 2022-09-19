import { Test, TestingModule } from '@nestjs/testing';
import { BossRaidHistoryController } from './boss-raid-history.controller';
import { BossRaidHistoryService } from './boss-raid-history.service';

describe('BossRaidHistoryController', () => {
  let controller: BossRaidHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BossRaidHistoryController],
      providers: [BossRaidHistoryService],
    }).compile();

    controller = module.get<BossRaidHistoryController>(BossRaidHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
