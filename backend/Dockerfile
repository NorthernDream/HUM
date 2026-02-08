FROM node:20-alpine

WORKDIR /app

# 安装ffmpeg（用于音频处理）
RUN apk add --no-cache ffmpeg

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["npm", "run", "dev"]



