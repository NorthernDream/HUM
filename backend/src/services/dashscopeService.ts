import axios, { AxiosError } from 'axios';
import { Agent as HttpsAgent } from 'https';
import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';

const DASHSCOPE_API_BASE = 'https://dashscope.aliyuncs.com';

// 对 DashScope（阿里云国内服务）强制直连，绕过 Clash/代理 TUN 干扰
// 设置 proxy: false 让 axios 不走系统代理
const directAxios = axios.create({
  proxy: false,
  httpsAgent: new HttpsAgent({ keepAlive: true }),
});

const getApiKey = (): string => {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not configured');
  }
  return apiKey;
};

export class DashScopeService {
  /**
   * 上传音频文件到 DashScope，返回 file_id 和 OSS URL
   * 对应 demo: Files.upload(file_path, purpose='file-extract') + Files.get(file_id)
   */
  async uploadFile(filePath: string): Promise<{ fileId: string; ossUrl: string }> {
    const apiKey = getApiKey();
    const FormData = require('form-data');
    const fs = require('fs');

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    // purpose 必须用 'file-extract'，否则 DashScope 会做 jsonl 格式校验
    formData.append('purpose', 'file-extract');

    try {
      // Step 1: 上传文件（compatible-mode 兼容 OpenAI Files API 格式）
      const uploadResp = await directAxios.post(
        `${DASHSCOPE_API_BASE}/compatible-mode/v1/files`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 60000,
        }
      );

      // compatible-mode 响应: { id, object, bytes, ... }（OpenAI 格式）
      const fileId = uploadResp.data.id;
      if (!fileId) {
        throw new Error(`上传成功但未获取到 file_id: ${JSON.stringify(uploadResp.data)}`);
      }
      console.log(`DashScope 文件上传成功，file_id: ${fileId}`);

      // Step 2: 用原生 DashScope API 获取 OSS URL
      // Python SDK Files.get() 对应 GET /api/v1/files/{file_id}
      // 原生响应格式: { output: { url: "https://..." }, request_id: "..." }
      const fileResp = await directAxios.get(
        `${DASHSCOPE_API_BASE}/api/v1/files/${fileId}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
        }
      );

      // 实际响应结构: { data: { url: "http://..." }, request_id: "..." }
      const ossUrl: string =
        fileResp.data?.data?.url ||    // 实际路径（已确认）
        fileResp.data?.output?.url ||  // 备用：原生 DashScope 格式
        fileResp.data?.url ||          // 备用：compatible-mode 格式
        '';

      if (!ossUrl || !ossUrl.startsWith('http')) {
        throw new Error(`未获取到有效 OSS URL，响应: ${JSON.stringify(fileResp.data)}`);
      }

      // DashScope 返回的 OSS URL 可能是 HTTP，强制转为 HTTPS 以满足 voice-enrollment API 要求
      const secureOssUrl = ossUrl.replace(/^http:\/\//, 'https://');
      console.log(`DashScope OSS URL 获取成功`);
      return { fileId, ossUrl: secureOssUrl };
    } catch (error) {
      const axiosError = error as AxiosError;
      const errMsg = (error as Error).message || axiosError.message;
      console.error('DashScope 文件上传/URL获取失败:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        message: errMsg,
      });
      throw new Error(`文件上传到 DashScope 失败: ${errMsg}`);
    }
  }

  /**
   * 注册音色（对应 demo: VoiceEnrollmentService.create_voice）
   * 参数 ossUrl 来自 uploadFile 的返回值
   */
  async registerVoice(ossUrl: string, prefix: string = 'clonedvoice'): Promise<string> {
    const apiKey = getApiKey();
    // 正确端点: POST /api/v1/services/audio/tts/customization
    // 正确格式: model="voice-enrollment", input.target_model="cosyvoice-v2"
    // 参考: https://help.aliyun.com/zh/model-studio/cosyvoice-clone-api
    try {
      const resp = await directAxios.post(
        `${DASHSCOPE_API_BASE}/api/v1/services/audio/tts/customization`,
        {
          model: 'voice-enrollment',
          input: {
            action: 'create_voice',
            target_model: 'cosyvoice-v2',
            prefix,
            url: ossUrl,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          timeout: 60000,
        }
      );

      console.log(`[registerVoice] 响应:`, JSON.stringify(resp.data));

      const voiceId: string = resp.data?.output?.voice_id || '';
      if (!voiceId) {
        throw new Error(`注册成功但未获取到 voice_id: ${JSON.stringify(resp.data)}`);
      }

      console.log(`DashScope 音色注册成功，voice_id: ${voiceId}`);
      return voiceId;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('[registerVoice] 失败:', {
        status: axiosError.response?.status,
        data: JSON.stringify(axiosError.response?.data),
        message: axiosError.message,
      });
      throw new Error(`音色注册失败(${axiosError.response?.status}): ${JSON.stringify(axiosError.response?.data)}`);
    }
  }

  /**
   * 使用 CosyVoice-v2 通过 WebSocket 生成 TTS
   * CosyVoice 系列模型仅支持 WebSocket，不支持 HTTP REST
   * 参考: https://help.aliyun.com/zh/model-studio/cosyvoice-websocket-api
   */
  async generateSpeech(text: string, voiceId: string): Promise<Buffer> {
    const apiKey = getApiKey();
    const taskId = uuidv4();

    return new Promise<Buffer>((resolve, reject) => {
      const audioChunks: Buffer[] = [];
      let settled = false;

      const done = (err?: Error) => {
        if (settled) return;
        settled = true;
        if (err) {
          reject(err);
        } else {
          resolve(Buffer.concat(audioChunks));
        }
      };

      const ws = new WebSocket('wss://dashscope.aliyuncs.com/api-ws/v1/inference', {
        headers: { Authorization: `Bearer ${apiKey}` },
        // 使用自定义 Agent 绕过 Clash TUN 代理干扰（与 directAxios 同理）
        agent: new HttpsAgent({ keepAlive: true }),
      });

      const timeout = setTimeout(() => {
        ws.terminate();
        done(new Error('TTS WebSocket 超时'));
      }, 60000);

      ws.on('open', () => {
        ws.send(JSON.stringify({
          header: { action: 'run-task', task_id: taskId, streaming: 'duplex' },
          payload: {
            task_group: 'audio',
            task: 'tts',
            function: 'SpeechSynthesizer',
            model: 'cosyvoice-v2',
            parameters: { voice: voiceId, format: 'mp3', sample_rate: 22050 },
            input: {},
          },
        }));
      });

      ws.on('message', (data: Buffer | string, isBinary: boolean) => {
        if (isBinary) {
          audioChunks.push(data as Buffer);
          return;
        }

        let event: any;
        try {
          event = JSON.parse(data.toString());
        } catch {
          return;
        }

        const eventType: string = event?.header?.event ?? '';
        console.log(`[TTS WS] event: ${eventType}`);

        if (eventType === 'task-started') {
          ws.send(JSON.stringify({
            header: { action: 'continue-task', task_id: taskId, streaming: 'duplex' },
            payload: { input: { text } },
          }));
          ws.send(JSON.stringify({
            header: { action: 'finish-task', task_id: taskId, streaming: 'duplex' },
            payload: { input: {} },
          }));
        } else if (eventType === 'task-finished') {
          clearTimeout(timeout);
          ws.close();
          done();
        } else if (eventType === 'task-failed') {
          clearTimeout(timeout);
          ws.close();
          done(new Error(`TTS 任务失败: ${JSON.stringify(event)}`));
        }
      });

      ws.on('error', (err: Error) => {
        clearTimeout(timeout);
        done(new Error(`TTS WebSocket 错误: ${err.message}`));
      });
    });
  }
}

export default new DashScopeService();
