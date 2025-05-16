#!/bin/bash
# Backup automatizado do PostgreSQL
# Uso: ./backup-postgres.sh <nome_banco> <usuario> <senha> <host> <porta>

DB_NAME=${1:-saas_ecommerce}
DB_USER=${2:-postgres}
DB_PASS=${3:-postgres}
DB_HOST=${4:-localhost}
DB_PORT=${5:-5432}

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./backups/postgres"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_$DATE.sql"

mkdir -p "$BACKUP_DIR"

export PGPASSWORD="$DB_PASS"
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "Backup PostgreSQL realizado com sucesso: $BACKUP_FILE"
else
  echo "Erro ao realizar backup do PostgreSQL."
fi
