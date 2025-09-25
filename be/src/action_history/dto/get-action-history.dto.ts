import { IsOptional, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class GetActionHistoryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo thời gian',
    example: '2025-09-25 23:28',
    default: '2025-09-25 23:28',
  })
  @IsOptional()
  @IsString()
  search?: string; // tìm kiếm theo deviceId, action hoặc ngày

  @ApiPropertyOptional({
    description: 'Lọc theo thiết bị/thời gian',
    enum: ['all', '1', '2', '3', 'time'],
    default: 'time',
    example: 'time',
  })
  @IsOptional()
  @IsIn(['all', '1', '2', '3', 'time'])
  filter?: string = 'all'; // lọc theo cột

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    default: 'asc',
    example: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: string = 'asc'; // thứ tự sắp xếp

  @ApiPropertyOptional({
    description: 'Số bản ghi trên 1 trang',
    minimum: 1,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10; // số bản ghi trên 1 page

  @ApiPropertyOptional({
    description: 'Số trang',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1; // số trang
}
