import { Test, TestingModule } from '@nestjs/testing';
import { PasswordResetService } from '../password-reset.service';
import { UserRepository } from '../../repositories/user.repository';
import { PasswordResetRepository } from '../../repositories/password-reset.repository';
import { LoggerService } from '../../logger';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let users: jest.Mocked<UserRepository>;
  let resets: jest.Mocked<PasswordResetRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: PasswordResetRepository,
          useValue: {
            saveToken: jest.fn(),
            findValidToken: jest.fn(),
            invalidateToken: jest.fn(),
            checkDatabaseHealthPassword: jest.fn(),
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

    service = module.get(PasswordResetService);
    users = module.get(UserRepository);
    resets = module.get(PasswordResetRepository);
  });

  describe('generate', () => {
    it('retorna mensagem genérica se usuário não existir', async () => {
      users.findByEmail.mockResolvedValue(null);

      const result = await service.generate({
        email: 'x@test.com',
        username: 'xtest',
      });

      expect(result).toEqual({
        message: 'If user exists, token was generated',
      });
      expect(resets.saveToken).not.toHaveBeenCalled();
    });

    it('gera token e salva hash se usuário existir', async () => {
      users.findByEmail.mockResolvedValue({ id: 'user-1' } as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');

      const result = await service.generate({
        email: 'x@test.com',
        username: 'xtest',
      });

      expect(resets.saveToken).toHaveBeenCalled();
      expect(result).toHaveProperty('resetToken');
      expect(result.expiresIn).toBe('10 minutes');
    });
  });

  describe('reset', () => {
    it('falha se token não existir', async () => {
      resets.findValidToken.mockResolvedValue(null);

      await expect(
        service.reset({ token: 'x', newPassword: '123456' }),
      ).rejects.toBeInstanceOf(RpcException);
    });

    it('falha se token for inválido', async () => {
      resets.findValidToken.mockResolvedValue({
        tokenHash: 'hash',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.reset({ token: 'x', newPassword: '123456' }),
      ).rejects.toBeInstanceOf(RpcException);
    });

    it('reseta senha com token válido', async () => {
      resets.findValidToken.mockResolvedValue({
        id: 'reset-1',
        userId: 'user-1',
        tokenHash: 'hash',
      } as any);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await service.reset({
        token: 'valid',
        newPassword: '123456',
      });

      expect(users.updatePassword).toHaveBeenCalled();
      expect(resets.invalidateToken).toHaveBeenCalledWith('reset-1');
      expect(result.message).toBe('Password updated successfully');
    });
  });

  describe('healthCheckPasswordDatabase', () => {
    it('retorna up se DB estiver ok', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.healthCheckPasswordDatabase();

      expect(result).toBe('up');
    });

    it('retorna down se DB falhar', async () => {
      resets.checkDatabaseHealthPassword.mockRejectedValue(new Error());

      const result = await service.healthCheckPasswordDatabase();

      expect(result).toBe('down');
    });
  });
});
