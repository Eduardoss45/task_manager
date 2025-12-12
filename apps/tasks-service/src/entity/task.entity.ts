  import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
  } from 'typeorm';
  import { Comment } from './comment.entity';

  export enum Priority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT',
  }

  export enum Status {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    DONE = 'DONE',
  }

  @Entity('tasks')
  export class Task {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column({ type: 'timestamp' })
    dueDate!: Date;

    @Column({ type: 'enum', enum: Priority, default: Priority.LOW })
    priority!: Priority;

    @Column({ type: 'enum', enum: Status, default: Status.TODO })
    status!: Status;

    @Column('uuid', { array: true, default: [] })
    assignedUserIds!: string[];

    @OneToMany(() => Comment, (comment) => comment.task)
    comments!: Comment[];
  }
