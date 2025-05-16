#!/bin/bash

# Script para iniciar a infraestrutura de monitoramento
# Uso: ./start-monitoring.sh [ambiente]
# Exemplo: ./start-monitoring.sh prod

set -e

# Verifica se o Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "Erro: Docker não está instalado. Por favor, instale o Docker e tente novamente."
    exit 1
fi

# Verifica se o Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "Erro: Docker Compose não está instalado. Por favor, instale o Docker Compose e tente novamente."
    exit 1
fi

# Define o ambiente (padrão: dev)
ENV=${1:-dev}

# Diretório base
dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

# Função para verificar se um comando foi bem-sucedido
check_command() {
    if [ $? -ne 0 ]; then
        echo "Erro ao executar o comando: $1"
        exit 1
    fi
}

# Função para criar rede Docker se não existir
create_network() {
    if ! docker network inspect saas_network >/dev/null 2>&1; then
        echo "Criando rede Docker 'saas_network'..."
        docker network create saas_network
        check_command "docker network create saas_network"
    fi
}

# Função para criar volumes se não existirem
create_volumes() {
    for volume in prometheus_data grafana_data loki_data pushgateway_data alertmanager_data; do
        if ! docker volume inspect ${volume} >/dev/null 2>&1; then
            echo "Criando volume Docker '${volume}'..."
            docker volume create ${volume}
            check_command "docker volume create ${volume}"
        fi
    done
}

# Função para carregar variáveis de ambiente
load_env() {
    if [ -f "${dir}/../.env" ]; then
        echo "Carregando variáveis de ambiente de .env..."
        export $(grep -v '^#' ${dir}/../.env | xargs)
    else
        echo "Aviso: Arquivo .env não encontrado. Usando valores padrão."
    fi
}

# Função para iniciar a infraestrutura
start_infrastructure() {
    echo "Iniciando infraestrutura de monitoramento (${ENV})..."
    
    # Carrega variáveis de ambiente
    load_env
    
    # Cria rede e volumes
    create_network
    create_volumes
    
    # Inicia os serviços
    if [ "${ENV}" = "prod" ]; then
        docker-compose -f ${dir}/../docker-compose.yml -f ${dir}/../docker-compose.prod.yml -f ${dir}/../docker-compose.monitoring.yml up -d
    elif [ "${ENV}" = "staging" ]; then
        docker-compose -f ${dir}/../docker-compose.yml -f ${dir}/../docker-compose.staging.yml -f ${dir}/../docker-compose.monitoring.yml up -d
    else
        docker-compose -f ${dir}/../docker-compose.yml -f ${dir}/../docker-compose.monitoring.yml up -d
    fi
    
    check_command "docker-compose up -d"
    
    echo "\nInfraestrutura de monitoramento iniciada com sucesso!"
    echo "- Grafana: http://localhost:3000 (admin/admin)"
    echo "- Prometheus: http://localhost:9090"
    echo "- Alertmanager: http://localhost:9093"
    echo "- cAdvisor: http://localhost:8080"
    echo "- Node Exporter: http://localhost:9100/metrics"
    echo "\nPara parar os serviços, execute: docker-compose -f docker-compose.monitoring.yml down"
}

# Função para parar a infraestrutura
stop_infrastructure() {
    echo "Parando infraestrutura de monitoramento..."
    docker-compose -f ${dir}/../docker-compose.monitoring.yml down
    echo "Infraestrutura de monitoramento parada."
}

# Menu de ajuda
show_help() {
    echo "Uso: $0 [comando] [opções]"
    echo ""
    echo "Comandos:"
    echo "  start [ambiente]  Inicia a infraestrutura de monitoramento (dev, staging, prod)"
    echo "  stop              Para a infraestrutura de monitoramento"
    echo "  restart [ambiente] Reinicia a infraestrutura de monitoramento"
    echo "  status            Mostra o status dos contêineres"
    echo "  logs [serviço]    Mostra os logs dos serviços"
    echo "  help              Mostra esta mensagem de ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 start          Inicia em modo de desenvolvimento"
    echo "  $0 start prod     Inicia em modo de produção"
    echo "  $0 stop           Para todos os serviços"
    echo "  $0 logs prometheus Mostra os logs do Prometheus"
}

# Processa os argumentos
case "$1" in
    start)
        start_infrastructure "$2"
        ;;
    stop)
        stop_infrastructure
        ;;
    restart)
        stop_infrastructure
        sleep 2
        start_infrastructure "$2"
        ;;
    status)
        docker-compose -f ${dir}/../docker-compose.monitoring.yml ps
        ;;
    logs)
        docker-compose -f ${dir}/../docker-compose.monitoring.yml logs -f "$2"
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "Comando inválido. Use '$0 help' para ver as opções disponíveis."
        exit 1
        ;;
esac
