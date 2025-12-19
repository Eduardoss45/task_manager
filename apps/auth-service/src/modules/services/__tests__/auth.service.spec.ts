import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../repositories/user.repository';
import { PasswordResetService } from '../password-reset.service';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../../logger';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UserRepository>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            createUser: jest.fn(),
            updateRefreshToken: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: PasswordResetService,
          useValue: {
            createResetToken: jest.fn(),
            resetPassword: jest.fn(),
            validateToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            verbose: jest.fn(),
            info: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    users = module.get(UserRepository);
    jwt = module.get(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registra usuário e retorna tokens', async () => {
    users.findByEmail.mockResolvedValue(null as any);
    users.createUser.mockResolvedValue({
      id: 'user-id',
      email: 'user@email.com',
      username: 'user',
    } as any);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (jwt.sign as jest.Mock)
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');
    const result = await service.register({
      email: 'user@email.com',
      username: 'user',
      password: '123456',
    });

    expect(result.user.email).toBe('user@email.com');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(users.updateRefreshToken).toHaveBeenCalled();
  });

  it('falha se email já existir', async () => {
    users.findByEmail.mockResolvedValue({ id: '1' } as any);

    await expect(
      service.register({
        email: 'user@email.com',
        username: 'user',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(RpcException);
  });

  it('autentica usuário com senha válida', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@email.com',
      username: 'user',
      password: 'hashed',
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-refresh-hash');

    (jwt.sign as jest.Mock)
      .mockReturnValueOnce('access-token')
      .mockReturnValueOnce('refresh-token');

    const result = await service.login({
      email: 'user@email.com',
      password: '123456',
    });

    expect(result.user.id).toBe('user-id');
    expect(result.accessToken).toBe('access-token');
    expect(users.updateRefreshToken).toHaveBeenCalled();
  });

  it('falha com senha inválida', async () => {
    users.findByEmail.mockResolvedValue({
      id: 'user-id',
      password: 'hashed',
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'user@email.com',
        password: 'wrong',
      }),
    ).rejects.toBeInstanceOf(RpcException);
  });

  it('renova tokens com refresh válido', async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ sub: 'user-id' });

    users.findById.mockResolvedValue({
      id: 'user-id',
      email: 'user@email.com',
      username: 'user',
      refreshTokenHash: 'hash',
    } as any);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-refresh-hash');

    jest
      .spyOn(jwt, 'sign')
      .mockReturnValueOnce('new-access')
      .mockReturnValueOnce('new-refresh');

    const result = await service.refresh('refresh-token');

    expect(result.accessToken).toBe('new-access');
    expect(users.updateRefreshToken).toHaveBeenCalled();
  });

  it('falha com refresh token inválido', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error();
    });

    await expect(service.refresh('invalid')).rejects.toBeDefined();
  });
});
