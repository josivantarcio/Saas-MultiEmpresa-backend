# Plataforma E-commerce SaaS Multi-Empresa

Uma plataforma completa de e-commerce multi-tenant projetada para ser oferecida como Software as a Service (SaaS) para lojistas que vendem produtos e serviços.

## Versão Atual: v0.6.2 (17/05/2025)

[![Versão Atual](https://img.shields.io/github/v/tag/josivantarcio/Saas-MultiEmpresa-backend?label=vers%C3%A3o&style=flat-square)](https://github.com/josivantarcio/Saas-MultiEmpresa-backend/releases)
[![Licença](https://img.shields.io/badge/licen%C3%A7a-Uso%20Exclusivo-red.svg)](LICENSE.md)

> Para ver o histórico completo de alterações, consulte o [CHANGELOG.md](CHANGELOG.md)

## Visão Geral da Arquitetura

### Backend (Microserviços)
- **Framework**: Node.js com NestJS
- **Bancos de Dados**: PostgreSQL para dados relacionais e MongoDB para dados baseados em documentos
- **Arquitetura**: Microserviços
- **API**: RESTful com autenticação JWT
- **Processamento de Pagamentos**: Integração com Asaas para pagamentos e assinaturas

### Frontend (Next.js)
- **Framework**: Next.js
- **Gerenciamento de Estado**: Redux Toolkit
- **Estilização**: Tailwind CSS
- **Suporte PWA**: Design responsivo com recursos de Progressive Web App

## Funcionalidades Principais

### Painel Administrativo (Dono da Plataforma)
- Gerenciamento de lojistas
- Gerenciamento de assinaturas e pagamentos
- Bloqueio/desbloqueio automático de lojas com contas em atraso
- Painéis analíticos
- Configuração e gerenciamento de planos

### Portal do Lojista
- Personalização de marca
- Gerenciamento de produtos e serviços
- Personalização do checkout
- Configurações de impostos
- Integrações com terceiros

### Gerenciamento de Catálogo
- Suporte para produtos físicos, digitais e serviços
- Atributos dinâmicos
- Importação/exportação em massa
- SEO avançado

### Vendas e Checkout
- Carrinho inteligente
- Opções de entrega ou agendamento
- Calculadora de preços dinâmica
- Recomendações de cross-selling e upselling

### Gerenciamento Financeiro
- Integração com Asaas para pagamentos e assinaturas
- Divisão de pagamentos
- Relatórios financeiros
- Gerenciamento de comissões

### Ferramentas de Marketing
- Marketing por email integrado
- Programas de fidelidade
- Gerenciamento de cupons
- Recuperação de carrinhos abandonados

### Segurança
- Conformidade com LGPD/GDPR
- Backups automatizados
- Auditoria de ações
- Permissões granulares

### Sistema de Agendamento
- Calendário interativo
- Gerenciamento de disponibilidade
- Reservas online e na loja
- Personalização de serviços
- Lembretes automáticos
- Check-in digital
- Otimização de agenda
- Relatórios analíticos

## Funcionalidades Implementadas (v0.6.1)
- ✅ Página inicial com banners e produtos em destaque
- ✅ Página de produtos com filtros e ordenação
- ✅ Página de promoções com produtos em desconto
- ✅ Carrinho de compras com Redux
- ✅ Páginas institucionais (Sobre, Contato, Termos, Privacidade)
- ✅ Componentes principais traduzidos para português
- ✅ Formatação de valores monetários no padrão brasileiro

## Instruções de Configuração

### Pré-requisitos
- Node.js (v16+)
- Docker e Docker Compose
- PostgreSQL
- MongoDB
- Conta Asaas (para processamento de pagamentos)

### Configuração do Backend
```bash
cd backend
npm install
cp .env.example .env  # Configure as variáveis de ambiente
npm run start:dev
```

### Configuração do Frontend
```bash
cd frontend/storefront
npm install
cp .env.example .env  # Configure as variáveis de ambiente
npm run dev
```

## Execução do Projeto

### Frontend (Storefront)
```bash
cd frontend/storefront
npm install
npm run dev
```
Acesse: http://localhost:3001

### Backend (Serviços)
```bash
# Na raiz do projeto
docker-compose up -d
```

## Próximos Passos

### Prioridade Alta
1. Implementar páginas de autenticação (login/cadastro)
2. Finalizar fluxo de checkout
3. Implementar páginas de detalhes de produto
4. Implementar páginas de categorias
5. Executar auditoria de segurança

### Prioridade Média
1. Desenvolver painel do lojista
2. Implementar integração com gateway de pagamento
3. Configurar ambiente de produção
4. Implementar monitoramento

## Boas Práticas de Segurança
- JWT com expiração adequada e tokens de atualização
- Apenas HTTPS
- Limitação de taxa de API
- Criptografia de dados em repouso
- Validação e sanitização de entrada
- Auditorias de segurança regulares
- Conformidade com OWASP Top 10

## Informações de Contato
- **Proprietário**: Jôsevan Tárcio Silva de Oliveira
- **Email**: josivantarcio@msn.com

---

**© 2025 EcomSaaS Store. Todos os direitos reservados a Jôsevan Tárcio Silva de Oliveira.**
