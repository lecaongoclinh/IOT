import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesService } from './devices.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Device } from './entities/device.entity';
import { ActionHistory } from 'src/action_history/entities/action-history.entity';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [TypeOrmModule.forFeature([Device, ActionHistory]), MqttModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
