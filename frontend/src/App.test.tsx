// 临时测试文件 - 验证React是否正常工作
import { useState } from 'react';

function TestApp() {
  const [count, setCount] = useState(0);
  
  return (
    <div style={{ padding: '50px', backgroundColor: 'white', color: 'black' }}>
      <h1>测试页面</h1>
      <p>如果你看到这个，说明React正常工作</p>
      <button onClick={() => setCount(count + 1)}>
        点击次数: {count}
      </button>
    </div>
  );
}

export default TestApp;



