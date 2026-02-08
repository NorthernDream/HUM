# 情感人格化语音平台

这是一个情感人格化的语音平台：任何人都可以上传并塑造自己的声音与人格，让它成为一个可被他人调用、陪伴与对话的 AI 语音角色。

## 功能特性

- 🎤 **音频上传与录音**: 支持上传MP3/WAV文件或实时录音（5-10秒）
- 🎭 **音色复刻**: 基于StepFun API进行音色复刻
- 🎵 **TTS生成**: 使用复刻的音色生成语音
- 🔢 **Embedding生成**: 临时使用随机向量作为embedding占位（后续可替换为真实codec模型）
- � **Web3 NFT**: 支持将Voice ID和Embedding Hash铸造为NFT上传至0G测试网

## 技术栈

### 前端
- React + TypeScript + Vite
- Ant Design
- ethers.js (Web3)

### 后端
- Node.js + Express + TypeScript
- StepFun API (音色复刻)
- Hardhat (智能合约)

### 部署
- Docker Compose
