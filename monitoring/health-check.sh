#!/bin/bash

# Script para verificar a saúde dos serviços de monitoramento
# Uso: ./health-check.sh [opções]
# Opções:
#   -v, --verbose  Mostra saída detalhada
#   -q, --quiet    Mostra apenas erros
#   -h, --help     Mostra esta mensagem de ajuda

set -e

# Cores para saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis
VERBOSE=0
QUIET=0
STATUS=0

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [opções]"
    echo "Opções:"
    echo "  -v, --verbose  Mostra saída detalhada"
    echo "  -q, --quiet    Mostra apenas erros"
    echo "  -h, --help     Mostra esta mensagem de ajuda"
    exit 0
}

# Processa os argumentos
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -v|--verbose)
            VERBOSE=1
            shift
            ;;
        -q|--quiet)
            QUIET=1
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo "Opção inválida: $1"
            show_help
            ;;
    esac
done

# Função para imprimir mensagens
log() {
    if [ $QUIET -eq 0 ]; then
        echo -e "$1"
    fi
}

# Função para verificar se um serviço está em execução
check_service() {
    local service=$1
    local name=$2
    local port=$3
    local endpoint=${4:-/}
    
    if [ $VERBOSE -eq 1 ]; then
        log "Verificando serviço ${name} (${service}) na porta ${port}..."
    fi
    
    if docker ps | grep -q ${service}; then
        if curl -s -o /dev/null --connect-timeout 3 http://localhost:${port}${endpoint}; then
            log "${GREEN}✓${NC} ${name} está em execução e acessível em http://localhost:${port}"
            return 0
        else
            log "${YELLOW}⚠${NC} ${name} está em execução, mas não está respondendo em http://localhost:${port}"
            return 1
        fi
    else
        log "${RED}✗${NC} ${name} não está em execução"
        return 2
    fi
}

# Função para verificar métricas do Prometheus
check_prometheus_metrics() {
    local metric=$1
    local name=$2
    
    if [ $VERBOSE -eq 1 ]; then
        log "Verificando métrica '${metric}' no Prometheus..."
    fi
    
    local result=$(curl -s "http://localhost:9090/api/v1/query?query=${metric}" | jq -r '.data.result | length' 2>/dev/null || echo "0")
    
    if [ "$result" -gt 0 ]; then
        log "${GREEN}✓${NC} Métrica '${name}' está presente no Prometheus"
        return 0
    else
        log "${YELLOW}⚠${NC} Métrica '${name}' não encontrada no Prometheus"
        return 1
    fi
}

# Função para verificar datasource do Grafana
check_grafana_datasource() {
    local datasource=$1
    
    if [ $VERBOSE -eq 1 ]; then
        log "Verificando datasource '${datasource}' no Grafana..."
    fi
    
    # Usa a API do Grafana para verificar a conexão com a fonte de dados
    local response=$(curl -s -o /dev/null -w "%{http_code}" -u admin:admin "http://localhost:3000/api/datasources/name/${datasource}" 2>/dev/null)
    
    if [ "$response" -eq 200 ]; then
        log "${GREEN}✓${NC} Datasource '${datasource}' configurada corretamente no Grafana"
        return 0
    else
        log "${YELLOW}⚠${NC} Falha ao acessar a datasource '${datasource}' no Grafana (HTTP ${response})"
        return 1
    fi
}

# Verifica se o Docker está em execução
if ! docker info >/dev/null 2>&1; then
    log "${RED}✗${NC} O Docker não está em execução"
    exit 1
fi

# Verifica se o jq está instalado
if ! command -v jq &> /dev/null; then
    log "${YELLOW}Aviso: jq não está instalado. Algumas verificações serão ignoradas.${NC}"
    log "Instale com: sudo apt-get install jq (Ubuntu/Debian) ou brew install jq (macOS)"
fi

log "${YELLOW}=== Verificando serviços de monitoramento ===${NC}"

# Verifica os serviços principais
check_service prometheus "Prometheus" 9090 "/graph"
check_service grafana "Grafana" 3000 "/api/health"
check_service alertmanager "Alertmanager" 9093 "/-/ready"
check_service node-exporter "Node Exporter" 9100 "/metrics"
check_service cadvisor "cAdvisor" 8080 "/healthz"
check_service loki "Loki" 3100 "/ready"
check_service promtail "Promtail" 9080 "/metrics"

