import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('main.tsx loaded');

// 确保root元素存在
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found!');
  throw new Error('Root element not found');
}

console.log('Root element found, rendering App...');

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering App:', error);
  rootElement.innerHTML = `
    <div style="padding: 50px; text-align: center; color: red;">
      <h1>渲染错误</h1>
      <p>${error}</p>
      <button onclick="window.location.reload()">刷新页面</button>
    </div>
  `;
}
