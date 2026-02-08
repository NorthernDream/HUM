import { createHash } from 'crypto';
import { Pool } from 'pg';
import pool from '../config/database';

export interface Embedding {
  id: string;
  fileId: string;
  vector: number[];
  vectorHash: string;
  dimension: number;
  modelVersion: string;
  createdAt: Date;
}

export class EmbeddingService {
  private dimension: number = parseInt(process.env.EMBEDDING_DIMENSION || '256');

  /**
   * 生成随机embedding向量（临时实现）
   */
  async generateEmbedding(fileId: string): Promise<{ vector: number[]; vectorHash: string }> {
    // 使用fileId作为种子，确保可复现
    const seed = this.hashToNumber(fileId);
    const vector = this.generateRandomVector(seed, this.dimension);
    const vectorHash = this.computeHash(vector);

    return { vector, vectorHash };
  }

  /**
   * 保存embedding到数据库
   */
  async saveEmbedding(
    fileId: string,
    vector: number[],
    vectorHash: string,
    modelVersion: string = 'random-v1'
  ): Promise<Embedding> {
    const id = createHash('md5').update(`${fileId}-${vectorHash}`).digest('hex').slice(0, 32);

    // 检查是否已存在
    const existing = await pool.query('SELECT * FROM embeddings WHERE file_id = $1', [fileId]);
    if (existing.rows.length > 0) {
      return this.mapRowToEmbedding(existing.rows[0]);
    }

    const result = await pool.query(
      `INSERT INTO embeddings (id, file_id, vector, vector_hash, dimension, model_version, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [id, fileId, JSON.stringify(vector), vectorHash, vector.length, modelVersion]
    );

    return this.mapRowToEmbedding(result.rows[0]);
  }

  /**
   * 获取embedding
   */
  async getEmbedding(fileId: string): Promise<Embedding | null> {
    const result = await pool.query('SELECT * FROM embeddings WHERE file_id = $1', [fileId]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToEmbedding(result.rows[0]);
  }

  /**
   * 生成随机向量（基于种子）
   */
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

  /**
   * 将字符串哈希为数字
   */
  private hashToNumber(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  /**
   * 计算向量哈希
   */
  private computeHash(vector: number[]): string {
    const buffer = Buffer.from(new Float32Array(vector).buffer);
    return createHash('sha256').update(buffer).digest('hex');
  }

  private mapRowToEmbedding(row: any): Embedding {
    return {
      id: row.id,
      fileId: row.file_id,
      vector: typeof row.vector === 'string' ? JSON.parse(row.vector) : row.vector,
      vectorHash: row.vector_hash,
      dimension: row.dimension,
      modelVersion: row.model_version,
      createdAt: row.created_at,
    };
  }
}

export default new EmbeddingService();



