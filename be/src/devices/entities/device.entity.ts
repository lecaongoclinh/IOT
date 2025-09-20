import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ActionHistory } from '../../action_history/entities/action-history.entity';

@Entity({ name: 'devices' })
export class Device {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  // 1 device có nhiều action history
  @OneToMany(() => ActionHistory, (action) => action.device)
  actions: ActionHistory[];
}
