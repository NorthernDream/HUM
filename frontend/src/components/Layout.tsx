import { Layout as AntLayout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, PlusOutlined, SoundOutlined, UserOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

const { Header, Content, Footer } = AntLayout;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">发现</Link>,
    },
    {
      key: '/create',
      icon: <PlusOutlined />,
      label: <Link to="/create">创建角色</Link>,
    },
    {
      key: '/tts',
      icon: <SoundOutlined />,
      label: <Link to="/tts">TTS生成</Link>,
    },
    {
      key: '/my-voices',
      icon: <UserOutlined />,
      label: <Link to="/my-voices">我的角色</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      <Header 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#FFFFFF',
          borderBottom: '1px solid #E9ECEF',
          padding: '0 48px',
          height: '72px',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 1px 3px rgba(44, 62, 80, 0.04)',
        }}
      >
        <div style={{ 
          color: '#2C3E50', 
          fontSize: '20px', 
          fontWeight: 600,
          marginRight: '64px',
          letterSpacing: '-0.5px',
        }}>
          本周之声
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            flex: 1, 
            minWidth: 0, 
            border: 'none',
            background: 'transparent',
            fontSize: '15px',
          }}
        />
      </Header>
      
      <Content style={{ 
        padding: '48px 48px 64px', 
        background: '#F8F9FA',
        minHeight: 'calc(100vh - 144px)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {children}
        </div>
      </Content>
      
      <Footer style={{ 
        textAlign: 'center', 
        background: '#FFFFFF', 
        padding: '32px',
        borderTop: '1px solid #E9ECEF',
        color: '#6C757D',
        fontSize: '14px',
      }}>
        本周之声 ©2024
      </Footer>
    </AntLayout>
  );
};

export default Layout;
