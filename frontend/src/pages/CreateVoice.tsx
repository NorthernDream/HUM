import { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  Progress,
  message,
  Space,
} from 'antd';
import { UploadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { uploadFile } from '../api/files';
import { createVoice } from '../api/voices';
import AudioRecorder from '../components/AudioRecorder';
import AudioWaveform from '../components/AudioWaveform';

type ProcessingStep = 'upload' | 'processing' | 'complete';

const CreateVoice = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
  const [voiceResult, setVoiceResult] = useState<any>(null);

  const handleFileSelect = (file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      message.error('只支持 MP3、WAV 或 WebM 格式');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('文件大小不能超过 10MB');
      return false;
    }

    setFile(file);
    setVoiceResult(null);
    return false;
  };

  const handleCreateVoice = async () => {
    if (!file) {
      message.error('请先选择或录制音频文件');
      return;
    }

    setProcessing(true);
    setCurrentStep('upload');

    try {
      const uploadResponse = await uploadFile(file, (progressEvent) => {
        const percent = progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
        setUploadProgress(percent);
      });

      if (!uploadResponse.success) {
        throw new Error('文件上传失败');
      }

      setCurrentStep('processing');

      const voiceResponse = await createVoice({
        fileId: uploadResponse.data.fileId,
        model: 'codec',
      });

      if (voiceResponse.success) {
        setCurrentStep('complete');
        setVoiceResult(voiceResponse.data);
        message.success('语音角色创建成功');
      }
    } catch (error: any) {
      message.error(error.message || '创建失败');
      setCurrentStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setVoiceResult(null);
    setCurrentStep('upload');
    setUploadProgress(0);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card 
        bordered={false}
        style={{ 
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(44, 62, 80, 0.08)',
        }}
        bodyStyle={{ padding: '48px' }}
      >
        <h2 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '20px', 
          fontWeight: 600,
          color: '#2C3E50',
          letterSpacing: '-0.3px',
        }}>
          创建语音角色
        </h2>
        <p style={{ 
          margin: '0 0 32px 0', 
          fontSize: '14px', 
          color: '#6C757D',
          lineHeight: '1.6',
        }}>
          使用 Codec 模型将音频编码成 Embedding
        </p>

        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          {/* Upload Section */}
          <div>
            <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, color: '#2C3E50' }}>
              上传或录制音频（1-10秒）
            </div>
            
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Upload
                beforeUpload={handleFileSelect}
                accept="audio/mpeg,audio/wav,audio/mp3,audio/webm"
                showUploadList={false}
                disabled={processing}
              >
                <Button 
                  icon={<UploadOutlined />} 
                  disabled={processing}
                  size="large"
                  style={{ borderRadius: '8px', height: '48px', fontSize: '15px' }}
                >
                  选择音频文件
                </Button>
              </Upload>

              <AudioRecorder 
                onRecordComplete={(recordedFile) => {
                  setFile(recordedFile);
                  setVoiceResult(null);
                }} 
              />
            </Space>

            {file && (
              <div style={{ 
                marginTop: '24px', 
                padding: '24px', 
                background: '#F8F9FA', 
                borderRadius: '8px',
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#6C757D' }}>文件名：</span>
                  <span style={{ fontSize: '14px', color: '#2C3E50', marginLeft: '8px' }}>{file.name}</span>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#6C757D' }}>大小：</span>
                  <span style={{ fontSize: '14px', color: '#2C3E50', marginLeft: '8px' }}>
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <AudioWaveform file={file} />
              </div>
            )}

            {processing && currentStep === 'upload' && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6C757D' }}>上传中...</div>
                <Progress 
                  percent={uploadProgress} 
                  strokeColor="#3498DB"
                  trailColor="#E9ECEF"
                />
              </div>
            )}

            {processing && currentStep === 'processing' && (
              <div style={{ marginTop: '24px' }}>
                <Progress 
                  percent={100} 
                  status="active"
                  strokeColor="#3498DB"
                  trailColor="#E9ECEF"
                />
                <div style={{ marginTop: '12px', textAlign: 'center', color: '#3498DB', fontSize: '14px' }}>
                  正在生成语音角色...
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {!voiceResult && (
            <Button
              type="primary"
              size="large"
              onClick={handleCreateVoice}
              loading={processing}
              disabled={!file || processing}
              block
              style={{ 
                height: '48px',
                fontSize: '15px',
                fontWeight: 500,
                borderRadius: '8px',
              }}
            >
              {processing ? '创建中...' : '创建语音角色'}
            </Button>
          )}

          {/* Success Result */}
          {voiceResult && (
            <div style={{ 
              padding: '32px',
              background: '#F8F9FA',
              borderRadius: '8px',
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <CheckCircleOutlined style={{ fontSize: '24px', color: '#27AE60', marginRight: '12px' }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '18px', 
                  fontWeight: 600,
                  color: '#2C3E50',
                }}>
                  创建成功
                </h3>
              </div>

              <Space direction="vertical" size={20} style={{ width: '100%' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px' }}>Voice ID</div>
                  <div style={{ 
                    padding: '12px', 
                    background: '#FFFFFF', 
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#2C3E50',
                    wordBreak: 'break-all',
                    border: '1px solid #E9ECEF',
                  }}>
                    {voiceResult.voiceId}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px' }}>Embedding Hash</div>
                  <div style={{ 
                    padding: '12px', 
                    background: '#FFFFFF', 
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: '#2C3E50',
                    wordBreak: 'break-all',
                    border: '1px solid #E9ECEF',
                  }}>
                    {voiceResult.embeddingHash}
                  </div>
                </div>

                {voiceResult.sampleAudio && (
                  <div>
                    <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px' }}>试听音频</div>
                    <audio 
                      controls 
                      src={`data:audio/wav;base64,${voiceResult.sampleAudio}`}
                      style={{ width: '100%', height: '40px' }}
                    />
                  </div>
                )}

                <Button 
                  type="primary" 
                  onClick={handleReset} 
                  block
                  size="large"
                  style={{ 
                    height: '48px',
                    fontSize: '15px',
                    fontWeight: 500,
                    borderRadius: '8px',
                    marginTop: '8px',
                  }}
                >
                  创建新角色
                </Button>
              </Space>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default CreateVoice;



