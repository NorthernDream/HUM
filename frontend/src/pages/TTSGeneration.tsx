import { useState, useEffect } from 'react';
import { Card, Input, Select, Button, message, Space, Row, Col, Divider } from 'antd';
import { SoundOutlined, DownloadOutlined, PlayCircleOutlined, AudioOutlined } from '@ant-design/icons';
import { generateTTS } from '../api/tts';
import { listVoices, type Voice } from '../api/voices';

const { TextArea } = Input;
const { Option } = Select;

const TTSGeneration = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [model, setModel] = useState('step-tts-mini');
  const [inputText, setInputText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await listVoices();
      if (response.success) {
        setVoices(response.data.voices);
      }
    } catch (error) {
      console.error('加载角色列表失败:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedVoiceId) {
      message.error('请选择Voice');
      return;
    }
    if (!inputText.trim()) {
      message.error('请输入文本');
      return;
    }

    setGenerating(true);
    try {
      const response = await generateTTS({
        voiceId: selectedVoiceId,
        input: inputText,
        model,
      });

      if (response.success) {
        if (response.data.audioUrl) {
          setAudioUrl(response.data.audioUrl);
        }
        if (response.data.audioBase64) {
          setAudioBase64(response.data.audioBase64);
        }
        message.success('生成成功');
      }
    } catch (error: any) {
      message.error(error.message || '生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      window.open(audioUrl, '_blank');
    } else if (audioBase64) {
      const link = document.createElement('a');
      link.href = `data:audio/mp3;base64,${audioBase64}`;
      link.download = 'tts-output.mp3';
      link.click();
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Demo Section */}
      <Card 
        bordered={false}
        style={{ 
          marginBottom: '32px',
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(44, 62, 80, 0.08)',
        }}
        bodyStyle={{ padding: '48px' }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '32px',
        }}>
          <PlayCircleOutlined style={{ fontSize: '24px', color: '#3498DB', marginRight: '12px' }} />
          <h2 style={{ 
            margin: 0, 
            fontSize: '20px', 
            fontWeight: 600,
            color: '#2C3E50',
            letterSpacing: '-0.3px',
          }}>
            效果示例
          </h2>
        </div>
        
        <div style={{ marginBottom: '32px', color: '#6C757D', fontSize: '15px', lineHeight: '1.6' }}>
          以下展示语音克隆的效果对比，原始音频与克隆后的音频
        </div>
        
        <Row gutter={32}>
          {/* Original Audio */}
          <Col xs={24} lg={12}>
            <div style={{ 
              padding: '32px',
              background: '#F8F9FA',
              borderRadius: '8px',
              height: '100%',
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <AudioOutlined style={{ fontSize: '18px', color: '#6C757D', marginRight: '8px' }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: '#2C3E50',
                }}>
                  原始音频
                </h3>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '4px' }}>说话人</div>
                <div style={{ fontSize: '15px', color: '#2C3E50' }}>MCY</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '4px' }}>文本内容</div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#2C3E50',
                  lineHeight: '1.6',
                  padding: '12px',
                  background: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid #E9ECEF',
                }}>
                  "欢迎来到周周黑客松，来开始你的表演吧"
                </div>
              </div>
              
              <audio 
                controls 
                style={{ width: '100%', height: '40px' }}
                preload="metadata"
              >
                <source src="/mcy.wav" type="audio/wav" />
              </audio>
            </div>
          </Col>

          {/* Cloned Audio */}
          <Col xs={24} lg={12}>
            <div style={{ 
              padding: '32px',
              background: '#F8F9FA',
              borderRadius: '8px',
              height: '100%',
            }}>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                marginBottom: '24px',
              }}>
                <SoundOutlined style={{ fontSize: '18px', color: '#3498DB', marginRight: '8px' }} />
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '16px', 
                  fontWeight: 600,
                  color: '#2C3E50',
                }}>
                  克隆后音频
                </h3>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '4px' }}>克隆模型</div>
                <div style={{ fontSize: '15px', color: '#2C3E50' }}>step-tts-2</div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '4px' }}>文本内容</div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#2C3E50',
                  lineHeight: '1.6',
                  padding: '12px',
                  background: '#FFFFFF',
                  borderRadius: '6px',
                  border: '1px solid #E9ECEF',
                }}>
                  "一个让克隆声音真正活起来的智能人格语音生态：带情绪、长期记忆、互动体验与场景化价值。"
                </div>
              </div>
              
              <audio 
                controls 
                style={{ width: '100%', height: '40px' }}
                preload="metadata"
              >
                <source src="/mcy-clone.wav" type="audio/wav" />
              </audio>
            </div>
          </Col>
        </Row>
      </Card>

      {/* TTS Generation */}
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
          margin: '0 0 32px 0', 
          fontSize: '20px', 
          fontWeight: 600,
          color: '#2C3E50',
          letterSpacing: '-0.3px',
        }}>
          生成语音
        </h2>

        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#2C3E50' }}>
              选择语音角色
            </div>
            <Select
              value={selectedVoiceId}
              onChange={setSelectedVoiceId}
              style={{ width: '100%' }}
              size="large"
              placeholder="请选择语音角色"
              showSearch
              filterOption={(input, option) =>
                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {voices.map((voice) => (
                <Option key={voice.id} value={voice.id}>
                  {voice.id.slice(0, 8)}... ({voice.model})
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#2C3E50' }}>
              模型选择
            </div>
            <Select 
              value={model} 
              onChange={setModel} 
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="step-tts-2">step-tts-2</Option>
              <Option value="step-tts-mini">step-tts-mini</Option>
              <Option value="step-tts-vivid">step-tts-vivid</Option>
              <Option value="step-audio-2">step-audio-2</Option>
            </Select>
          </div>

          <div>
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: '#2C3E50' }}>
              输入文本
            </div>
            <TextArea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="请输入要转换为语音的文本"
              rows={6}
              style={{ fontSize: '15px' }}
            />
          </div>

          <Button
            type="primary"
            size="large"
            icon={<SoundOutlined />}
            onClick={handleGenerate}
            loading={generating}
            block
            style={{ 
              height: '48px',
              fontSize: '15px',
              fontWeight: 500,
              borderRadius: '8px',
            }}
          >
            生成音频
          </Button>

          {(audioUrl || audioBase64) && (
            <div style={{ 
              padding: '24px',
              background: '#F8F9FA',
              borderRadius: '8px',
              marginTop: '8px',
            }}>
              <div style={{ marginBottom: '16px', fontSize: '14px', fontWeight: 500, color: '#2C3E50' }}>
                生成结果
              </div>
              <audio
                controls
                style={{ width: '100%', marginBottom: '16px', height: '40px' }}
                src={audioUrl || `data:audio/mp3;base64,${audioBase64}`}
              />
              <Button 
                icon={<DownloadOutlined />} 
                onClick={handleDownload}
                style={{ borderRadius: '6px' }}
              >
                下载音频
              </Button>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default TTSGeneration;



