import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fileRoutes from './routes/files';
import voiceRoutes from './routes/voices';
import ttsRoutes from './routes/tts';
import embeddingRoutes from './routes/embeddings';

const app = express();
const PORT = process.env.PORT || 8000;

// 中间件
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 上传的音频文件（用于试听）
const uploadsDir = process.env.STORAGE_PATH
  ? path.resolve(process.env.STORAGE_PATH)
  : path.join(__dirname, '../uploads');
app.use('/api/files/uploads', express.static(uploadsDir));

// 静态文件服务 - TTS生成的音频文件
const ttsOutputDir = process.env.STORAGE_PATH
  ? path.join(path.resolve(process.env.STORAGE_PATH), 'tts_outputs')
  : path.join(__dirname, '../tts_outputs');
app.use('/api/files/tts', express.static(ttsOutputDir));

// 路由
app.use('/api/files', fileRoutes);
app.use('/api/voices', voiceRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/embeddings', embeddingRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 托管前端静态文件（生产环境）
const frontendDist = path.join(__dirname, '../../public');
app.use(express.static(frontendDist));

// SPA 路由回退：所有非 /api 请求返回 index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

