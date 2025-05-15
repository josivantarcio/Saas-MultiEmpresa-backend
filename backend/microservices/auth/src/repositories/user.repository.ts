import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role', 'isActive', 'tenantId'] 
    });
  }

  async findByTenant(tenantId: string): Promise<User[]> {
    return this.userRepository.find({ where: { tenantId } });
  }

  async findTenantOwners(): Promise<User[]> {
    return this.userRepository.find({ 
      where: { role: UserRole.TENANT_OWNER },
      relations: ['tenant']
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findById(id);
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.userRepository.update(id, { refreshToken });
  }

  async markEmailAsVerified(id: string): Promise<void> {
    await this.userRepository.update(id, { 
      isEmailVerified: true,
      emailVerificationToken: null
    });
  }

  async setPasswordResetToken(id: string, token: string, expires: Date): Promise<void> {
    await this.userRepository.update(id, {
      passwordResetToken: token,
      passwordResetExpires: expires
    });
  }

  async updatePassword(id: string, password: string): Promise<void> {
    const user = await this.findById(id);
    user.password = password;
    await this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLogin: new Date() });
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
