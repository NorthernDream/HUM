import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { memoryStorage, FileMetadata } from '../storage/memoryStorage';

const UPLOAD_DIR = process.env.STORAGE_PATH || path.join(__dirname, '../../uploads');

// 确保上传目录存在
(async () => {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
  }
})();

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
    const file: FileMetadata = {
      id,
      userId,
      filename,
      filePath,
      fileSize,
      duration,
      format,
      createdAt: new Date(),
    };

    memoryStorage.saveFile(file);
    return file;
  }

  async getFile(fileId: string): Promise<FileMetadata | null> {
    const file = memoryStorage.getFile(fileId);
    return file || null;
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

    // 删除内存记录
    return memoryStorage.deleteFile(fileId);
  }

  async updateStepFileId(fileId: string, stepFileId: string): Promise<void> {
    const file = await this.getFile(fileId);
    if (file) {
      file.stepFileId = stepFileId;
      memoryStorage.saveFile(file);
    }
  }
}

export default new FileService();



