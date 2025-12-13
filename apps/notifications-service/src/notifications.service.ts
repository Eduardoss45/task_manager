import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async handleTaskCreated(data: any) {
    console.log('📢 NOTIFY - Task created:', data);
  }

  async handleTaskUpdated(data: any) {
    console.log('📢 NOTIFY - Task updated:', data);
  }

  async handleTaskDeleted(data: any) {
    console.log('📢 NOTIFY - Task deleted:', data);
  }

  async handleCommentCreated(data: any) {
    console.log('📢 NOTIFY - New comment:', data);
  }
}
