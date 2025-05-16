import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { TenantRepository } from '../../src/repositories/tenant.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { TenantStatus, TenantPlan } from '../../src/entities/tenant.entity';
import { UserRole } from '../../src/entities/user.entity';

// Mock para bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockImplementation(() => 'hashedPassword'),
}));

// Mock dos repositórios e serviços
const mockUserRepository = () => ({
  findByEmail: jest.fn(),
  findById: jest.fn(),
  findByTenant: jest.fn(),
  create: jest.fn(),
  updateLastLogin: jest.fn(),
  updateRefreshToken: jest.fn(),
  markEmailAsVerified: jest.fn(),
  setPasswordResetToken: jest.fn(),
  updatePassword: jest.fn(),
});

const mockTenantRepository = () => ({
  findById: jest.fn(),
  findBySubdomain: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
  reactivateTenant: jest.fn(),
  markOverdue: jest.fn(),
  suspendTenant: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
  verify: jest.fn(),
});

const mockConfigService = () => ({
  get: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository;
  let tenantRepository;
  let jwtService;
  let configService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
        {
          provide: TenantRepository,
          useFactory: mockTenantRepository,
        },
        {
          provide: JwtService,
          useFactory: mockJwtService,
        },
        {
          provide: ConfigService,
          useFactory: mockConfigService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get<UserRepository>(UserRepository);
    tenantRepository = module.get<TenantRepository>(TenantRepository);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('validateUser', () => {
    it('deve validar um usuário com credenciais corretas', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        tenantId: 'tenant123',
      };

      const mockTenant = {
        id: 'tenant123',
        status: TenantStatus.ACTIVE,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      tenantRepository.findById.mockResolvedValue(mockTenant);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'password123');
      
      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        isActive: true,
        tenantId: 'tenant123',
      });
      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(tenantRepository.findById).toHaveBeenCalledWith('tenant123');
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith('user123');
    });

    it('deve lançar UnauthorizedException quando o usuário não for encontrado', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser('nonexistent@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando a senha for inválida', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o usuário estiver inativo', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: false,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o tenant estiver suspenso', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        password: 'hashedPassword',
        isActive: true,
        tenantId: 'tenant123',
      };

      const mockTenant = {
        id: 'tenant123',
        status: TenantStatus.SUSPENDED,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      tenantRepository.findById.mockResolvedValue(mockTenant);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(
        authService.validateUser('test@example.com', 'password123')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('deve gerar tokens e retornar informações do usuário', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: 'tenant123',
      };

      jwtService.sign.mockReturnValueOnce('accessToken123').mockReturnValueOnce('refreshToken123');
      configService.get.mockReturnValueOnce('refresh-secret').mockReturnValueOnce('7d');
      userRepository.updateRefreshToken.mockResolvedValue(undefined);

      const result = await authService.login(mockUser);
      
      expect(result).toEqual({
        accessToken: 'accessToken123',
        refreshToken: 'refreshToken123',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: 'tenant123',
        },
      });
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user123',
        email: 'test@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: 'tenant123',
      });
      
      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith('user123', 'refreshToken123');
    });
  });

  describe('refreshToken', () => {
    it('deve gerar um novo access token com um refresh token válido', async () => {
      const mockPayload = { sub: 'user123' };
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: 'tenant123',
        refreshToken: 'validRefreshToken',
      };

      jwtService.verify.mockReturnValue(mockPayload);
      userRepository.findById.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('newAccessToken');

      const result = await authService.refreshToken('validRefreshToken');
      
      expect(result).toEqual({
        accessToken: 'newAccessToken',
      });
      
      expect(jwtService.verify).toHaveBeenCalledWith('validRefreshToken', {
        secret: undefined,
      });
      
      expect(userRepository.findById).toHaveBeenCalledWith('user123');
      
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user123',
        email: 'test@example.com',
        role: UserRole.TENANT_ADMIN,
        tenantId: 'tenant123',
      });
    });

    it('deve lançar UnauthorizedException quando o refresh token for inválido', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        authService.refreshToken('invalidRefreshToken')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o usuário não for encontrado', async () => {
      const mockPayload = { sub: 'user123' };

      jwtService.verify.mockReturnValue(mockPayload);
      userRepository.findById.mockResolvedValue(null);

      await expect(
        authService.refreshToken('validRefreshToken')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('deve lançar UnauthorizedException quando o refresh token não corresponder', async () => {
      const mockPayload = { sub: 'user123' };
      const mockUser = {
        id: 'user123',
        refreshToken: 'differentRefreshToken',
      };

      jwtService.verify.mockReturnValue(mockPayload);
      userRepository.findById.mockResolvedValue(mockUser);

      await expect(
        authService.refreshToken('validRefreshToken')
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('registerTenant', () => {
    it('deve registrar um novo tenant e um usuário administrador', async () => {
      const tenantData = {
        name: 'Test Store',
        subdomain: 'test-store',
        plan: TenantPlan.BASIC,
      };

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockTenant = {
        id: 'tenant123',
        name: 'Test Store',
        subdomain: 'test-store',
        plan: TenantPlan.BASIC,
      };

      const mockUser = {
        id: 'user123',
        email: 'john@example.com',
      };

      tenantRepository.findBySubdomain.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue(null);
      tenantRepository.create.mockResolvedValue(mockTenant);
      userRepository.create.mockResolvedValue(mockUser);

      const result = await authService.registerTenant(tenantData, userData);
      
      expect(result).toEqual({
        tenant: mockTenant,
        user: { id: 'user123', email: 'john@example.com' },
      });
      
      expect(tenantRepository.findBySubdomain).toHaveBeenCalledWith('test-store');
      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(tenantRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Store',
        subdomain: 'test-store',
        plan: TenantPlan.BASIC,
      }));
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        tenantId: 'tenant123',
        role: UserRole.TENANT_ADMIN,
      }));
    });

    it('deve lançar ConflictException quando o subdomínio já estiver em uso', async () => {
      const tenantData = {
        name: 'Test Store',
        subdomain: 'existing-store',
        plan: TenantPlan.BASIC,
      };

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      tenantRepository.findBySubdomain.mockResolvedValue({ id: 'existingTenant' });

      await expect(
        authService.registerTenant(tenantData, userData)
      ).rejects.toThrow(ConflictException);
    });

    it('deve lançar ConflictException quando o email já estiver em uso', async () => {
      const tenantData = {
        name: 'Test Store',
        subdomain: 'test-store',
        plan: TenantPlan.BASIC,
      };

      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
      };

      tenantRepository.findBySubdomain.mockResolvedValue(null);
      userRepository.findByEmail.mockResolvedValue({ id: 'existingUser' });

      await expect(
        authService.registerTenant(tenantData, userData)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('processAsaasWebhook', () => {
    it('deve processar webhook de pagamento confirmado', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          customer: 'asaas_customer_123',
        },
      };

      const mockTenants = [
        {
          id: 'tenant123',
          asaasCustomerId: 'asaas_customer_123',
        },
      ];

      tenantRepository.findAll.mockResolvedValue(mockTenants);
      tenantRepository.reactivateTenant.mockResolvedValue(undefined);

      const result = await authService.processAsaasWebhook(webhookData);
      
      expect(result).toEqual({ message: 'Webhook processed successfully' });
      expect(tenantRepository.reactivateTenant).toHaveBeenCalledWith('tenant123');
    });

    it('deve processar webhook de pagamento atrasado', async () => {
      const webhookData = {
        event: 'PAYMENT_OVERDUE',
        payment: {
          customer: 'asaas_customer_123',
        },
      };

      const mockTenants = [
        {
          id: 'tenant123',
          asaasCustomerId: 'asaas_customer_123',
        },
      ];

      tenantRepository.findAll.mockResolvedValue(mockTenants);
      tenantRepository.markOverdue.mockResolvedValue(undefined);

      const result = await authService.processAsaasWebhook(webhookData);
      
      expect(result).toEqual({ message: 'Webhook processed successfully' });
      expect(tenantRepository.markOverdue).toHaveBeenCalledWith('tenant123');
    });

    it('deve processar webhook de assinatura cancelada', async () => {
      const webhookData = {
        event: 'SUBSCRIPTION_CANCELLED',
        subscription: {
          id: 'asaas_subscription_123',
        },
      };

      const mockTenants = [
        {
          id: 'tenant123',
          asaasSubscriptionId: 'asaas_subscription_123',
        },
      ];

      tenantRepository.findAll.mockResolvedValue(mockTenants);
      tenantRepository.suspendTenant.mockResolvedValue(undefined);

      const result = await authService.processAsaasWebhook(webhookData);
      
      expect(result).toEqual({ message: 'Webhook processed successfully' });
      expect(tenantRepository.suspendTenant).toHaveBeenCalledWith('tenant123');
    });
  });

  describe('logout', () => {
    it('deve limpar o refresh token do usuário', async () => {
      userRepository.updateRefreshToken.mockResolvedValue(undefined);

      const result = await authService.logout('user123');
      
      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(userRepository.updateRefreshToken).toHaveBeenCalledWith('user123', null);
    });
  });
});
