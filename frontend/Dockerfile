FROM node:20 AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --include=dev || npm install
COPY . .
RUN npm run build

# Usar nginx para servir arquivos estáticos
FROM nginx:1.25-alpine

# Remover configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nova configuração
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar arquivo de configuração
RUN echo 'server { \
  listen 80 default_server; \
  server_name _; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
