import { Module } from '@nestjs/common';
import { DataSensorController } from './data_sensor.controller';
import { SensorService } from './data_sensor.service';
import { SensorData } from './entities/sensor_data.entity';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { SensorGateway } from '../gateway/sensor.gateway';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [TypeOrmModule.forFeature([SensorData]), MqttModule],
  controllers: [DataSensorController],
  providers: [SensorService, SensorGateway],
  exports: [TypeOrmModule, SensorService, SensorGateway],
})
export class DataSensorModule {}
