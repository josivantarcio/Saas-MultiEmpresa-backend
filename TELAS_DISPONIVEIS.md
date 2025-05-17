# Telas Disponíveis no EcomSaaS Store

## Frontend (Storefront)

### Páginas Principais
1. **Página Inicial**
   - URL: `/`
   - Descrição: Página principal da loja virtual
   - Status: ✅ Disponível

2. **Lista de Produtos**
   - URL: `/produtos`
   - Descrição: Exibe todos os produtos disponíveis
   - Status: 🚧 Em desenvolvimento

3. **Detalhes do Produto**
   - URL: `/produtos/[id]`
   - Descrição: Exibe detalhes de um produto específico
   - Status: 🚧 Em desenvolvimento

4. **Carrinho de Compras**
   - URL: `/carrinho`
   - Descrição: Exibe os itens adicionados ao carrinho
   - Status: ✅ Disponível (básico)

5. **Checkout**
   - URL: `/checkout`
   - Descrição: Processo de finalização de compra
   - Status: 🚧 Em desenvolvimento

### Páginas de Conta
1. **Login**
   - URL: `/login`
   - Status: 🚧 Em desenvolvimento

2. **Cadastro**
   - URL: `/cadastro`
   - Status: 🚧 Em desenvolvimento

3. **Minha Conta**
   - URL: `/minha-conta`
   - Status: 🚧 Em desenvolvimento

### Páginas Institucionais
1. **Sobre Nós**
   - URL: `/sobre`
   - Status: ✅ Disponível

2. **Contato**
   - URL: `/contato`
   - Status: ✅ Disponível

3. **Política de Privacidade**
   - URL: `/privacidade`
   - Status: 🚧 Em desenvolvimento

4. **Termos de Uso**
   - URL: `/termos`
   - Status: 🚧 Em desenvolvimento

## Admin Portal

1. **Dashboard**
   - URL: `/admin`
   - Status: 🚧 Em desenvolvimento

2. **Gerenciamento de Produtos**
   - URL: `/admin/produtos`
   - Status: 🚧 Em desenvolvimento

3. **Pedidos**
   - URL: `/admin/pedidos`
   - Status: 🚧 Em desenvolvimento

## Merchant Portal (Área do Lojista)

1. **Dashboard**
   - URL: `/merchant`
   - Status: 🚧 Em desenvolvimento

2. **Meus Produtos**
   - URL: `/merchant/produtos`
   - Status: 🚧 Em desenvolvimento

3. **Meus Pedidos**
   - URL: `/merchant/pedidos`
   - Status: 🚧 Em desenvolvimento

## Monitoramento

1. **Grafana**
   - URL: `http://localhost:3000`
   - Credenciais padrão: admin/admin
   - Status: ✅ Disponível

2. **Prometheus**
   - URL: `http://localhost:9090`
   - Status: ✅ Disponível

## Como Executar

1. **Frontend (Storefront)**
   ```bash
   cd frontend/storefront
   npm install
   npm run dev
   ```
   Acesse: http://localhost:3001

2. **Backend (Serviços)**
   ```bash
   # Na raiz do projeto
   docker-compose up -d
   ```

## Solução de Problemas

Se estiver recebendo erros 404:
1. Verifique se o serviço correspondente está em execução
2. Confira se a URL está correta
3. Verifique os logs do servidor para mensagens de erro
4. Se estiver desenvolvendo, certifique-se de que a rota foi criada no Next.js

## Próximas Atualizações

- [ ] Finalizar páginas de autenticação
- [ ] Implementar carrinho de compras completo
- [ ] Desenvolver fluxo de checkout
- [ ] Criar painel administrativo
- [ ] Implementar área do lojista

---
Atualizado em: 17/05/2025
