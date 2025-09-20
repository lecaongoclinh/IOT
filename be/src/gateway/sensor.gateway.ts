import { WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody,} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SensorData } from '../data_sensor/entities/sensor_data.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // cho phép frontend connect
  },
})
export class SensorGateway {
  @WebSocketServer()
  server: Server;

  broadcastSensorData(data: SensorData) {
    this.server.emit('sensor_update', data);
  }
}