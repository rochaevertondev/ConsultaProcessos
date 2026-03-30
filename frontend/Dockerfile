FROM node:20 AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --include=dev || npm install
COPY . .
RUN npm run build

# Usar nginx para servir arquivos estáticos
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
  listen 80; \
  location / { \
    root /usr/share/nginx/html; \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
