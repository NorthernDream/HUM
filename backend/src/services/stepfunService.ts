import axios, { AxiosError } from 'axios';

const STEP_API_BASE_URL = 'https://api.stepfun.com/v1';
const STEP_API_KEY = process.env.STEP_API_KEY;

if (!STEP_API_KEY) {
  console.warn('WARNING: STEP_API_KEY is not set in environment variables');
}

export interface CloneVoiceRequest {
  fileId: string;
  model: string;
  text?: string;
  sampleText?: string;
}

export interface CloneVoiceResponse {
  id: string;
  object: string;
  duplicated?: boolean;
  sampleText?: string;
  sampleAudio?: string; // base64
}

export interface GenerateSpeechRequest {
  input: string;
  voice: string;
  model: string;
}

export class StepFunService {
  private async makeRequest<T>(method: string, endpoint: string, data?: any): Promise<T> {
    if (!STEP_API_KEY) {
      throw new Error('STEP_API_KEY is not configured');
    }

    try {
      const response = await axios({
        method,
        url: `${STEP_API_BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STEP_API_KEY}`,
        },
        data,
        timeout: 30000,
      });

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 401) {
        const errorMessage = axiosError.response?.data || 'Invalid API key';
        console.error('StepFun API authentication error:', errorMessage);
        throw new Error('API密钥无效，请检查配置');
      }

      if (axiosError.response?.status === 429) {
        throw new Error('API请求频率过高，请稍后重试');
      }

      if (axiosError.code === 'ECONNABORTED') {
        throw new Error('请求超时，请稍后重试');
      }

      throw new Error(axiosError.message || 'StepFun API请求失败');
    }
  }

  /**
   * 复刻音色
   */
  async cloneVoice(request: CloneVoiceRequest): Promise<CloneVoiceResponse> {
    return this.makeRequest<CloneVoiceResponse>('POST', '/audio/voices', {
      file_id: request.fileId,
      model: request.model,
      text: request.text,
      sample_text: request.sampleText,
    });
  }

  /**
   * 生成TTS音频
   */
  async generateSpeech(request: GenerateSpeechRequest): Promise<Buffer> {
    const response = await axios({
      method: 'POST',
      url: `${STEP_API_BASE_URL}/audio/speech`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STEP_API_KEY}`,
      },
      data: {
        input: request.input,
        voice: request.voice,
        model: request.model,
      },
      responseType: 'arraybuffer',
      timeout: 30000,
    });

    return Buffer.from(response.data);
  }
}

export default new StepFunService();



