// src/devices/devices.controller.ts
import { Controller, Post, Param, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { ApiBody, ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';

class ControlDeviceDto {
  @ApiProperty({ description: 'ID của thiết bị', example: '1' })
  id: string; 

  @ApiProperty({ 
    description: 'Hành động cần thực hiện', 
    enum: ['on', 'off'], 
    example: 'on', default: 'on'
  })
  action: string; // ví dụ: 'on' hoặc 'off'
} 


@ApiTags('Devices')
@Controller('device')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

    @Post('control')
    @ApiOperation({ summary: 'Điều khiển thiết bị (bật/tắt)' })
    
    async controlDevice(
       @Body() controlDeviceDto: ControlDeviceDto
    ) {
        const { id, action } = controlDeviceDto;
        if (!['on', 'off', 'blink'].includes(action)) {
        throw new HttpException(
            'Action không hợp lệ (chỉ hỗ trợ on/off)',
            HttpStatus.BAD_REQUEST,
        );
        }

        try {
        return await this.devicesService.controlDevice(id, action);
        } catch (err) {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('status')
    @ApiOperation({ summary: 'Lấy trạng thái của thiết bị' })
    async getAllDeviceStatus() {
        try {
            return await this.devicesService.getAllDeviceStatus();
        } catch (err) {
            throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        } 
    }
}
