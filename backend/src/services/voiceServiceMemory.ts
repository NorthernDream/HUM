import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import fileService from './fileServiceMemory';
import embeddingService from './embeddingServiceMemory';
import dashscopeService from './dashscopeService';
import { memoryStorage, Voice } from '../storage/memoryStorage';

const SAMPLES_DIR = process.env.STORAGE_PATH
  ? path.join(process.env.STORAGE_PATH, 'samples')
  : path.join(__dirname, '../../samples');

// 确保samples目录存在
(async () => {
  try {
    await fs.mkdir(SAMPLES_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create samples directory:', error);
  }
})();

export class VoiceService {
  async createVoice(
    userId: string,
    fileId: string,
    model: string,
    name?: string,
    text?: string,
    sampleText?: string
  ): Promise<Voice> {
    // 检查是否已存在（幂等性）
    const existing = memoryStorage.findVoiceByFileAndModel(fileId, model);
    if (existing) {
      return existing;
    }

    // 1. 生成 embedding hash（本地，用于标识）
    const { vector, vectorHash } = await embeddingService.generateEmbedding(fileId);
    await embeddingService.saveEmbedding(fileId, vector, vectorHash);

    // 2. 获取文件信息
    const file = await fileService.getFile(fileId);
    if (!file) {
      throw new Error('文件不存在');
    }

    // 3. 上传音频到 DashScope 并注册 CosyVoice-v2 音色
    let dashscopeVoiceId: string;
    let dashscopeFileId: string | undefined;
    try {
      console.log('正在上传音频到 DashScope...');
      const { fileId: dsFileId, ossUrl } = await dashscopeService.uploadFile(file.filePath);
      dashscopeFileId = dsFileId;

      console.log('正在注册 CosyVoice-v2 音色...');
      dashscopeVoiceId = await dashscopeService.registerVoice(ossUrl, 'hum');
    } catch (error: any) {
      // AudioSilentError 是用户音频质量问题，必须直接报错，不能 fallback
      if (error.message?.includes('AudioSilentError') || error.message?.includes('silent audio')) {
        throw new Error('音频质量不符合要求：请确保录音包含至少 5 秒以上的连续清晰语音（建议录制 10~15 秒）');
      }
      // 其他错误（如 API Key 未配置）使用本地 fallback，避免完全失败
      console.error('DashScope 音色注册失败，使用本地 fallback:', error.message);
      dashscopeVoiceId = `local-${uuidv4()}`;
    }

    // 4. 创建语音角色记录
    const voiceId = uuidv4();
    const voice: Voice = {
      id: voiceId,
      userId,
      name: name || undefined,
      stepVoiceId: dashscopeVoiceId, // 存储 DashScope voice_id
      fileId,
      model: 'cosyvoice-v2',
      text: text || undefined,
      sampleText: sampleText || undefined,
      sampleAudioPath: file.filePath,
      embeddingHash: vectorHash,
      metadata: {
        type: 'cosyvoice-v2',
        dashscopeFileId,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStorage.saveVoice(voice);
    console.log('Voice created with DashScope CosyVoice-v2:', voiceId, '→', dashscopeVoiceId);
    return voice;
  }

  async getVoice(voiceId: string): Promise<Voice | null> {
    const voice = memoryStorage.getVoice(voiceId);
    return voice || null;
  }

  async listVoices(params: {
    page?: number;
    limit?: number;
    search?: string;
    userId?: string;
  }): Promise<{ voices: Voice[]; total: number }> {
    return memoryStorage.listVoices(params);
  }

  async updateVoice(voiceId: string, data: Partial<Voice>): Promise<Voice | null> {
    const voice = await this.getVoice(voiceId);
    if (!voice) {
      return null;
    }

    if (data.text !== undefined) {
      voice.text = data.text;
    }
    if (data.name !== undefined) {
      voice.name = data.name;
    }
    if (data.metadata !== undefined) {
      voice.metadata = data.metadata;
    }
    voice.updatedAt = new Date();

    memoryStorage.saveVoice(voice);
    return voice;
  }

  async deleteVoice(voiceId: string): Promise<boolean> {
    const voice = await this.getVoice(voiceId);
    if (!voice) {
      return false;
    }

    // 删除sample音频文件
    if (voice.sampleAudioPath) {
      try {
        await fs.unlink(voice.sampleAudioPath);
      } catch (error) {
        console.error('Failed to delete sample audio:', error);
      }
    }

    return memoryStorage.deleteVoice(voiceId);
  }
}

export default new VoiceService();
