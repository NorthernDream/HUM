// 最简单的测试版本
function SimpleApp() {
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: 'white', 
      color: 'black',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'red', fontSize: '32px' }}>测试页面</h1>
      <p style={{ fontSize: '18px' }}>如果你看到这个，说明React正常工作</p>
      <p style={{ fontSize: '16px', color: 'blue' }}>当前时间: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default SimpleApp;



