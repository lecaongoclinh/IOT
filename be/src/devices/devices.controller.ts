// src/devices/devices.controller.ts
import { Controller, Post, Param, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

    @Post(':id/control')
    async controlDevice(
        @Param('id') id: string,
        @Body('action') action: string,
    ) {
        if (!['on', 'off', 'blink'].includes(action)) {
        throw new HttpException(
            'Action không hợp lệ (chỉ hỗ trợ on/off/blink)',
            HttpStatus.BAD_REQUEST,
        );
        }

        try {
        return await this.devicesService.controlDevice(id, action);
        } catch (err) {
        throw new HttpException(err.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async findAll() {
        return this.devicesService.findAll();
    }
}
