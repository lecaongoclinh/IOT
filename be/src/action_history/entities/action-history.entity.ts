import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

@Entity({ name: 'action_history' })
export class ActionHistory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ name: 'device_id', type: 'varchar', length: 50 })
  deviceId: string;

  @Column({ type: 'varchar', length: 50 })
  action: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Device, (device) => device.actions, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;
}
