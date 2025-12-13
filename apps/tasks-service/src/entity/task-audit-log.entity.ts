import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_audit_logs')
@Index(['taskId', 'createdAt'])
export class TaskAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Task, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'taskId' })
  task!: Task;

  @Column('uuid')
  taskId!: string;

  @Column()
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  before!: any;

  @Column({ type: 'jsonb', nullable: true })
  after!: any;

  @Column({ nullable: true })
  actorId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}