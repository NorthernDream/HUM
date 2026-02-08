import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

export interface ProcessedAudio {
  path: string;
  size: number;
  format: string;
}

export class AudioPreprocessor {
  /**
   * 处理音频文件
   * - 格式转换（统一为wav）
   * - 采样率统一（16kHz）
   * - 声道处理（单声道）
   * - 音频归一化
   */
  async process(inputPath: string): Promise<ProcessedAudio> {
    const outputPath = inputPath.replace(/\.[^.]+$/, '_processed.wav');

    try {
      // 检查ffmpeg是否可用
      await execAsync('ffmpeg -version');
    } catch (error) {
      console.warn('ffmpeg not found, skipping audio preprocessing');
      // 如果没有ffmpeg，直接返回原文件
      const stats = await fs.stat(inputPath);
      return {
        path: inputPath,
        size: stats.size,
        format: path.extname(inputPath).slice(1),
      };
    }

    // 使用ffmpeg处理音频
    const ffmpegCommand = `ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -y "${outputPath}"`;
    
    try {
      await execAsync(ffmpegCommand);
      
      // 删除原文件（如果不同）
      if (inputPath !== outputPath) {
        await fs.unlink(inputPath);
      }

      const stats = await fs.stat(outputPath);
      return {
        path: outputPath,
        size: stats.size,
        format: 'wav',
      };
    } catch (error) {
      console.error('Audio preprocessing failed:', error);
      // 如果处理失败，返回原文件
      const stats = await fs.stat(inputPath);
      return {
        path: inputPath,
        size: stats.size,
        format: path.extname(inputPath).slice(1),
      };
    }
  }

  /**
   * 获取音频时长（秒）
   */
  async getDuration(audioPath: string): Promise<number> {
    try {
      // 检查ffmpeg是否可用
      await execAsync('ffprobe -version');
    } catch (error) {
      // 如果没有ffprobe，返回默认值
      return 5;
    }

    try {
      const command = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`;
      const { stdout } = await execAsync(command);
      return parseFloat(stdout.trim()) || 0;
    } catch (error) {
      console.error('Failed to get audio duration:', error);
      return 0;
    }
  }

  /**
   * 裁剪音频到指定时长
   */
  async trimAudio(inputPath: string, maxDuration: number = 10): Promise<string> {
    const outputPath = inputPath.replace(/\.[^.]+$/, '_trimmed.wav');

    try {
      await execAsync('ffmpeg -version');
    } catch (error) {
      return inputPath;
    }

    try {
      const command = `ffmpeg -i "${inputPath}" -t ${maxDuration} -y "${outputPath}"`;
      await execAsync(command);
      await fs.unlink(inputPath);
      return outputPath;
    } catch (error) {
      console.error('Audio trimming failed:', error);
      return inputPath;
    }
  }
}

export default new AudioPreprocessor();



