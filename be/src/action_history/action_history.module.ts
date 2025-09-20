import { Module } from '@nestjs/common';
import { ActionHistoryController } from './action_history.controller';
import { ActionHistoryService } from './action_history.service';
import { MqttModule } from 'src/mqtt/mqtt.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { ActionHistory } from './entities/action-history.entity';

@Module({
  imports:  [TypeOrmModule.forFeature([ActionHistory]), MqttModule],
  controllers: [ActionHistoryController],
  providers: [ActionHistoryService]
})
export class ActionHistoryModule {}
