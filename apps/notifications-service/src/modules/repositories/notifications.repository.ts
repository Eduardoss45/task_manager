import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../entities/notifications.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(data: Partial<Notification>) {
    return this.repo.save(data);
  }

  async checkDatabaseHealthNotifications(): Promise<boolean> {
    try {
      await this.repo.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
