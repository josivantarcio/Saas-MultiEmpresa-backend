import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user.repository';
import { TenantRepository } from '../repositories/tenant.repository';
import { TenantStatus } from '../entities/tenant.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
    private tenantRepository: TenantRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const { sub: userId, tenantId } = payload;
    
    // Find the user
    const user = await this.userRepository.findById(userId);
    
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    
    // If user belongs to a tenant, check tenant status
    if (tenantId) {
      const tenant = await this.tenantRepository.findById(tenantId);
      
      if (!tenant) {
        throw new UnauthorizedException('Tenant not found');
      }
      
      // Check if tenant is suspended or has payment issues
      if (
        tenant.status === TenantStatus.SUSPENDED || 
        (tenant.isPaymentOverdue && tenant.status === TenantStatus.PENDING_PAYMENT)
      ) {
        throw new UnauthorizedException(
          'This store is currently suspended. Please contact support or make a payment to reactivate.'
        );
      }
    }
    
    // Return user data (without sensitive information)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }
}
