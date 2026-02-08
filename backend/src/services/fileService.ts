import { Pool } from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database';

const UPLOAD_DIR = process.env.STORAGE_PATH || path.join(__dirname, '../../uploads');

// 确保上传目录存在
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
})();

export interface FileMetadata {
  id: string;
  userId: string;
  filename: string;
  filePath: string;
  fileSize: number;
  duration: number;
  format: string;
  stepFileId?: string;
  createdAt: Date;
}

export class FileService {
  async uploadFile(
    userId: string,
    filename: string,
    filePath: string,
    fileSize: number,
    duration: number,
    format: string
  ): Promise<FileMetadata> {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO files (id, user_id, filename, file_path, file_size, duration, format, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [id, userId, filename, filePath, fileSize, duration, format]
    );

    return this.mapRowToFileMetadata(result.rows[0]);
  }

  async getFile(fileId: string): Promise<FileMetadata | null> {
    const result = await pool.query('SELECT * FROM files WHERE id = $1', [fileId]);
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapRowToFileMetadata(result.rows[0]);
  }

  async deleteFile(fileId: string): Promise<boolean> {
    const file = await this.getFile(fileId);
    if (!file) {
      return false;
    }

    // 删除文件
    try {
      await fs.unlink(file.filePath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    // 删除数据库记录
    await pool.query('DELETE FROM files WHERE id = $1', [fileId]);
    return true;
  }

  async updateStepFileId(fileId: string, stepFileId: string): Promise<void> {
    await pool.query('UPDATE files SET step_file_id = $1 WHERE id = $2', [stepFileId, fileId]);
  }

  private mapRowToFileMetadata(row: any): FileMetadata {
    return {
      id: row.id,
      userId: row.user_id,
      filename: row.filename,
      filePath: row.file_path,
      fileSize: row.file_size,
      duration: row.duration,
      format: row.format,
      stepFileId: row.step_file_id,
      createdAt: row.created_at,
    };
  }
}

export default new FileService();



