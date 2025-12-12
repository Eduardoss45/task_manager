import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../task.entity';
import { Comment } from '../comment.entity';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private tasksRepo: Repository<Task>,

    @InjectRepository(Comment)
    private commentsRepo: Repository<Comment>,
  ) {}

  createTask(task: Partial<Task>) {
    return this.tasksRepo.save(this.tasksRepo.create(task));
  }

  findTasks(page: number, size: number) {
    return this.tasksRepo.find({ skip: (page - 1) * size, take: size });
  }

  findTaskById(id: string) {
    return this.tasksRepo.findOne({ where: { id }, relations: ['comments'] });
  }

  updateTask(id: string, updates: Partial<Task>) {
    return this.tasksRepo.update(id, updates);
  }

  deleteTask(id: string) {
    return this.tasksRepo.delete(id);
  }

  createComment(comment: Partial<Comment>) {
    return this.commentsRepo.save(this.commentsRepo.create(comment));
  }

  findComments(taskId: string, page: number, size: number) {
    return this.commentsRepo.find({
      where: { task: { id: taskId } },
      skip: (page - 1) * size,
      take: size,
    });
  }
}
