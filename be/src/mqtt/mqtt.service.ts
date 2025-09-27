// src/mqtt/mqtt.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { Subject } from 'rxjs';

@Injectable()
export class MqttService implements OnModuleInit {
  public client: MqttClient;
  public data$ = new Subject<any>();

  onModuleInit() {
    this.client = connect('mqtt://172.20.10.3:1883', {
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
      clientId: 'nestjs-' + Math.random().toString(16).slice(2),
    });

    this.client.on('connect', () => {
      console.log('📡 MQTT connected');
      this.client.subscribe('esp32/data', (err) => {
        if (err) console.error('❌ Subscribe lỗi esp32/data', err);
      });
    });
    this.client.on('connect', () => {
          console.log('📡 MQTT connected');
          this.client.subscribe('esp32/ack', (err) => {
            if (err) console.error('❌ Subscribe lỗi esp32/ack', err);
            else console.log('✅ Subscribed to esp32/ack');
          });
        });
    this.client.on('message', (topic, payload) => {
      if (topic === 'esp32/data') {
        try {
          const data = JSON.parse(payload.toString());
          this.data$.next(data); // forward dữ liệu ra observable
        } catch (err) {
          console.error('❌ MQTT parse error:', err.message);
        }
      }
    });
    this.client.on('message', (topic, payload) => {
      // console.log(`📥 [${topic}] ${payload.toString()}`);
    });
  }

  publish(topic: string, message: any) {
    this.client.publish(topic, JSON.stringify(message));
  }

  subscribe(topic: string) {
    this.client.subscribe(topic);
  }
}