# Verifica as métricas do Prometheus
if command -v jq &> /dev/null; then
    check_prometheus_metrics "up" "Status dos alvos"
    check_prometheus_metrics "node_cpu_seconds_total" "Métricas de CPU"
    check_prometheus_metrics "node_memory_MemTotal_bytes" "Métricas de memória"
    
    # Verifica se o Alertmanager está configurado corretamente
    check_prometheus_metrics "ALERTS" "Alertas ativos"
    
    # Verifica se o Node Exporter está fornecendo métricas
    check_prometheus_metrics "node_exporter_build_info" "Node Exporter"
    
    # Verifica se o cAdvisor está fornecendo métricas
    check_prometheus_metrics "container_cpu_usage_seconds_total" "cAdvisor"
    
    # Verifica se o Loki está configurado como fonte de dados no Grafana
    check_grafana_datasource "Loki"
    check_grafana_datasource "Prometheus"
fi

# Verifica o status dos contêineres
log "\n${YELLOW}=== Status dos contêineres ===${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E 'prometheus|grafana|alertmanager|node-exporter|cadvisor|loki|promtail'

# Verifica o uso de recursos
log "\n${YELLOW}=== Uso de recursos ===${NC}"
echo "Uso de CPU (média dos últimos 5 minutos): $(uptime | awk -F'[a-z]:' '{ print $2}' | cut -d, -f1 | xargs)"
echo "Uso de memória: $(free -m | awk 'NR==2{printf "%s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }')"
echo "Uso de disco: $(df -h / | awk 'NR==2{printf "%s/%s (%s)\n", $3,$2,$5}')"

# Verifica se há atualizações disponíveis
if [ $VERBOSE -eq 1 ]; then
    log "\n${YELLOW}=== Verificando atualizações ===${NC}"
    docker-compose -f docker-compose.monitoring.yml pull --quiet
    docker-compose -f docker-compose.monitoring.yml up -d
    log "Verificação de atualizações concluída"
fi

# Verifica se há alertas ativos
if command -v jq &> /dev/null; then
    ALERT_COUNT=$(curl -s "http://localhost:9090/api/v1/alerts" | jq -r '.data.alerts | map(select(.state == "firing")) | length' 2>/dev/null || echo "0")
    if [ "$ALERT_COUNT" -gt 0 ]; then
        log "\n${RED}⚠  ATENÇÃO: $ALERT_COUNT alerta(s) ativo(s) no Prometheus${NC}"
        curl -s "http://localhost:9090/api/v1/alerts" | jq -r '.data.alerts[] | select(.state == "firing") | "\(.labels.alertname): \(.annotations.summary)"'
        STATUS=1
    else
        log "\n${GREEN}✓ Nenhum alerta ativo no momento${NC}"
    fi
fi

# Verifica a saúde do Loki
if [ $VERBOSE -eq 1 ]; then
    log "\n${YELLOW}=== Verificando saúde do Loki ===${NC}"
    LOKI_READY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/ready)
    if [ "$LOKI_READY" -eq 200 ]; then
        log "${GREEN}✓ Loki está pronto${NC}"
    else
        log "${YELLOW}⚠ Loki não está respondendo corretamente (HTTP $LOKI_READY)${NC}"
        STATUS=1
    fi
    
    # Verifica se o Promtail está enviando logs para o Loki
    if docker logs promtail 2>&1 | grep -q "error"; then
        log "${YELLOW}⚠ Foram encontrados erros nos logs do Promtail${NC}"
        STATUS=1
    fi
fi

# Verifica a saúde do Alertmanager
if [ $VERBOSE -eq 1 ]; then
    log "\n${YELLOW}=== Verificando saúde do Alertmanager ===${NC}"
    ALERTMANAGER_READY=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9093/-/ready)
    if [ "$ALERTMANAGER_READY" -eq 200 ]; then
        log "${GREEN}✓ Alertmanager está pronto${NC}"
    else
        log "${YELLOW}⚠ Alertmanager não está respondendo corretamente (HTTP $ALERTMANAGER_READY)${NC}"
        STATUS=1
    fi
fi

# Resumo
log "\n${YELLOW}=== Resumo ===${NC}"
if [ $STATUS -eq 0 ]; then
    log "${GREEN}✓ Todos os serviços estão funcionando corretamente${NC}"
else
    log "${YELLOW}⚠ Alguns problemas foram encontrados. Verifique os logs acima para mais detalhes.${NC}"
fi

exit $STATUS
