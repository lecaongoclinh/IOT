// src/action_history/action-history.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ActionHistory } from './entities/action-history.entity';
import { GetActionHistoryDto } from './dto/get-action-history.dto';

@Injectable()
export class ActionHistoryService {
  constructor(
    @InjectRepository(ActionHistory)
    private historyRepo: Repository<ActionHistory>,
  ) {}

async getActionHistory(dto: GetActionHistoryDto) {
  const { search, filter, sort, limit, page } = dto;

  const qb = this.historyRepo.createQueryBuilder('h')
    .leftJoinAndSelect('h.device', 'd');

  // ----------------
  // SEARCH (tìm theo tên thiết bị, action, createdAt)
  // ----------------
  if (search && search.trim() !== '') {
    const trimmed = search.trim();
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
    const dateHour = /^\d{4}-\d{2}-\d{2} \d{2}$/;
    const dateMinute = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
    const dateSecond = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

    if (dateOnly.test(trimmed) || dateHour.test(trimmed) || dateMinute.test(trimmed) || dateSecond.test(trimmed)) {
      let format = '%Y-%m-%d';
      if (dateHour.test(trimmed)) format = '%Y-%m-%d %H';
      else if (dateMinute.test(trimmed)) format = '%Y-%m-%d %H:%i';
      else if (dateSecond.test(trimmed)) format = '%Y-%m-%d %H:%i:%s';

      qb.andWhere(`DATE_FORMAT(h.createdAt, '${format}') LIKE :dateStr`, { dateStr: `${trimmed}%` });
    } else {
      const searchValue = `%${trimmed}%`;
      qb.andWhere(
        `(d.name LIKE :searchValue OR h.action LIKE :searchValue OR DATE_FORMAT(h.createdAt, '%Y-%m-%d %H:%i:%s') LIKE :searchValue)`,
        { searchValue }
      );
    }
  }

  // ----------------
  // FILTER (lọc theo deviceId hoặc thời gian)
  // ----------------
  if (filter && filter !== 'all') {
    if (filter === 'time') {
      // sắp xếp theo createdAt
      // thực chất chỉ để sort, không cần thêm where
    } else {
      qb.andWhere('h.deviceId = :deviceId', { deviceId: filter });
    }
  }

  // ----------------
  // SORT
  // ----------------
  let orderColumn = 'h.id';
  if (filter === 'time' || filter === 'all') orderColumn = 'h.createdAt';
  const order: 'ASC' | 'DESC' = sort && ['asc','desc'].includes(sort.toLowerCase()) ? sort.toUpperCase() as 'ASC'|'DESC' : 'ASC';
  qb.orderBy(orderColumn, order);

  // ----------------
  // PAGINATION
  // ----------------
  const currentPage = page && page > 0 ? page : 1;
  const safeLimit = limit && limit > 0 ? limit : 10;
  const skip = (currentPage - 1) * safeLimit;
  qb.take(safeLimit).skip(skip);

  // ----------------
  // EXECUTE
  // ----------------
  const [data, total] = await qb.getManyAndCount();

  return {
    data: data.map(h => ({
      id: h.id,
      deviceId: h.deviceId,
      deviceName: h.device.name,
      action: h.action,
      createdAt: h.createdAt,
    })),
    total,
    page: currentPage,
    totalPages: Math.ceil(total / safeLimit),
  };
}


}
