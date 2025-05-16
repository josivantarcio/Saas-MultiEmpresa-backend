#!/bin/bash
# Backup automatizado do MongoDB
# Uso: ./backup-mongodb.sh <usuario> <senha> <host> <porta> <database>

MONGO_USER=${1:-mongodb}
MONGO_PASS=${2:-mongodb}
MONGO_HOST=${3:-localhost}
MONGO_PORT=${4:-27017}
MONGO_DB=${5:-saas_ecommerce}

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="./backups/mongodb"
BACKUP_PATH="$BACKUP_DIR/${MONGO_DB}_$DATE"

mkdir -p "$BACKUP_DIR"

mongodump --host $MONGO_HOST --port $MONGO_PORT -u $MONGO_USER -p $MONGO_PASS --db $MONGO_DB --out "$BACKUP_PATH"

if [ $? -eq 0 ]; then
  tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "${MONGO_DB}_$DATE"
  rm -rf "$BACKUP_PATH"
  echo "Backup MongoDB realizado com sucesso: $BACKUP_PATH.tar.gz"
else
  echo "Erro ao realizar backup do MongoDB."
fi
