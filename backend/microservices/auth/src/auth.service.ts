import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from './repositories/user.repository';
import { TenantRepository } from './repositories/tenant.repository';
import { User, UserRole } from './entities/user.entity';
import { Tenant, TenantPlan, TenantStatus } from './entities/tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private tenantRepository: TenantRepository,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Check tenant status if user belongs to a tenant
    if (user.tenantId) {
      const tenant = await this.tenantRepository.findById(user.tenantId);
      
      if (tenant && tenant.status === TenantStatus.SUSPENDED) {
        throw new UnauthorizedException('This store is currently suspended');
      }
    }
    
    // Update last login
    await this.userRepository.updateLastLogin(user.id);
    
    // Remove sensitive data
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role, 
      tenantId: user.tenantId 
    };
    
    // Generate tokens
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { 
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d')
      }
    );

    // Save refresh token in database
    await this.userRepository.updateRefreshToken(user.id, refreshToken);
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      }
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      
      const user = await this.userRepository.findById(payload.sub);
      
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      
      // Generate new access token
      const newPayload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role, 
        tenantId: user.tenantId 
      };
      
      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async registerTenant(
    tenantData: {
      name: string;
      subdomain: string;
      plan: TenantPlan;
    },
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
  ) {
    // Check if subdomain already exists
    const existingTenant = await this.tenantRepository.findBySubdomain(tenantData.subdomain);
    if (existingTenant) {
      throw new ConflictException('Subdomain already in use');
    }
    
    // Check if user email already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    
    // Create tenant
    const tenant = await this.tenantRepository.create({
      ...tenantData,
      status: TenantStatus.TRIAL,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });
    
    // Create tenant owner user
    const user = await this.userRepository.create({
      ...userData,
      role: UserRole.TENANT_OWNER,
      tenantId: tenant.id,
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: uuidv4(),
    });
    
    // TODO: Send verification email
    
    return { tenant, user: { id: user.id, email: user.email } };
  }

  async verifyEmail(token: string) {
    // Find user by verification token
    const users = await this.userRepository.findByTenant(null); // Need to modify repository to find by token
    const user = users.find(u => u.emailVerificationToken === token);
    
    if (!user) {
      throw new BadRequestException('Invalid verification token');
    }
    
    // Mark email as verified
    await this.userRepository.markEmailAsVerified(user.id);
    
    return { message: 'Email verified successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      // Don't reveal user existence, just return success
      return { message: 'If your email is registered, you will receive reset instructions' };
    }
    
    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    await this.userRepository.setPasswordResetToken(user.id, resetToken, resetExpires);
    
    // TODO: Send password reset email
    
    return { message: 'If your email is registered, you will receive reset instructions' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Find user by reset token
    const users = await this.userRepository.findByTenant(null); // Need to modify repository to find by token
    const user = users.find(u => 
      u.passwordResetToken === token && 
      u.passwordResetExpires > new Date()
    );
    
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    
    // Update password
    await this.userRepository.updatePassword(user.id, newPassword);
    
    // Clear reset token
    await this.userRepository.setPasswordResetToken(user.id, null, null);
    
    return { message: 'Password updated successfully' };
  }

  async checkTenantStatus(tenantId: string) {
    const tenant = await this.tenantRepository.findById(tenantId);
    
    if (!tenant) {
      throw new BadRequestException('Tenant not found');
    }
    
    return {
      status: tenant.status,
      isActive: tenant.isActive,
      isPaymentOverdue: tenant.isPaymentOverdue,
      plan: tenant.plan,
      trialEndsAt: tenant.trialEndsAt,
      subscriptionEndsAt: tenant.subscriptionEndsAt,
    };
  }

  async updateTenantStatus(tenantId: string, status: TenantStatus) {
    await this.tenantRepository.updateStatus(tenantId, status);
    return { message: 'Tenant status updated successfully' };
  }

  async processAsaasWebhook(data: any) {
    // Handle payment confirmations and subscription events from Asaas
    const { event, payment, subscription } = data;
    
    if (event === 'PAYMENT_CONFIRMED') {
      // Update tenant payment status
      const tenant = await this.tenantRepository.findAll()
        .then(tenants => tenants.find(t => t.asaasCustomerId === payment.customer));
        
      if (tenant) {
        await this.tenantRepository.reactivateTenant(tenant.id);
      }
    }
    
    if (event === 'PAYMENT_OVERDUE') {
      // Mark tenant as overdue
      const tenant = await this.tenantRepository.findAll()
        .then(tenants => tenants.find(t => t.asaasCustomerId === payment.customer));
        
      if (tenant) {
        await this.tenantRepository.markOverdue(tenant.id);
      }
    }
    
    if (event === 'SUBSCRIPTION_CANCELLED') {
      // Suspend tenant
      const tenant = await this.tenantRepository.findAll()
        .then(tenants => tenants.find(t => t.asaasSubscriptionId === subscription.id));
        
      if (tenant) {
        await this.tenantRepository.suspendTenant(tenant.id);
      }
    }
    
    return { message: 'Webhook processed successfully' };
  }

  async logout(userId: string) {
    // Clear refresh token
    await this.userRepository.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }
}
