// src/devices/devices.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionHistory } from '../action_history/entities/action-history.entity';
import { Device } from '../devices/entities/device.entity';
import { MqttService } from '../mqtt/mqtt.service';
@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,
    @InjectRepository(ActionHistory)
    private historyRepo: Repository<ActionHistory>,
    private mqttService: MqttService,
  ) {}

  findAll(): Promise<Device[]> {
    return this.deviceRepo.find();
  }

  async controlDevice(deviceId: string, action: string) {
    console.log('📌 controlDevice called:', { deviceId, action });

    const device = await this.deviceRepo.findOne({ where: { id: deviceId } });
    if (!device) {
        console.error('❌ Device not found:', deviceId);
        throw new Error('Thiết bị không tồn tại');
    }

    const history = this.historyRepo.create({ deviceId, action });
    // await this.historyRepo.save(history);
    console.log('💾 Action history saved:', history);

    const payload = {};
    payload[`led${deviceId}`] = action;
    console.log('📤 Publishing payload to ESP32:', payload);

    try {
        const result = await this.sendCommandAndWaitAck(payload, `led${deviceId}`);
        console.log('📥 ESP32 response:', result);

        //Lưu lịch sử vào database
        if (result.status === 'ok') {
            await this.historyRepo.save(history);
            console.log('💾 Action history saved after ACK:', history);
        }
        return { success: result.status === 'ok', deviceId, action };
    } catch (err) {
        console.error('🚨 sendCommandAndWaitAck error:', err.message);
        throw err;
    }
}


  private sendCommandAndWaitAck(payload: any, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
        console.log('⏳ Waiting for ESP32 ack...');
        const timeout = setTimeout(() => {
            console.error('❌ Timeout: Không nhận được phản hồi từ ESP32');
            reject(new Error('Không nhận được phản hồi từ ESP32'));
        }, 5000);

        const handler = (topic: string, message: Buffer) => {
            try {
                console.log('📥 MQTT message received:', topic, message.toString());
                if (topic === 'esp32/ack') {
                    const data = JSON.parse(message.toString());
                    if (data[key]) {
                        clearTimeout(timeout);
                        this.mqttService.client.removeListener('message', handler);
                        console.log('✅ Ack received from ESP32:', data);
                        resolve(data);
                    }
                }
            } catch (e) {
                console.error('❌ MQTT parse error:', e.message);
            }
        };

        this.mqttService.client.on('message', handler);
        this.mqttService.publish('esp32/control', payload);
    });
}

}