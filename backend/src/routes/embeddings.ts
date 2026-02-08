import express, { Request, Response } from 'express';
import embeddingService from '../services/embeddingServiceMemory';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// 生成embedding
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { fileId } = req.body;

    if (!fileId) {
      return sendError(res, 'fileId是必填项', 400);
    }

    const { vector, vectorHash } = await embeddingService.generateEmbedding(fileId);
    const embedding = await embeddingService.saveEmbedding(fileId, vector, vectorHash);

    sendSuccess(res, {
      embeddingId: embedding.id,
      vector,
      vectorHash: embedding.vectorHash,
      dimension: embedding.dimension,
    });
  } catch (error: any) {
    sendError(res, error.message || '生成embedding失败', 500, error);
  }
});

// 获取embedding
router.get('/:fileId', async (req: Request, res: Response) => {
  try {
    const fileId = Array.isArray(req.params.fileId) ? req.params.fileId[0] : req.params.fileId;
    const embedding = await embeddingService.getEmbedding(fileId);
    if (!embedding) {
      return sendError(res, 'Embedding不存在', 404);
    }
    sendSuccess(res, embedding);
  } catch (error: any) {
    sendError(res, error.message || '获取embedding失败', 500, error);
  }
});

export default router;

