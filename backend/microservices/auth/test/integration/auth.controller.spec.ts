import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from '../../src/auth.controller';
import { AuthService } from '../../src/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { TenantPlan, TenantStatus } from '../../src/entities/tenant.entity';
import { UserRole } from '../../src/entities/user.entity';

// Mock do AuthGuard para testes de integração
const mockAuthGuard = {
  canActivate: jest.fn().mockImplementation(() => true),
};

// Mock do AuthService
const mockAuthService = {
  validateUser: jest.fn(),
  login: jest.fn(),
  refreshToken: jest.fn(),
  registerTenant: jest.fn(),
  verifyEmail: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
  logout: jest.fn(),
  checkTenantStatus: jest.fn(),
  updateTenantStatus: jest.fn(),
  processAsaasWebhook: jest.fn(),
};

// Mock do usuário autenticado para os testes
const mockUser = {
  id: 'user123',
  email: 'test@example.com',
  role: UserRole.TENANT_ADMIN,
  tenantId: 'tenant123',
};

// Mock do usuário administrador da plataforma
const mockPlatformAdmin = {
  id: 'admin123',
  email: 'admin@example.com',
  role: UserRole.PLATFORM_ADMIN,
  tenantId: null,
};

describe('AuthController (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    // Mock para o request.user que seria normalmente definido pelo AuthGuard
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockLoginResponse = {
        accessToken: 'accessToken123',
        refreshToken: 'refreshToken123',
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: UserRole.TENANT_ADMIN,
          tenantId: 'tenant123',
        },
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toEqual(mockLoginResponse);
      expect(mockAuthService.validateUser).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);
    });

    it('deve validar os dados de login', async () => {
      const invalidLoginDto = {
        // Faltando email e password
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(400);

      expect(mockAuthService.validateUser).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/refresh', () => {
    it('deve renovar o token de acesso', async () => {
      const refreshTokenDto = {
        refreshToken: 'validRefreshToken',
      };

      const mockRefreshResponse = {
        accessToken: 'newAccessToken123',
      };

      mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(refreshTokenDto)
        .expect(200);

      expect(response.body).toEqual(mockRefreshResponse);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith('validRefreshToken');
    });

    it('deve validar os dados de refresh token', async () => {
      const invalidRefreshDto = {
        // Faltando refreshToken
      };

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send(invalidRefreshDto)
        .expect(400);

      expect(mockAuthService.refreshToken).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/register', () => {
    it('deve registrar um novo tenant e usuário administrador', async () => {
      const registerDto = {
        tenantName: 'Test Store',
        subdomain: 'test-store',
        plan: TenantPlan.BASIC,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const mockRegisterResponse = {
        tenant: {
          id: 'tenant123',
          name: 'Test Store',
          subdomain: 'test-store',
          plan: TenantPlan.BASIC,
        },
        user: {
          id: 'user123',
          email: 'john@example.com',
        },
      };

      mockAuthService.registerTenant.mockResolvedValue(mockRegisterResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(response.body).toEqual(mockRegisterResponse);
      expect(mockAuthService.registerTenant).toHaveBeenCalledWith(
        {
          name: 'Test Store',
          subdomain: 'test-store',
          plan: TenantPlan.BASIC,
        },
        {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      );
    });

    it('deve validar os dados de registro', async () => {
      const invalidRegisterDto = {
        // Faltando campos obrigatórios
        tenantName: 'Test Store',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidRegisterDto)
        .expect(400);

      expect(mockAuthService.registerTenant).not.toHaveBeenCalled();
    });
  });

  describe('GET /auth/verify-email', () => {
    it('deve verificar o email com um token válido', async () => {
      const mockVerifyResponse = {
        message: 'Email verified successfully',
      };

      mockAuthService.verifyEmail.mockResolvedValue(mockVerifyResponse);

      const response = await request(app.getHttpServer())
        .get('/auth/verify-email?token=validToken123')
        .expect(200);

      expect(response.body).toEqual(mockVerifyResponse);
      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('validToken123');
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('deve processar a solicitação de recuperação de senha', async () => {
      const forgotPasswordDto = {
        email: 'test@example.com',
      };

      const mockForgotResponse = {
        message: 'If your email is registered, you will receive reset instructions',
      };

      mockAuthService.forgotPassword.mockResolvedValue(mockForgotResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send(forgotPasswordDto)
        .expect(200);

      expect(response.body).toEqual(mockForgotResponse);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('POST /auth/reset-password', () => {
    it('deve redefinir a senha com um token válido', async () => {
      const resetPasswordDto = {
        token: 'validResetToken',
        newPassword: 'newPassword123',
      };

      const mockResetResponse = {
        message: 'Password updated successfully',
      };

      mockAuthService.resetPassword.mockResolvedValue(mockResetResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(resetPasswordDto)
        .expect(200);

      expect(response.body).toEqual(mockResetResponse);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('validResetToken', 'newPassword123');
    });

    it('deve validar os dados de redefinição de senha', async () => {
      const invalidResetDto = {
        // Faltando token ou newPassword
        token: 'validResetToken',
      };

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send(invalidResetDto)
        .expect(400);

      expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('deve fazer logout do usuário', async () => {
      const mockLogoutResponse = {
        message: 'Logged out successfully',
      };

      mockAuthService.logout.mockResolvedValue(mockLogoutResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toEqual(mockLogoutResponse);
      expect(mockAuthService.logout).toHaveBeenCalledWith('user123');
    });
  });

  describe('GET /auth/me', () => {
    it('deve retornar o perfil do usuário autenticado', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .expect(200);

      expect(response.body).toEqual(mockUser);
    });
  });

  describe('GET /auth/tenant/:id/status', () => {
    it('deve retornar o status do tenant para o próprio tenant', async () => {
      const mockStatusResponse = {
        status: TenantStatus.ACTIVE,
        isActive: true,
        isPaymentOverdue: false,
        plan: TenantPlan.BASIC,
      };

      mockAuthService.checkTenantStatus.mockResolvedValue(mockStatusResponse);

      const response = await request(app.getHttpServer())
        .get('/auth/tenant/tenant123/status')
        .expect(200);

      expect(response.body).toEqual(mockStatusResponse);
      expect(mockAuthService.checkTenantStatus).toHaveBeenCalledWith('tenant123');
    });

    it('deve negar acesso ao status de outro tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/tenant/other-tenant/status')
        .expect(200);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockAuthService.checkTenantStatus).not.toHaveBeenCalled();
    });

    it('deve permitir acesso ao status para administradores da plataforma', async () => {
      // Substituir temporariamente o usuário pelo administrador da plataforma
      app.use((req, res, next) => {
        req.user = mockPlatformAdmin;
        next();
      });

      const mockStatusResponse = {
        status: TenantStatus.ACTIVE,
        isActive: true,
        isPaymentOverdue: false,
        plan: TenantPlan.BASIC,
      };

      mockAuthService.checkTenantStatus.mockResolvedValue(mockStatusResponse);

      const response = await request(app.getHttpServer())
        .get('/auth/tenant/any-tenant/status')
        .expect(200);

      expect(response.body).toEqual(mockStatusResponse);
      expect(mockAuthService.checkTenantStatus).toHaveBeenCalledWith('any-tenant');

      // Restaurar o usuário normal para os próximos testes
      app.use((req, res, next) => {
        req.user = mockUser;
        next();
      });
    });
  });

  describe('PATCH /auth/tenant/:id/status', () => {
    it('deve negar a atualização do status para usuários não administradores', async () => {
      const updateStatusDto = {
        status: TenantStatus.SUSPENDED,
      };

      const response = await request(app.getHttpServer())
        .patch('/auth/tenant/tenant123/status')
        .send(updateStatusDto)
        .expect(200);

      expect(response.body).toEqual({ error: 'Unauthorized' });
      expect(mockAuthService.updateTenantStatus).not.toHaveBeenCalled();
    });

    it('deve permitir a atualização do status para administradores da plataforma', async () => {
      // Substituir temporariamente o usuário pelo administrador da plataforma
      app.use((req, res, next) => {
        req.user = mockPlatformAdmin;
        next();
      });

      const updateStatusDto = {
        status: TenantStatus.SUSPENDED,
      };

      const mockUpdateResponse = {
        message: 'Tenant status updated successfully',
      };

      mockAuthService.updateTenantStatus.mockResolvedValue(mockUpdateResponse);

      const response = await request(app.getHttpServer())
        .patch('/auth/tenant/tenant123/status')
        .send(updateStatusDto)
        .expect(200);

      expect(response.body).toEqual(mockUpdateResponse);
      expect(mockAuthService.updateTenantStatus).toHaveBeenCalledWith('tenant123', TenantStatus.SUSPENDED);

      // Restaurar o usuário normal para os próximos testes
      app.use((req, res, next) => {
        req.user = mockUser;
        next();
      });
    });
  });

  describe('POST /auth/webhook/asaas', () => {
    it('deve processar webhooks do Asaas', async () => {
      const webhookData = {
        event: 'PAYMENT_CONFIRMED',
        payment: {
          id: 'payment123',
          customer: 'customer123',
        },
      };

      const mockWebhookResponse = {
        message: 'Webhook processed successfully',
      };

      mockAuthService.processAsaasWebhook.mockResolvedValue(mockWebhookResponse);

      const response = await request(app.getHttpServer())
        .post('/auth/webhook/asaas')
        .send(webhookData)
        .expect(200);

      expect(response.body).toEqual(mockWebhookResponse);
      expect(mockAuthService.processAsaasWebhook).toHaveBeenCalledWith(webhookData);
    });
  });
});
