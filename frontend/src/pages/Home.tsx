import { useEffect, useState } from 'react';
import { Card, Input, Row, Col, Button, Spin, Empty } from 'antd';
import { SearchOutlined, SoundOutlined } from '@ant-design/icons';
import { listVoices, type Voice } from '../api/voices';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const Home = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const loadVoices = async () => {
    setLoading(true);
    try {
      const response = await listVoices({ search: searchText || undefined });
      if (response && response.success) {
        setVoices(response.data.voices || []);
      } else {
        setVoices([]);
      }
    } catch (error: any) {
      console.error('加载角色列表失败:', error);
      setVoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVoices();
  }, []);

  const handleSearch = (value: string) => {
    setSearchText(value);
    loadVoices();
  };

  return (
    <div>
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ 
          margin: '0 0 16px 0', 
          fontSize: '32px', 
          fontWeight: 600,
          color: '#2C3E50',
          letterSpacing: '-0.5px',
        }}>
          本周之声
        </h1>
        <p style={{ 
          margin: 0, 
          fontSize: '16px', 
          color: '#6C757D',
          lineHeight: '1.6',
        }}>
          探索和管理您的语音角色
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Search
          placeholder="搜索角色"
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          style={{ maxWidth: '600px' }}
        />
      </div>

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 0',
        }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px', color: '#6C757D', fontSize: '15px' }}>
            加载中...
          </div>
        </div>
      ) : voices.length === 0 ? (
        <Empty 
          description={
            <span style={{ color: '#6C757D', fontSize: '15px' }}>
              暂无角色，点击导航栏"创建角色"开始创建
            </span>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: '80px 0' }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {voices.map((voice) => (
            <Col xs={24} sm={12} md={8} lg={6} key={voice.id}>
              <Card
                hoverable
                bordered={false}
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(44, 62, 80, 0.08)',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: '24px' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(44, 62, 80, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(44, 62, 80, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ 
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <SoundOutlined style={{ fontSize: '24px', color: '#FFFFFF' }} />
                  </div>
                  
                  <h3 style={{ 
                    margin: '0 0 8px 0',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#2C3E50',
                  }}>
                    Voice {voice.id.slice(0, 8)}
                  </h3>
                  
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#6C757D',
                    marginBottom: '4px',
                  }}>
                    模型: {voice.model}
                  </div>
                  
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#ADB5BD',
                  }}>
                    {new Date(voice.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  onClick={() => navigate(`/voices/${voice.id}`)}
                  style={{ 
                    height: '40px',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }}
                >
                  查看详情
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Home;
