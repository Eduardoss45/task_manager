import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../notifications.service';
import { NotificationRepository } from '../../repositories/notifications.repository';
import { ClientProxy } from '@nestjs/microservices';
import { LoggerService } from '@task_manager/logger';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let notifications: jest.Mocked<NotificationRepository>;
  let gatewayClient: jest.Mocked<ClientProxy>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationRepository,
          useValue: {
            create: jest.fn(),
            checkDatabaseHealthNotifications: jest.fn(),
          },
        },
        {
          provide: 'GATEWAY_NOTIFICATIONS_CLIENT',
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationsService);
    notifications = module.get(NotificationRepository);
    gatewayClient = module.get('GATEWAY_NOTIFICATIONS_CLIENT');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('notifica usuários atribuídos exceto o ator (task.created)', async () => {
    notifications.create.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-1',
      type: 'task:created',
      payload: {},
    } as any);

    await service.handleTaskCreated({
      actorId: 'user-1',
      task: {
        id: 'task-1',
        assignedUserIds: ['user-1', 'user-2', 'user-3'],
      },
    });

    expect(notifications.create).toHaveBeenCalledTimes(2);
    expect(gatewayClient.emit).toHaveBeenCalledTimes(2);

    expect(gatewayClient.emit).toHaveBeenCalledWith(
      'notification.dispatch',
      expect.objectContaining({
        userId: 'user-2',
        type: 'task:created',
      }),
    );
  });

  it('notifica novos atribuídos e owner quando status muda (task.updated)', async () => {
    notifications.create.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-1',
      type: 'task:created',
      payload: {},
    } as any);

    await service.handleTaskUpdated({
      actorId: 'user-1',
      task: {
        id: 'task-1',
        ownerId: 'owner-1',
      },
      before: {
        assignedUserIds: ['user-2'],
        status: 'open',
      },
      after: {
        assignedUserIds: ['user-2', 'user-3'],
        status: 'done',
      },
    });

    expect(notifications.create).toHaveBeenCalledTimes(2);
    expect(gatewayClient.emit).toHaveBeenCalledTimes(2);

    expect(gatewayClient.emit).toHaveBeenCalledWith(
      'notification.dispatch',
      expect.objectContaining({ userId: 'user-3' }),
    );

    expect(gatewayClient.emit).toHaveBeenCalledWith(
      'notification.dispatch',
      expect.objectContaining({ userId: 'owner-1' }),
    );
  });

  it('notifica owner e atribuídos exceto ator (comment.created)', async () => {
    notifications.create.mockResolvedValue({
      id: 'notif-1',
      userId: 'user-1',
      type: 'task:created',
      payload: {},
    } as any);

    await service.handleCommentCreated({
      actorId: 'user-1',
      task: {
        id: 'task-1',
        ownerId: 'owner-1',
        assignedUserIds: ['user-1', 'user-2'],
      },
    });

    expect(notifications.create).toHaveBeenCalledTimes(2);
    expect(gatewayClient.emit).toHaveBeenCalledTimes(2);

    expect(gatewayClient.emit).toHaveBeenCalledWith(
      'notification.dispatch',
      expect.objectContaining({ userId: 'owner-1' }),
    );

    expect(gatewayClient.emit).toHaveBeenCalledWith(
      'notification.dispatch',
      expect.objectContaining({ userId: 'user-2' }),
    );
  });

  it('retorna up se banco estiver saudável', async () => {
    process.env.RMQ_URL = 'amqp://localhost';
    process.env.DATABASE_URL = 'postgres://test';

    notifications.checkDatabaseHealthNotifications.mockResolvedValue(true);

    const result = await service.healthCheckNotificationsDatabase();

    expect(result).toBe('up');
  });

  it('retorna down se faltar variável de ambiente', async () => {
    delete process.env.RMQ_URL;

    const result = await service.healthCheckNotificationsDatabase();

    expect(result).toBe('down');
  });

  it('retorna down se o banco falhar', async () => {
    process.env.RMQ_URL = 'amqp://localhost';
    process.env.DATABASE_URL = 'postgres://test';

    notifications.checkDatabaseHealthNotifications.mockRejectedValue(
      new Error('db down'),
    );

    const result = await service.healthCheckNotificationsDatabase();

    expect(result).toBe('down');
  });
});
