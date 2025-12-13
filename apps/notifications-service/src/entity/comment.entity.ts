import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  text!: string;

  @Column()
  authorId!: string;

  @ManyToOne(() => Task, (task) => task.comments)
  task!: Task;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
