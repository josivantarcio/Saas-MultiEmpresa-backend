# Estágio de construção
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY ../../package*.json ../../

# Instalar dependências
RUN npm install

# Copiar código-fonte
COPY . .

# Compilar a aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Copiar dependências de produção
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiar código compilado
COPY --from=builder /app/dist ./dist

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3003

# Porta exposta
EXPOSE 3003

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]
