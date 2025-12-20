import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string = '';

  @Index()
  @Column()
  userId: string = '';

  @Column()
  type: string = '';

  @Column({ type: 'jsonb' })
  payload!: Record<string, any>;

  @Column({ default: false })
  read: boolean = false;

  @CreateDateColumn()
  createdAt!: Date;
}
