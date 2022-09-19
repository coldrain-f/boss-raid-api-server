import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BossRaidHistoryService } from './boss-raid-history.service';
import { CreateBossRaidHistoryDto } from './dto/create-boss-raid-history.dto';
import { UpdateBossRaidHistoryDto } from './dto/update-boss-raid-history.dto';

@Controller('boss-raid-history')
export class BossRaidHistoryController {
  constructor(private readonly bossRaidHistoryService: BossRaidHistoryService) {}

  @Post()
  create(@Body() createBossRaidHistoryDto: CreateBossRaidHistoryDto) {
    return this.bossRaidHistoryService.create(createBossRaidHistoryDto);
  }

  @Get()
  findAll() {
    return this.bossRaidHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bossRaidHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBossRaidHistoryDto: UpdateBossRaidHistoryDto) {
    return this.bossRaidHistoryService.update(+id, updateBossRaidHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bossRaidHistoryService.remove(+id);
  }
}
