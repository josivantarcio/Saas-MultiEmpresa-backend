# Documentação EcomSaaS Store

## Visão Geral
EcomSaaS Store é uma plataforma de e-commerce SaaS multi-empresa com arquitetura de microserviços, permitindo que múltiplos lojistas utilizem a mesma infraestrutura para vender seus produtos online.

## Estrutura do Projeto
- **Microserviços Backend**: 
  - auth: Autenticação e autorização
  - catalog: Gerenciamento de produtos e categorias
  - checkout: Processamento de pedidos
  - payments: Integração com gateways de pagamento

- **Frontend**:
  - storefront: Loja virtual para clientes finais
  - merchant-portal: Painel para lojistas
  - admin-portal: Painel administrativo

## Status Atual do Projeto

### Frontend (Storefront)

#### Páginas Implementadas
- Página Inicial (Home)
- Página de Produtos
- Página de Promoções
- Páginas Institucionais (Sobre, Contato, Termos, Privacidade)
- Páginas de Autenticação:
  - Login
  - Cadastro
  - Recuperação de Senha

#### Funcionalidades Implementadas
- Carrinho de Compras com Redux
- Filtros de produtos por categoria, preço e avaliação
- Ordenação de produtos
- Paginação
- Exibição de produtos em promoção
- Formulários de autenticação com validação
- Fluxo completo de checkout:
  - Carrinho com cálculo de frete e cupom de desconto
  - Formulário de endereço de entrega com validação
  - Opções de pagamento (cartão, boleto, PIX)
  - Confirmação de pedido
- Componentes principais traduzidos para português
- Formatação de valores monetários no padrão brasileiro

### Em Desenvolvimento
- ✅ Fluxo completo de checkout
- ✅ Detalhes de produto
- ✅ Páginas de categorias
- 🚧 Painel do lojista
- 🚧 Painel administrativo

## Próximos Passos

### Prioridade Alta
1. ✅ Implementar páginas de autenticação (login/cadastro)
2. ✅ Finalizar fluxo de checkout
3. ✅ Implementar páginas de detalhes de produto
4. ✅ Implementar páginas de categorias
5. ✅ Executar auditoria de segurança

### Prioridade Média
1. Desenvolver painel do lojista
2. Implementar integração com gateway de pagamento
3. Configurar ambiente de produção
4. Implementar monitoramento

### Prioridade Baixa
1. Implementar sistema de avaliações de produtos
2. Adicionar funcionalidades de SEO
3. Implementar sistema de cupons de desconto
4. Adicionar suporte a múltiplos idiomas

## Telas Disponíveis

### Frontend (Storefront)
- `/`: Página inicial (✅)
- `/produtos`: Lista de produtos (✅)
- `/promocoes`: Produtos em promoção (✅)
- `/carrinho`: Carrinho de compras (✅)
- `/sobre`: Sobre a empresa (✅)
- `/contato`: Formulário de contato (✅)
- `/termos`: Termos de uso (✅)
- `/privacidade`: Política de privacidade (✅)
- `/licenca`: Licença de uso (✅)
- `/produtos/[id]`: Detalhes do produto (✅)
- `/checkout`: Finalização de compra (🚧)
- `/login`: Autenticação (🚧)
- `/cadastro`: Registro de usuário (🚧)
- `/minha-conta`: Área do cliente (🚧)

### Merchant Portal
- `/merchant`: Dashboard do lojista (🚧)
- `/merchant/produtos`: Gerenciamento de produtos (🚧)
- `/merchant/pedidos`: Gerenciamento de pedidos (🚧)

### Admin Portal
- `/admin`: Dashboard administrativo (🚧)
- `/admin/lojas`: Gerenciamento de lojas (🚧)
- `/admin/usuarios`: Gerenciamento de usuários (🚧)

## Como Executar o Projeto

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

## Informações de Contato
- **Proprietário**: Jôsevan Tárcio Silva de Oliveira
- **Email**: josivantarcio@msn.com

---

**© 2025 EcomSaaS Store. Todos os direitos reservados a Jôsevan Tárcio Silva de Oliveira.**
