import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SensorData } from '../data_sensor/entities/sensor_data.entity';
import { SensorGateway } from '../gateway/sensor.gateway';
import { GetSensorDataDto } from './dto/get-sensor-data.dto';
@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(SensorData)
    private readonly sensorRepo: Repository<SensorData>,
    private readonly gateway: SensorGateway,
  ) {}

  async saveSensorData(data: { temperature: number; humidity: number; light: number }) {
    // Lưu vào DB
    const record = this.sensorRepo.create(data);
    await this.sensorRepo.save(record);

    // Phát ra WebSocket cho frontend
    this.gateway.broadcastSensorData(record);

    return record;
  }

  async getSensorData(dto: GetSensorDataDto) {
    const { search, filter, sort, limit, page } = dto;

    const qb: SelectQueryBuilder<SensorData> = this.sensorRepo.createQueryBuilder('s');

  let orderColumn = 's.id';
    if (search && search.trim() !== '') {
      const trimmed = search.trim();

      // Regex patterns
      const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
      const dateHour = /^\d{4}-\d{2}-\d{2} \d{2}$/;
      const dateMinute = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
      const dateSecond = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
      if((filter === 'all' || filter === 'time') && (dateOnly.test(trimmed) || dateHour.test(trimmed) || dateMinute.test(trimmed) || dateSecond.test(trimmed))) {
        // 1. Nếu search là ngày/giờ
            let format = '%Y-%m-%d';
            if (dateHour.test(trimmed)) format = '%Y-%m-%d %H';
            else if (dateMinute.test(trimmed)) format = '%Y-%m-%d %H:%i';
            else if (dateSecond.test(trimmed)) format = '%Y-%m-%d %H:%i:%s';

            qb.andWhere(`DATE_FORMAT(s.created_at, '${format}') LIKE :dateStr`, {
              dateStr: `${trimmed}%`,
            });
            orderColumn = 's.createdAt';
        
        }
     else   {
       // 2. Nếu search là số
      if (!isNaN(parseFloat(trimmed))) {
        const searchPrefix = `${trimmed}%`;

        if (filter && ['temperature', 'humidity', 'light', 'time'].includes(filter)) {
          // chỉ tìm trong đúng cột filter
          qb.andWhere(`CAST(s.${filter} AS CHAR) LIKE :searchPrefix`, { searchPrefix });
          orderColumn = `s.${filter}`;
        } else {
          // không filter thì tìm cả 3
          qb.andWhere(
            `(CAST(s.temperature AS CHAR) LIKE :searchPrefix OR 
              CAST(s.humidity AS CHAR) LIKE :searchPrefix OR 
              CAST(s.light AS CHAR) LIKE :searchPrefix)`,
            { searchPrefix }
          );
          orderColumn = '';
        }
      } 
      // 3. Chuỗi khác
      else {
        const searchValue = `%${trimmed}%`;
        qb.andWhere(
          `(CAST(s.temperature AS CHAR) LIKE :search OR 
            CAST(s.humidity AS CHAR) LIKE :search OR 
            CAST(s.light AS CHAR) LIKE :search OR 
            DATE_FORMAT(s.created_at, '%Y-%m-%d %H:%i:%s') LIKE :search)`,
          { search: searchValue }
        );
      }
     }

    // console.log("🔍 Search input BE:", `"${trimmed}"`);
    // console.log("🔍 Generated SQL:", qb.getSql());
  }


  // // Sort
  // if (filter && ['temperature', 'humidity', 'light', 'time'].includes(filter)) {
  //   orderColumn = filter === 'time' ? 's.createdAt' : `s.${filter}`;
  // }
  
  let order: 'ASC' | 'DESC' = 'DESC';
  if (sort && ['asc', 'desc'].includes(sort.toLowerCase())) {
    order = sort.toUpperCase() as 'ASC' | 'DESC';
  }
  qb.orderBy(orderColumn, order);


    // ----------------
    // PAGINATION
    // ----------------
    const currentPage = page && page > 0 ? page : 1;
    const safeLimit = limit && limit > 0 ? limit : 10;
    const skip = (currentPage - 1) * safeLimit;

    qb.take(safeLimit).skip(skip);

    // ----------------
    // EXECUTE QUERY
    // ----------------
    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / safeLimit),
    };
  }
 


}