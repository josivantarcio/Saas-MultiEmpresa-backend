# Monitoramento da Plataforma SaaS E-commerce

Este diretório contém os arquivos de configuração para o monitoramento da plataforma SaaS E-commerce, utilizando Prometheus e Grafana.

## Visão Geral

A infraestrutura de monitoramento consiste em:

1. **Prometheus** - Coleta e armazena métricas dos serviços
2. **Grafana** - Fornece dashboards para visualização das métricas
3. **Exporters** - Coletam métricas de bancos de dados e outros serviços

## Estrutura de Diretórios

```
monitoring/
├── grafana/
│   └── provisioning/
│       ├── dashboards/           # Dashboards do Grafana
│       │   └── saas-ecommerce-dashboard.json
│       └── datasources/          # Fontes de dados do Grafana
│           └── datasource.yml
└── prometheus/
    └── prometheus.yml          # Configuração do Prometheus
```

## Configuração

### Variáveis de Ambiente

Certifique-se de configurar as seguintes variáveis de ambiente no arquivo `.env` na raiz do projeto:

```bash
# Configurações do Prometheus
PROMETHEUS_DATA_DIR=/data/prometheus

# Configurações do Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin
GF_SECURITY_ADMIN_PASSWORD=admin

# Configurações dos bancos de dados
DB_USER=postgres
DB_PASSWORD=postgres
MONGO_INITDB_ROOT_USERNAME=mongodb
MONGO_INITDB_ROOT_PASSWORD=mongodb
```

## Iniciando o Monitoramento

Para iniciar a infraestrutura de monitoramento, utilize o Docker Compose:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

Isso iniciará os seguintes serviços:

- Prometheus em http://localhost:9090
- Grafana em http://localhost:3000 (usuário: admin, senha: admin)

## Dashboards

### Dashboard Principal

O dashboard principal está disponível em:
- **Título**: Saas Ecommerce - Visão Geral
- **URL**: http://localhost:3000/d/saas-ecommerce/visao-geral

Este dashboard contém os seguintes painéis:

1. **Status dos Serviços** - Status de disponibilidade de todos os microsserviços
2. **Tempo Médio de Resposta** - Tempo médio de resposta por serviço
3. **Requisições por Segundo** - Taxa de requisições por segundo
4. **Uso de CPU** - Uso de CPU por serviço
5. **Uso de Memória** - Uso de memória por serviço

## Alertas

Os alertas podem ser configurados diretamente no Grafana ou no Prometheus. Alguns alertas recomendados incluem:

1. **Serviço Indisponível** - Quando um serviço não está respondendo
2. **Alta Taxa de Erros** - Quando a taxa de erros HTTP 5xx excede um limite
3. **Alto Uso de CPU/Memória** - Quando o uso de recursos excede 80% por um período prolongado

## Manutenção

### Backup dos Dados

Os dados do Prometheus e Grafana são persistidos em volumes Docker. Para fazer backup:

```bash
# Backup do Prometheus
docker run --rm -v saas_ecommerce_prometheus_data:/source -v $(pwd):/backup alpine tar czf /backup/prometheus_backup_$(date +%Y%m%d).tar.gz -C /source .

# Backup do Grafana
docker run --rm -v saas_ecommerce_grafana_data:/source -v $(pwd):/backup alpine tar czf /backup/grafana_backup_$(date +%Y%m%d).tar.gz -C /source .
```

### Restauração de Dados

```bash
# Restaurar Prometheus
docker run --rm -v saas_ecommerce_prometheus_data:/target -v $(pwd):/backup alpine sh -c "rm -rf /target/* && tar xzf /backup/prometheus_backup_YYYYMMDD.tar.gz -C /target"

# Restaurar Grafana
docker run --rm -v saas_ecommerce_grafana_data:/target -v $(pwd):/backup alpine sh -c "rm -rf /target/* && tar xzf /backup/grafana_backup_YYYYMMDD.tar.gz -C /target"
```

## Solução de Problemas

### Acessar Logs

```bash
# Logs do Prometheus
docker-compose -f docker-compose.monitoring.yml logs -f prometheus

# Logs do Grafana
docker-compose -f docker-compose.monitoring.yml logs -f grafana
```

### Reiniciar Serviços

```bash
docker-compose -f docker-compose.monitoring.yml restart prometheus grafana
```

## Personalização

### Adicionar Novos Dashboards

1. Crie um novo arquivo JSON no diretório `monitoring/grafana/provisioning/dashboards/`
2. O Grafana irá carregar automaticamente o novo dashboard

### Adicionar Novas Fontes de Dados

Edite o arquivo `monitoring/grafana/provisioning/datasources/datasource.yml` para adicionar novas fontes de dados.

## Segurança

- Altere as senhas padrão em produção
- Restrinja o acesso aos endpoints do Prometheus e Grafana
- Use HTTPS para acesso remoto
- Mantenha os softwares atualizados

## Próximos Passos

1. Configurar alertas no Grafana
2. Adicionar métricas personalizadas aos serviços
3. Configurar autenticação OAuth para o Grafana
4. Adicionar mais painéis para métricas específicas de negócio
