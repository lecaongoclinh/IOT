import { Controller, Get, Query } from '@nestjs/common';
import { ActionHistoryService } from './action_history.service';
import { GetActionHistoryDto } from './dto/get-action-history.dto';

@Controller('action-history')
export class ActionHistoryController {
    constructor(private readonly actionHistoryService: ActionHistoryService) {}

  // -----------------------------
  // Lấy lịch sử của tất cả thiết bị
  // -----------------------------
  @Get()
  async getAllHistory(@Query() dto: GetActionHistoryDto) {
    try {
      const result = await this.actionHistoryService.getActionHistory(dto);
      return { success: true, ...result };
    } catch (err) {
      console.error('🚨 getAllHistory error:', err.message, err.stack);
      return { success: false, message: err.message };
    }
  }
}
