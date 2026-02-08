import express, { Request, Response } from 'express';
import ttsService from '../services/ttsServiceMemory';
import { sendSuccess, sendError } from '../utils/response';

const router = express.Router();

// 生成TTS
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { voiceId, input, model } = req.body;

    if (!voiceId || !input || !model) {
      return sendError(res, 'voiceId、input和model是必填项', 400);
    }

    const userId = (req as any).userId || 'default-user';
    const result = await ttsService.generateTTS({
      userId,
      voiceId,
      input,
      model,
    });

    sendSuccess(res, {
      audioUrl: result.audioUrl,
      duration: result.duration,
    });
  } catch (error: any) {
    console.error('Generate TTS error:', error);
    sendError(res, error.message || '生成TTS失败', 500, error);
  }
});

export default router;

