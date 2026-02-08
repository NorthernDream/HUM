import { createHash } from 'crypto';
import { memoryStorage, Embedding } from '../storage/memoryStorage';

export interface EmbeddingResult {
  vector: number[];
  vectorHash: string;
}

export class EmbeddingService {
  private dimension: number = parseInt(process.env.EMBEDDING_DIMENSION || '256');

  async generateEmbedding(fileId: string): Promise<EmbeddingResult> {
    // 使用fileId作为种子，确保可复现
    const seed = this.hashToNumber(fileId);
    const vector = this.generateRandomVector(seed, this.dimension);
    const vectorHash = this.computeHash(vector);

    return { vector, vectorHash };
  }

  async saveEmbedding(
    fileId: string,
    vector: number[],
    vectorHash: string,
    modelVersion: string = 'random-v1'
  ): Promise<Embedding> {
    const id = createHash('md5').update(`${fileId}-${vectorHash}`).digest('hex').slice(0, 32);

    // 检查是否已存在
    const existing = memoryStorage.getEmbedding(fileId);
    if (existing) {
      return existing;
    }

    const embedding: Embedding = {
      id,
      fileId,
      vector,
      vectorHash,
      dimension: vector.length,
      modelVersion,
      createdAt: new Date(),
    };

    memoryStorage.saveEmbedding(embedding);
    return embedding;
  }

  async getEmbedding(fileId: string): Promise<Embedding | null> {
    const embedding = memoryStorage.getEmbedding(fileId);
    return embedding || null;
  }

  private generateRandomVector(seed: number, dimension: number): number[] {
    // 简单的线性同余生成器
    let state = seed;
    const vector: number[] = [];

    for (let i = 0; i < dimension; i++) {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      const value = (state / 0x7fffffff) * 2 - 1; // 归一化到[-1, 1]
      vector.push(value);
    }

    // L2归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return vector.map((v) => v / norm);
  }

  private hashToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  private computeHash(vector: number[]): string {
    const buffer = Buffer.from(new Float32Array(vector).buffer);
    return createHash('sha256').update(buffer).digest('hex');
  }
}

export default new EmbeddingService();



