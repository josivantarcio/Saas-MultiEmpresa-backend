// ... existing code ...

@Post('/verify-token')
async verifyToken(@Body() body: { token: string }) {
  try {
    const decoded = this.jwtService.verify(body.token);
    
    // Buscar informações atualizadas do usuário
    const user = await this.userService.findById(decoded.userId);
    
    if (!user) {
      return { valid: false, message: 'Usuário não encontrado' };
    }
    
    // Buscar informações do tenant
    const tenant = await this.tenantService.findById(user.tenantId);
    
    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
        status: tenant.status
      } : null
    };
  } catch (error) {
    return { valid: false, message: 'Token inválido ou expirado' };
  }
}

@Post('/verify-service-token')
async verifyServiceToken(@Body() body: { token: string }) {
  try {
    // Verificar token de serviço (diferente do token de usuário)
    const isValid = await this.authService.verifyServiceToken(body.token);
    
    return {
      valid: isValid,
      message: isValid ? 'Token de serviço válido' : 'Token de serviço inválido'
    };
  } catch (error) {
    return { valid: false, message: 'Erro ao verificar token de serviço' };
  }
}

// ... existing code ...