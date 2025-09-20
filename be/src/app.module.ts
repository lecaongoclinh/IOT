import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DevicesModule } from './devices/devices.module';
import { DataSensorModule } from './data_sensor/data_sensor.module';
import { ActionHistoryModule } from './action_history/action_history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorData } from './data_sensor/entities/sensor_data.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MqttModule } from './mqtt/mqtt.module';
import { Device } from './devices/entities/device.entity';
import { ActionHistory } from './action_history/entities/action-history.entity';

@Module({
  imports: [
    // 🔹 Load biến môi trường từ file .env
    ConfigModule.forRoot({
      isGlobal: true, // để các module khác không cần import lại
    }),

    DevicesModule,
    DataSensorModule,
    ActionHistoryModule,

    // 🔹 TypeORM config
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [SensorData, Device, ActionHistory],
        synchronize: false, // chỉ bật khi dev
      }),
    }),

    MqttModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
