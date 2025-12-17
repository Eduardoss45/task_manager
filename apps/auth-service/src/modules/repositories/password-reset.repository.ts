import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull } from 'typeorm';
import { PasswordReset } from '../entities/password-reset.entity';

@Injectable()
export class PasswordResetRepository {
  constructor(
    @InjectRepository(PasswordReset)
    private repo: Repository<PasswordReset>,
  ) {}

  saveToken(data: Partial<PasswordReset>) {
    const token = this.repo.create(data);
    return this.repo.save(token);
  }

  findValidToken() {
    return this.repo.findOne({
      where: {
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
  }

  invalidateToken(id: string) {
    return this.repo.update(id, { usedAt: new Date() });
  }

  async checkDatabaseHealthPassword(): Promise<boolean> {
    try {
      await this.repo.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
