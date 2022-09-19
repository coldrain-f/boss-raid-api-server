import { Injectable } from '@nestjs/common';
import { CreateBossRaidHistoryDto } from './dto/create-boss-raid-history.dto';
import { UpdateBossRaidHistoryDto } from './dto/update-boss-raid-history.dto';

@Injectable()
export class BossRaidHistoryService {
  create(createBossRaidHistoryDto: CreateBossRaidHistoryDto) {
    return 'This action adds a new bossRaidHistory';
  }

  findAll() {
    return `This action returns all bossRaidHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bossRaidHistory`;
  }

  update(id: number, updateBossRaidHistoryDto: UpdateBossRaidHistoryDto) {
    return `This action updates a #${id} bossRaidHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} bossRaidHistory`;
  }
}
