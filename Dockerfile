# ---- Stage 1: 构建前端 ----
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# 前端直接请求 /api，由同源后端处理，无需指定外部 URL
RUN npm run build


# ---- Stage 2: 构建后端 ----
FROM node:20-alpine AS backend-builder

WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build


# ---- Stage 3: 运行时镜像 ----
FROM node:20-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

# 复制后端依赖和构建产物
COPY --from=backend-builder /app/node_modules ./node_modules
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/package*.json ./

# 将前端构建产物放到 backend 期望的 public 目录
COPY --from=frontend-builder /frontend/dist ./public

EXPOSE 8000
CMD ["npm", "start"]
