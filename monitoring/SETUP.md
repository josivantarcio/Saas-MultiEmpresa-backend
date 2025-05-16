# Configuração do Ambiente de Monitoramento

Este documento descreve como configurar e executar a infraestrutura de monitoramento para a plataforma SaaS E-commerce.

## Visão Geral

A infraestrutura de monitoramento consiste nos seguintes componentes:

1. **Prometheus** - Coleta e armazena métricas
2. **Grafana** - Visualização de métricas e dashboards
3. **Alertmanager** - Gerenciamento de alertas
4. **Node Exporter** - Coleta métricas do sistema operacional
5. **cAdvisor** - Monitoramento de contêineres
6. **Loki** - Agregação de logs
7. **Promtail** - Coletor de logs para o Loki
8. **Exporters** - Coletam métricas de bancos de dados e serviços

## Pré-requisitos

- Docker 20.10+ e Docker Compose 1.29+
- 4GB de RAM disponível (mínimo)
- 10GB de espaço em disco (para armazenamento de métricas e logs)

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# Configurações do Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# Configurações do banco de dados
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
MONGO_INITDB_ROOT_USERNAME=mongodb
MONGO_INITDB_ROOT_PASSWORD=mongodb
RABBITMQ_DEFAULT_USER=rabbitmq
RABBITMQ_DEFAULT_PASS=rabbitmq

# Configurações de rede
NETWORK_NAME=saas_network
```

### 2. Iniciar a Infraestrutura

Para iniciar a infraestrutura de monitoramento, execute:

```bash
# Dar permissão de execução ao script
chmod +x monitoring/start-monitoring.sh

# Iniciar em modo de desenvolvimento
./monitoring/start-monitoring.sh start

# Ou iniciar em modo de produção
./monitoring/start-monitoring.sh start prod
```

### 3. Acessar as Ferramentas

Após a inicialização, você pode acessar:

- **Grafana**: http://localhost:3000
  - Usuário: `admin`
  - Senha: `admin` (altere no primeiro login)

- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093
- **cAdvisor**: http://localhost:8080
- **Node Exporter**: http://localhost:9100/metrics

## Configuração de Dashboards

### Importar Dashboards no Grafana

1. Acesse o Grafana em http://localhost:3000
2. Navegue até "Dashboards" > "Import"
3. Use os seguintes IDs de dashboard ou faça upload dos arquivos JSON:
   - **Node Exporter Full**: 1860
   - **Docker and system monitoring**: 893
   - **MongoDB**: 2583
   - **PostgreSQL**: 9628
   - **RabbitMQ**: 10991

### Dashboard Personalizado

Um dashboard personalizado para a aplicação está disponível em:
`monitoring/grafana/provisioning/dashboards/saas-ecommerce-dashboard.json`

## Configuração de Alertas

Os alertas estão configurados no arquivo `monitoring/prometheus/alerts.yml`. Eles são gerenciados pelo Alertmanager, que pode enviar notificações para:

- E-mail
- Slack
- PagerDuty
- Webhooks

Para configurar os canais de notificação, edite o arquivo `monitoring/alertmanager/config.yml`.

## Monitoramento de Logs

Os logs são coletados pelo Promtail e armazenados no Loki. Para visualizar os logs:

1. Acesse o Grafana
2. Navegue até "Explore"
3. Selecione "Loki" como fonte de dados
4. Use consultas LogQL para filtrar os logs

## Manutenção

### Backup

Para fazer backup dos dados de monitoramento:

```bash
# Backup do Prometheus
docker run --rm -v saas_ecommerce_prometheus_data:/source -v $(pwd):/backup alpine tar czf /backup/prometheus_backup_$(date +%Y%m%d).tar.gz -C /source .

# Backup do Grafana
docker run --rm -v saas_ecommerce_grafana_data:/source -v $(pwd):/backup alpine tar czf /backup/grafana_backup_$(date +%Y%m%d).tar.gz -C /source .

# Backup do Loki
docker run --rm -v saas_ecommerce_loki_data:/source -v $(pwd):/backup alpine tar czf /backup/loki_backup_$(date +%Y%m%d).tar.gz -C /source .
```

### Atualização

Para atualizar os contêineres para as versões mais recentes:

```bash
docker-compose -f docker-compose.monitoring.yml pull
docker-compose -f docker-compose.monitoring.yml up -d
```

## Solução de Problemas

### Verificar Logs

```bash
# Verificar logs do Prometheus
docker-compose -f docker-compose.monitoring.yml logs -f prometheus

# Verificar logs do Grafana
docker-compose -f docker-compose.monitoring.yml logs -f grafana
```

### Reiniciar Serviços

```bash
# Reiniciar todos os serviços
docker-compose -f docker-compose.monitoring.yml restart

# Reiniciar um serviço específico
docker-compose -f docker-compose.monitoring.yml restart prometheus
```

### Limpar Dados

CUIDADO: Isso irá remover todos os dados de métricas e configurações.

```bash
docker-compose -f docker-compose.monitoring.yml down -v
```

## Segurança

Em ambientes de produção, é altamente recomendado:

1. Configurar autenticação para todas as ferramentas
2. Usar HTTPS com certificados válidos
3. Restringir o acesso às portas expostas
4. Manter todos os componentes atualizados
5. Monitorar o próprio sistema de monitoramento

## Monitoramento Personalizado

Para adicionar monitoramento a um novo serviço:

1. Adicione as métricas do serviço ao Prometheus
2. Crie um dashboard no Grafana
3. Configure alertas conforme necessário
4. Adicione coleta de logs no Promtail

## Recursos Adicionais

- [Documentação do Prometheus](https://prometheus.io/docs/)
- [Documentação do Grafana](https://grafana.com/docs/)
- [Documentação do Loki](https://grafana.com/docs/loki/latest/)
- [Documentação do Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/)
