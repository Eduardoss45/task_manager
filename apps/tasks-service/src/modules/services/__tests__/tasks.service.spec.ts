import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { TasksRepository } from '../../repositories/tasks.repository';
import { TaskAuditService } from '../task-audit.service';
import { LoggerService } from '@task_manager/logger';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

const repoMock = {
  findTasks: jest.fn(),
  createTask: jest.fn(),
  findTaskById: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  createComment: jest.fn(),
  findComments: jest.fn(),
  checkDatabaseHealthTasksAndComments: jest.fn(),
};

const auditMock = {
  log: jest.fn(),
  getByTask: jest.fn(),
  healthCheckAuditDatabase: jest.fn(),
};

const clientMock = {
  emit: jest.fn().mockReturnValue(of(null)),
  send: jest.fn(),
};

const loggerMock = {
  info: jest.fn(),
};

let service: TasksService;

beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      TasksService,
      { provide: TasksRepository, useValue: repoMock },
      { provide: TaskAuditService, useValue: auditMock },
      { provide: 'NOTIFICATIONS_EVENTS', useValue: clientMock },
      { provide: LoggerService, useValue: loggerMock },
    ],
  }).compile();

  service = module.get(TasksService);
  jest.clearAllMocks();
});

const validTaskId = '123e4567-e89b-12d3-a456-426614174000';
const validAuthorId = '987e6543-e21b-12d3-a456-426655440000';

describe('TasksService', () => {
  it('should fetch tasks with pagination', async () => {
    repoMock.findTasks.mockResolvedValue(['task']);

    const result = await service.getTasks(1, 10);

    expect(repoMock.findTasks).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual(['task']);
  });

  it('should create task, log audit and emit event', async () => {
    const task = {
      title: 'Task',
      assignedUserIds: [],
      authorId: validAuthorId,
      authorName: 'John',
    };

    const createdTask = {
      id: validTaskId,
      title: 'Task',
      authorId: validAuthorId,
      authorName: 'John',
      assignedUserIds: [],
    };

    repoMock.createTask.mockResolvedValue(createdTask);

    const result = await service.createTask(task as any);

    expect(repoMock.createTask).toHaveBeenCalled();
    expect(auditMock.log).toHaveBeenCalled();
    expect(clientMock.emit).toHaveBeenCalledWith(
      'task.created',
      expect.any(Object),
    );
    expect(result).toEqual(createdTask);
  });

  it('should throw if author is assigned to task', async () => {
    await expect(
      service.createTask({
        title: 'Task',
        authorId: validAuthorId,
        assignedUserIds: [{ userId: validAuthorId, username: 'John' }],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw if assigned users are duplicated', async () => {
    await expect(
      service.createTask({
        title: 'Task',
        assignedUserIds: [
          { userId: '111e1111-e11b-12d3-a456-426614174001', username: 'A' },
          { userId: '111e1111-e11b-12d3-a456-426614174001', username: 'A' },
        ],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw if task not found', async () => {
    repoMock.findTaskById.mockResolvedValue(null);

    await expect(service.getTask(validTaskId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should update task and emit update event', async () => {
    const before = {
      id: validTaskId,
      title: 'Old',
      status: 'TODO',
      assignedUserIds: [],
      authorId: validAuthorId,
      authorName: 'John',
    };

    const after = { ...before, title: 'New' };

    repoMock.findTaskById
      .mockResolvedValueOnce(before)
      .mockResolvedValueOnce(after);

    await service.updateTask(validTaskId, { title: 'New' } as any);

    expect(repoMock.updateTask).toHaveBeenCalled();
    expect(auditMock.log).toHaveBeenCalled();
    expect(clientMock.emit).toHaveBeenCalledWith(
      'task.updated',
      expect.any(Object),
    );
  });

  it('should delete task', async () => {
    repoMock.findTaskById.mockResolvedValue({ id: validTaskId });

    const result = await service.deleteTask(validTaskId);

    expect(repoMock.deleteTask).toHaveBeenCalledWith(validTaskId);
    expect(result).toEqual({ deleted: true });
  });

  it('should return up when everything is healthy', async () => {
    process.env.RMQ_URL = 'rmq';
    process.env.DATABASE_URL = 'db';

    repoMock.checkDatabaseHealthTasksAndComments.mockResolvedValue(true);
    clientMock.send.mockReturnValue(of('up'));

    const result = await service.healthCheckTasksDatabase();

    expect(result).toEqual({ tasks: 'up', notifications: 'up' });
  });
});
