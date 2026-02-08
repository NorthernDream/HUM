import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import fileService from './fileServiceMemory';
import embeddingService from './embeddingServiceMemory';
import stepfunService, { CloneVoiceRequest } from './stepfunService';
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
    text?: string,
    sampleText?: string
  ): Promise<Voice> {
    // 检查是否已存在（幂等性）
    const existing = memoryStorage.findVoiceByFileAndModel(fileId, model);
    if (existing) {
      return existing;
    }

    // 1. 生成embedding
    const { vector, vectorHash } = await embeddingService.generateEmbedding(fileId);
    await embeddingService.saveEmbedding(fileId, vector, vectorHash);

    // 2. 获取文件信息
    const file = await fileService.getFile(fileId);
    if (!file) {
      throw new Error('文件不存在');
    }

    // 3. 调用StepFun复刻音色
    const stepFileId = file.stepFileId || fileId; // 如果没有stepFileId，使用fileId
    const cloneRequest: CloneVoiceRequest = {
      fileId: stepFileId,
      model,
      text,
      sampleText,
    };

    const cloneResponse = await stepfunService.cloneVoice(cloneRequest);

    // 4. 保存sample音频
    let sampleAudioPath: string | undefined;
    if (cloneResponse.sampleAudio) {
      const voiceId = uuidv4();
      sampleAudioPath = path.join(SAMPLES_DIR, `${voiceId}.wav`);
      const audioBuffer = Buffer.from(cloneResponse.sampleAudio, 'base64');
      await fs.writeFile(sampleAudioPath, audioBuffer);
    }

    // 5. 保存到内存
    const id = uuidv4();
    const voice: Voice = {
      id,
      userId,
      stepVoiceId: cloneResponse.id,
      fileId,
      model,
      text: text || undefined,
      sampleText: sampleText || undefined,
      sampleAudioPath: sampleAudioPath || undefined,
      embeddingHash: vectorHash,
      metadata: { duplicated: cloneResponse.duplicated || false },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryStorage.saveVoice(voice);
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



