import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'sensor_data' })
export class SensorData {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity: number;

  @Column({ type: 'int', nullable: true })
  light: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

}
