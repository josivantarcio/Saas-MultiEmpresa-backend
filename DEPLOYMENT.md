# Guia de Implantação

Este guia fornece instruções detalhadas para implantar a plataforma de E-commerce SaaS em um ambiente de produção.

## Pré-requisitos

- Docker e Docker Compose instalados no servidor
- Acesso a um provedor de nuvem (opcional, mas recomendado para produção)
- Domínio configurado (opcional, mas recomendado para produção)

## Configuração do Ambiente

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd saas-ecommerce-backend
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com as configurações do seu ambiente
   nano .env
   ```

   Certifique-se de alterar pelo menos os seguintes valores:
   - `DB_PASSWORD`
   - `MONGO_INITDB_ROOT_PASSWORD`
   - `RABBITMQ_DEFAULT_PASS`
   - `JWT_SECRET` (use um segredo forte)

## Implantação com Docker Compose

1. **Construa as imagens**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Inicie os serviços**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Verifique os logs**
   ```bash
   # Verifique os logs de todos os serviços
   docker-compose -f docker-compose.prod.yml logs -f

   # Ou verifique os logs de um serviço específico
   docker-compose -f docker-compose.prod.yml logs -f auth-service
   ```

4. **Verifique a saúde dos serviços**
   ```bash
   docker ps
   ```

   Todos os serviços devem estar com status "Up" e sem reinicializações frequentes.

## Configuração do Nginx (Opcional, mas recomendado)

Para produção, é recomendado configurar um Nginx como proxy reverso na frente do seu API Gateway. Aqui está um exemplo de configuração:

```nginx
server {
    listen 80;
    server_name sua-aplicacao.com www.sua-aplicacao.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sua-aplicacao.com www.sua-aplicacao.com;

    # Configurações SSL
    ssl_certificate /caminho/para/seu/certificado.crt;
    ssl_certificate_key /caminho/para/sua/chave-privada.key;
    
    # Configurações de segurança
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Configurações do proxy
    location / {
        proxy_pass http://localhost:3000;  # Porta do API Gateway
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configurações adicionais de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

## Monitoramento e Manutenção

### Backups

Configure backups regulares para seus bancos de dados. Aqui está um exemplo de script de backup:

```bash
#!/bin/bash

# Configurações
BACKUP_DIR="/caminho/para/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Fazer backup do PostgreSQL
docker exec -t saas_ecommerce_postgres_prod pg_dumpall -c -U postgres > $BACKUP_DIR/postgres_backup_$DATE.sql

# Fazer backup do MongoDB
docker exec -t saas_ecommerce_mongodb_prod mongodump --archive --gzip > $BACKUP_DIR/mongodb_backup_$DATE.gz

# Manter apenas os últimos 7 dias de backup
find $BACKUP_DIR -type f -mtime +7 -delete
```

### Monitoramento

Recomenda-se configurar um sistema de monitoramento como Prometheus + Grafana para monitorar:
- Uso de CPU, memória e disco
- Status dos contêineres
- Métricas de desempenho da aplicação
- Logs de erro

## Atualizações

Para atualizar a aplicação para uma nova versão:

1. **Faça backup dos dados**
   ```bash
   # Execute o script de backup ou faça backup manual
   ./backup.sh
   ```

2. **Atualize o código**
   ```bash
   git pull origin main  # ou sua branch de produção
   ```

3. **Reconstrua e reinicie os contêineres**
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml build --no-cache
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verifique os logs**
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Solução de Problemas

### Verificar logs dos contêineres
```bash
docker-compose -f docker-compose.prod.yml logs -f <nome-do-serviço>
```

### Verificar status dos contêineres
```bash
docker-compose -f docker-compose.prod.yml ps
```

### Acessar o banco de dados PostgreSQL
```bash
docker exec -it saas_ecommerce_postgres_prod psql -U postgres
```

### Acessar o MongoDB
```bash
docker exec -it saas_ecommerce_mongodb_prod mongo -u mongodb -p mongodb
```

### Verificar uso de recursos
```bash
docker stats
```

## Deploy em Produção

### Documentação da API (Swagger)

Cada microserviço expõe sua documentação OpenAPI/Swagger em `/docs`.

- Exemplo: `http://localhost:3001/docs` para o Auth Service
- Use esse endpoint para explorar, testar e integrar as APIs.

### Backend no Render

## Segurança

- **Nunca** exponha portas de banco de dados diretamente para a internet
- Use sempre conexões seguras (HTTPS) em produção
- Mantenha todas as senhas em variáveis de ambiente e nunca as inclua no controle de versão
- Atualize regularmente as imagens do Docker e dependências do projeto
