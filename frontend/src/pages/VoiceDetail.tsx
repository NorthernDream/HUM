import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Spin, message } from 'antd';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
import { getVoice, type Voice } from '../api/voices';
import VoiceNFTMint from '../components/VoiceNFTMint';

const VoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [voice, setVoice] = useState<Voice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVoice();
    }
  }, [id]);

  const loadVoice = async () => {
    setLoading(true);
    try {
      const response = await getVoice(id!);
      if (response.success) {
        setVoice(response.data);
      }
    } catch (error: any) {
      message.error(error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    message.info('下载功能待实现');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px', color: '#6C757D', fontSize: '15px' }}>
          加载中...
        </div>
      </div>
    );
  }

  if (!voice) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '16px', color: '#6C757D' }}>角色不存在</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ 
          marginBottom: '24px',
          borderRadius: '8px',
          height: '40px',
        }}
      >
        返回
      </Button>

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
        }}>
          角色详情
        </h2>

        <div style={{ marginBottom: 32 }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
          }}>
            <div>
              <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px', fontWeight: 500 }}>
                Voice ID
              </div>
              <div style={{ 
                padding: '12px',
                background: '#F8F9FA',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#2C3E50',
                wordBreak: 'break-all',
              }}>
                {voice.id}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px', fontWeight: 500 }}>
                Step Voice ID
              </div>
              <div style={{ 
                padding: '12px',
                background: '#F8F9FA',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#2C3E50',
                wordBreak: 'break-all',
              }}>
                {voice.stepVoiceId}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px', fontWeight: 500 }}>
                模型
              </div>
              <div style={{ fontSize: '15px', color: '#2C3E50' }}>
                {voice.model}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px', fontWeight: 500 }}>
                Embedding Hash
              </div>
              <div style={{ 
                padding: '12px',
                background: '#F8F9FA',
                borderRadius: '6px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#2C3E50',
                wordBreak: 'break-all',
              }}>
                {voice.embeddingHash}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px', fontWeight: 500 }}>
                创建时间
              </div>
              <div style={{ fontSize: '15px', color: '#2C3E50' }}>
                {new Date(voice.createdAt).toLocaleString('zh-CN')}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px', fontWeight: 500 }}>
                更新时间
              </div>
              <div style={{ fontSize: '15px', color: '#2C3E50' }}>
                {new Date(voice.updatedAt).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>

          {voice.text && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '13px', color: '#6C757D', marginBottom: '8px', fontWeight: 500 }}>
                音频文本
              </div>
              <div style={{ 
                padding: '16px',
                background: '#F8F9FA',
                borderRadius: '8px',
                fontSize: '15px',
                color: '#2C3E50',
                lineHeight: '1.6',
              }}>
                {voice.text}
              </div>
            </div>
          )}
        </div>

        {voice.sampleAudioPath && (
          <div style={{ 
            padding: '24px',
            background: '#F8F9FA',
            borderRadius: '8px',
          }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#2C3E50',
              marginBottom: '16px',
            }}>
              试听音频
            </div>
            <audio controls style={{ width: '100%', height: '40px', marginBottom: '16px' }}>
              <source src={voice.sampleAudioPath} type="audio/wav" />
            </audio>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              style={{ borderRadius: '6px' }}
            >
              下载音频
            </Button>
          </div>
        )}
      </Card>

      <VoiceNFTMint voiceId={voice.id} embeddingHash={voice.embeddingHash || ""} />
    </div>
  );
};

export default VoiceDetail;



