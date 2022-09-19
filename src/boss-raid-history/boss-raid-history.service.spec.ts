import { Test, TestingModule } from '@nestjs/testing';
import { BossRaidHistoryService } from './boss-raid-history.service';

describe('BossRaidHistoryService', () => {
  let service: BossRaidHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BossRaidHistoryService],
    }).compile();

    service = module.get<BossRaidHistoryService>(BossRaidHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
