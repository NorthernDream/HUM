# 情感人格化语音平台

这是一个情感人格化的语音平台：任何人都可以上传并塑造自己的声音与人格，让它成为一个可被他人调用、陪伴与对话的 AI 语音角色。

## 功能特性

- 🎤 **音频上传与录音**: 支持上传MP3/WAV文件或实时录音（5-10秒）
- 🎭 **音色复刻**: 基于StepFun API进行音色复刻
- 🎵 **TTS生成**: 使用复刻的音色生成语音
- 🔢 **Embedding生成**: 临时使用随机向量作为embedding占位（后续可替换为真实codec模型）
- 📊 **角色管理**: 创建、查询、管理语音角色

## 技术栈

### 前端
- React + TypeScript + Vite
- Ant Design UI组件库
- Axios HTTP客户端
- React Router 路由管理

### 后端
- Node.js + Express + TypeScript
- PostgreSQL 数据库
- Redis 缓存（可选）
- StepFun API 集成

### 部署
- Docker + Docker Compose
- 支持本地开发和生产环境

## 快速开始

### 前置要求

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL（如果不用Docker）
- StepFun API Key

### 环境变量配置

1. 复制后端环境变量文件：
```bash
cp backend/.env.example backend/.env
```

2. 编辑 `backend/.env`，设置以下变量：
```bash
STEP_API_KEY=your_step_api_key_here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voice_platform
```

3. 复制前端环境变量文件（可选）：
```bash
cp frontend/.env.example frontend/.env
```

### 使用Docker Compose（推荐）

1. 启动所有服务：
```bash
docker-compose up -d
```

2. 初始化数据库：
```bash
docker-compose exec postgres psql -U postgres -d voice_platform -f /docker-entrypoint-initdb.d/schema.sql
```

3. 访问应用：
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- 健康检查: http://localhost:8000/health

### 本地开发

#### 后端

1. 安装依赖：
```bash
cd backend
npm install
```

2. 确保PostgreSQL运行并创建数据库：
```bash
createdb voice_platform
psql voice_platform < database/schema.sql
```

3. 启动开发服务器：
```bash
npm run dev
```

#### 前端

1. 安装依赖：
```bash
cd frontend
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

## 项目结构

```
.
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── api/          # API客户端
│   │   ├── components/   # React组件
│   │   ├── pages/        # 页面组件
│   │   └── App.tsx        # 主应用
│   └── package.json
├── backend/               # 后端服务
│   ├── src/
│   │   ├── config/       # 配置文件
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务逻辑
│   │   ├── utils/        # 工具函数
│   │   └── index.ts      # 入口文件
│   ├── database/         # 数据库脚本
│   └── package.json
└── docker-compose.yml     # Docker Compose配置
```

## API端点

### 文件服务
- `POST /api/files/upload` - 上传音频文件
- `GET /api/files/:fileId` - 获取文件信息
- `DELETE /api/files/:fileId` - 删除文件

### 角色服务
- `POST /api/voices` - 创建音色角色
- `GET /api/voices` - 列表查询
- `GET /api/voices/:voiceId` - 获取角色详情
- `PUT /api/voices/:voiceId` - 更新角色
- `DELETE /api/voices/:voiceId` - 删除角色

### TTS服务
- `POST /api/tts/generate` - 生成TTS音频

### Embedding服务
- `POST /api/embeddings/generate` - 生成embedding
- `GET /api/embeddings/:fileId` - 获取embedding

## 开发计划

### M0: 核心功能原型 ✅
- [x] 前端: 音频上传/录音、基础UI
- [x] 后端: 文件服务、StepFun集成
- [x] 算法: 随机embedding生成
- [x] 功能: 音色复刻、TTS生成

### M1: 完善与优化
- [ ] 前端: 角色管理、列表展示、试听播放
- [ ] 后端: 完整的CRUD、使用量统计
- [ ] 优化: 错误处理、性能优化

### M2: 真实模型接入（后续）
- [ ] 算法: 接入真实codec/embedding模型
- [ ] 部署: 模型服务容器化
- [ ] 性能: 推理速度优化

## 注意事项

1. **StepFun API密钥**: 需要在环境变量中配置有效的API密钥
2. **音频格式**: 目前支持MP3和WAV格式，建议5-10秒时长
3. **数据库**: 首次运行需要执行schema.sql创建表结构
4. **ffmpeg**: 音频预处理需要ffmpeg，Docker镜像已包含

## 许可证

ISC



