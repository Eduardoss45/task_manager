import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Comment } from './comment.entity';

import { TaskPriority, TaskStatus } from '../enums';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('uuid')
  authorId!: string;

  @Column()
  authorName!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.LOW })
  priority!: TaskPriority;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
  status!: TaskStatus;

  @Column('jsonb', { default: [] })
  assignedUserIds!: {
    username: string;
    userId: string;
  }[];

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
