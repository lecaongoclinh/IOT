import { IsOptional, IsString, IsIn, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetActionHistoryDto {
  @IsOptional()
  @IsString()
  search?: string; // tìm kiếm theo deviceId, action hoặc ngày

  @IsOptional()
  @IsIn(['all', '1', '2', '3', 'time'])
  filter?: string = 'all'; // lọc theo cột

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: string = 'asc'; // thứ tự sắp xếp

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10; // số bản ghi trên 1 page

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1; // số trang
}
