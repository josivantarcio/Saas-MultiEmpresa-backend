import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { TenantPlan, TenantStatus } from './entities/tenant.entity';
import { UserRole } from './entities/user.entity';

// DTO classes would normally be in separate files, simplified here for brevity
class LoginDto {
  email: string;
  password: string;
}

class RegisterTenantDto {
  tenantName: string;
  subdomain: string;
  plan: TenantPlan;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

class ResetPasswordDto {
  token: string;
  newPassword: string;
}

class RefreshTokenDto {
  refreshToken: string;
}

class UpdateTenantStatusDto {
  status: TenantStatus;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('register')
  async registerTenant(@Body() registerDto: RegisterTenantDto) {
    const { tenantName, subdomain, plan, ...userData } = registerDto;
    
    return this.authService.registerTenant(
      {
        name: tenantName,
        subdomain,
        plan,
      },
      userData,
    );
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: { email: string }) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req) {
    return req.user;
  }

  @Get('tenant/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async getTenantStatus(@Param('id') id: string, @Request() req) {
    // Only platform admins or the tenant's own users can check status
    if (
      req.user.role !== UserRole.PLATFORM_ADMIN && 
      req.user.tenantId !== id
    ) {
      return { error: 'Unauthorized' };
    }
    
    return this.authService.checkTenantStatus(id);
  }

  @Patch('tenant/:id/status')
  @UseGuards(AuthGuard('jwt'))
  async updateTenantStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTenantStatusDto,
    @Request() req,
  ) {
    // Only platform admins can update tenant status
    if (req.user.role !== UserRole.PLATFORM_ADMIN) {
      return { error: 'Unauthorized' };
    }
    
    return this.authService.updateTenantStatus(id, updateStatusDto.status);
  }

  @Post('webhook/asaas')
  @HttpCode(HttpStatus.OK)
  async processAsaasWebhook(@Body() webhookData: any) {
    return this.authService.processAsaasWebhook(webhookData);
  }
}
