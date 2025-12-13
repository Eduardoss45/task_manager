import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('task_audit_logs')
export class TaskAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  taskId!: string;

  @Column()
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  before!: any;

  @Column({ type: 'jsonb', nullable: true })
  after!: any;

  @Column({ nullable: true })
  authorId!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;
}
