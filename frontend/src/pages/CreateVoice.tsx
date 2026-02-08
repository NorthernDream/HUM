import { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  Input,
  Select,
  Progress,
  message,
  Steps,
  Space,
} from 'antd';
import { UploadOutlined, AudioOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { uploadFile } from '../api/files';
import { createVoice } from '../api/voices';
import AudioRecorder from '../components/AudioRecorder';
import AudioWaveform from '../components/AudioWaveform';

const { TextArea } = Input;
const { Option } = Select;

type ProcessingStep = 'upload' | 'embedding' | 'cloning' | 'complete';

const CreateVoice = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [model, setModel] = useState('step-tts-mini');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
  const [voiceResult, setVoiceResult] = useState<any>(null);

  const handleFileSelect = (file: File) => {
    // 格式校验
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!validTypes.includes(file.type)) {
      message.error('只支持 MP3 或 WAV 格式');
      return false;
    }

    // 大小限制
    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过 10MB');
      return false;
    }

    setFile(file);
    return false; // 阻止自动上传
  };

  const handleUpload = async () => {
    if (!file) {
      message.error('请先选择音频文件');
      return;
    }

    setProcessing(true);
    setCurrentStep('upload');

    try {
      // 上传文件
      const response = await uploadFile(file, (progressEvent) => {
        const percent = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        setUploadProgress(percent);
      });

      if (response.success) {
        setFileId(response.data.fileId);
        setCurrentStep('embedding');

        // 创建音色
        const voiceResponse = await createVoice({
          fileId: response.data.fileId,
          text: text || undefined,
          sampleText: sampleText || undefined,
          model,
        });

        if (voiceResponse.success) {
          setCurrentStep('complete');
          setVoiceResult(voiceResponse.data);
          message.success('音色创建成功！');
        }
      }
    } catch (error: any) {
      message.error(error.message || '创建失败');
    } finally {
      setProcessing(false);
    }
  };

  const steps = [
    { title: '上传音频', status: currentStep === 'upload' ? 'process' : 'finish' },
    { title: '生成Embedding', status: currentStep === 'embedding' ? 'process' : 'wait' },
    { title: '复刻音色', status: currentStep === 'cloning' ? 'process' : 'wait' },
    { title: '完成', status: currentStep === 'complete' ? 'finish' : 'wait' },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card title="创建语音角色">
        <Steps current={steps.findIndex((s) => s.status === 'process')} items={steps} style={{ marginBottom: '32px' }} />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: '8px' }}>音频文件（5-10秒，MP3/WAV）</div>
            <Upload
              beforeUpload={handleFileSelect}
              accept="audio/mpeg,audio/wav,audio/mp3"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <AudioRecorder onRecordComplete={(file) => setFile(file)} />
            {file && (
              <div style={{ marginTop: '16px' }}>
                <div>文件名: {file.name}</div>
                <div>大小: {(file.size / 1024).toFixed(2)} KB</div>
                <AudioWaveform file={file} />
              </div>
            )}
            {processing && currentStep === 'upload' && (
              <Progress percent={uploadProgress} style={{ marginTop: '16px' }} />
            )}
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>音频对应文本（可选，建议填写）</div>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入音频对应的文本内容"
              rows={3}
            />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>试听文本（可选，最多50字）</div>
            <TextArea
              value={sampleText}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setSampleText(e.target.value);
                }
              }}
              placeholder="用于生成试听音频的文本"
              rows={2}
              maxLength={50}
              showCount
            />
          </div>

          <div>
            <div style={{ marginBottom: '8px' }}>模型选择</div>
            <Select value={model} onChange={setModel} style={{ width: '100%' }}>
              <Option value="step-tts-2">step-tts-2</Option>
              <Option value="step-tts-mini">step-tts-mini</Option>
              <Option value="step-tts-vivid">step-tts-vivid</Option>
              <Option value="step-audio-2">step-audio-2</Option>
            </Select>
          </div>

          <Button
            type="primary"
            size="large"
            onClick={handleUpload}
            loading={processing}
            disabled={!file}
            block
          >
            创建音色
          </Button>

          {voiceResult && (
            <Card title="创建成功">
              <div>Voice ID: {voiceResult.voiceId}</div>
              <div>Embedding Hash: {voiceResult.embeddingHash}</div>
              {voiceResult.sampleAudio && (
                <div style={{ marginTop: '16px' }}>
                  <div>试听音频:</div>
                  <audio controls src={`data:audio/wav;base64,${voiceResult.sampleAudio}`} />
                </div>
              )}
            </Card>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CreateVoice;



