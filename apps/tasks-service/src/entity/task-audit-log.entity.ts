import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}