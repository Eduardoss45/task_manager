import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private repo: Repository<User>,
  ) {}

  createUser(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  updateRefreshToken(userId: string, hash: string | null) {
    return this.repo.update(userId, { refreshTokenHash: hash ?? undefined });
  }

  updatePassword(userId: string, password: string) {
    return this.repo.update(userId, { password });
  }

  async findAvailableUsers(excludeUserId: string) {
    return this.repo.find({
      where: { id: Not(excludeUserId) },
      select: ['id', 'username'],
    });
  }

  async checkDatabaseHealthUser(): Promise<boolean> {
    try {
      await this.repo.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }
}
