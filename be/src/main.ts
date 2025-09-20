import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // // Kết nối tới MQTT Broker
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.MQTT,
  //   options: {
  //     url: 'mqtt://localhost:1883',
  //     clientId: 'nestjs-subscriber-' + Math.random().toString(16).slice(2),
  //     username: process.env.MQTT_USER,   // lấy từ .env cho bảo mật
  //     password: process.env.MQTT_PASS,
  //   },
  // });

  // Bật CORS cho frontend
    app.enableCors();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);

  console.log(`🚀 NestJS HTTP server running on port ${process.env.PORT ?? 3000}`);
  console.log('📡 MQTT microservice connected...');
}
bootstrap();
