import { Controller, Get, Logger, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {SensorService} from './data_sensor.service'
import { GetSensorDataDto } from './dto/get-sensor-data.dto';
import { MqttService } from '../mqtt/mqtt.service';
@Controller()
export class DataSensorController {
  private readonly logger = new Logger(DataSensorController.name);

  constructor(private readonly sensorService: SensorService, private readonly mqttService: MqttService,) {}

  // @MessagePattern('esp32/data')
  // handleSensorData(@Payload() message: any) {
  //   try {
  //     let payload: any;

  //     if (Buffer.isBuffer(message)) {
  //       // MQTT trả về Buffer
  //       payload = JSON.parse(message.toString());
  //     } else if (typeof message === 'string') {
  //       // MQTT trả về String
  //       payload = JSON.parse(message);
  //     } else if (typeof message === 'object') {
  //       // Nếu đã là Object rồi thì dùng luôn
  //       payload = message;
  //     } else {
  //       throw new Error('Unsupported MQTT message type');
  //     }

  //     this.logger.log(`✅ MQTT data: ${JSON.stringify(payload)}`);

  //     // Đẩy ra frontend qua WebSocket
  //     this.sensorService.saveSensorData(payload);
  //   } catch (err) {
  //     this.logger.error('❌ Invalid MQTT message format', err.stack);
  //   }
  // }
  onModuleInit() {
      // Subscribe dữ liệu sensor từ MqttService
      this.mqttService.data$.subscribe((payload) => {
        this.logger.log(`✅ MQTT data: ${JSON.stringify(payload)}`);
        this.sensorService.saveSensorData(payload);
      });
    }
  @Get('sensor-data')
  async getSensorData(@Query() query: GetSensorDataDto) {
    return this.sensorService.getSensorData(query);
  }
}
