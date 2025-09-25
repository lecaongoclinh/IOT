import { IsOptional, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class GetSensorDataDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm theo chuỗi (ví dụ: 30, 2025-09-25 23:34)',
    example: '2025-09-25 23:34',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc dữ liệu theo loại',
    enum: ['all', 'temperature', 'humidity', 'light', 'time'],
    default: 'all',
    example: 'time',
  })
  @IsOptional()
  @IsIn(['all', 'temperature', 'humidity', 'light', 'time'])
  filter?: string = 'all';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    default: 'asc',
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: string = 'asc';

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi mỗi trang',
    minimum: 1,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Trang hiện tại',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;
}
