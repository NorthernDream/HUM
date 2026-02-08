# 情感人格化语音平台：前后端与算法部署计划

## 目标与范围
- 构建一个平台，使任何人可以上传并塑造自己的声音与人格，形成可被调用、陪伴与对话的 AI 语音角色
- 聚焦前端、后端与算法部署；Web3用于身份可信与价值结算，暂不展开合约细节但保留接口
- 第一阶段支持：音频上传（5–10秒，mp3/wav）、音色复刻（StepFun API）、快速试听生成、随机向量作为临时编码上链占位

## 总体架构
- 客户端：Web 应用（PC/移动）用于录音/上传、角色创建、试听与调用、用量与结算展示
- 服务层：API 网关、用户与角色服务、文件与音频服务、StepFun 集成服务、编码器服务（embedding）、用量与计费服务、通知服务
- 算法作业：音频预处理与校验、临时随机 embedding 生成、音色复刻与 TTS 生成作业、后续可替换为真实 codec/embedding 模型
- 存储与队列：对象存储（原始/样例音频）、数据库（PostgreSQL/MySQL）、缓存（Redis）、任务队列（BullMQ/RabbitMQ）
- Web3：上链登记角色 embedding 与元数据、结算转移；由后端提供上链接口与签名服务
- 可观测性：日志、指标与追踪；外部 API 成功率与延迟监控；错误与告警

## 前端计划
- 技术栈：React/Next.js + TypeScript（或同级替代），组件化实现录音/上传/播放与进度反馈
- 页面与功能
  - 主页/发现：角色列表与搜索、热门试听
  - 上传/复刻：文件选择或录音；文本输入；提交生成；显示进度与错误
  - 角色详情：展示 voice ID、试听音频、元数据（创作者、说明）
  - 调用与生成：输入文本、选择 voice，发起 TTS 生成并下载/播放
  - 账户与结算：用量、费用与创作者收入概要
- 交互与校验
  - 客户端校验文件格式（mp3/wav）与时长（5–10秒）；采样率与声道提示
  - 文本可选输入；建议传入以提升复刻效果
  - 生成流程进度（轮询或 WebSocket）；试听 base64 音频播放
- 错误与提示
  - 友好处理外部 API 错误（例如 invalid_api_key）、限流与重试失败
  - 对重复复刻返回 duplicated 的情况进行提示与复用

## 后端计划
- 技术栈：Node.js（NestJS/Express）或 Python（FastAPI）；统一以 REST/JSON 提供接口
- 服务划分
  - 文件服务：接收上传，存入对象存储；必要时代理上传至 StepFun 文件存储以获取 file_id（purpose=storage）
  - 声音角色服务：创建/查询/更新 voice persona；关联 embedding 与链上标识
  - 编码器服务：生成 embedding（初版为固定维度随机向量，支持可复现实例化种子）；预留真实模型接口
  - StepFun 集成服务：封装调用
    - 复刻音色：POST https://api.stepfun.com/v1/audio/voices（model、file_id、text、sample_text）
    - 生成音频：POST https://api.stepfun.com/v1/audio/speech（model、input、voice）
  - 用量与计费：记录调用次数/时长、费用与分成；生成账单与结算周期数据
  - Web3 服务：上链登记角色 embedding 哈希与元数据；签名与交易提交
- API 设计（示例）
  - POST /files            → 上传音频，返回 fileId（平台内）与可选 stepFileId
  - POST /voices           → 创建音色（内部调用 StepFun /v1/audio/voices），返回 voiceId、sample 音频
  - POST /tts              → 生成音频（内部调用 StepFun /v1/audio/speech），返回音频文件或下载链接
  - POST /embeddings       → 为上传音频生成/查询 embedding（初版随机），返回向量与哈希
  - GET  /voices/:id       → 查询角色详情与试听
  - GET  /usage            → 查询用量与费用
  - POST /settlements      → 发起结算（与链上交互）
- 鉴权与密钥管理
  - 后端安全持有 STEP_API_KEY，使用 Authorization: Bearer；不在日志/错误中回显密钥
  - 处理外部返回 invalid_api_key，快速告警与降级；可配置多租户或密钥轮换
- 幂等与错误
  - 请求幂等键；重复创建返回 duplicated 处理与复用
  - 重试策略与退避；熔断保护外部 API

## 算法部署计划
- 临时编码器（占位）
  - 输入：5–10秒音频（mp3/wav）
  - 预处理：采样率统一（如16k/22.05k）、时长裁剪、归一化
  - 输出：固定维度随机向量（如256/512），同时生成哈希用于上链索引；支持种子以便重现
- 真实模型接入（后续）
  - Speaker embedding（ECAPA-TDNN/Resemblyzer 等）或 codec（Encodec/Neural codec）
  - 容器化部署（Docker），GPU/CPU 配置；模型权重与版本管理
  - 推理服务化：gRPC/HTTP；与后端编排对接
- 作业编排
  - 流程：上传 → 预处理 → embedding → 上链登记 → 复刻音色（StepFun） → 生成试听 → 角色可用
  - 队列：任务优先级与重试；失败告警与人工介入

## StepFun 集成细则
- 端点与参数
  - 复刻音色：POST /v1/audio/voices，model（step-tts-2/step-tts-mini/step-tts-vivid/step-audio-2）、file_id、text（可选）、sample_text（可选 ≤50字）
  - 快速生成：POST /v1/audio/speech，model、input 文本、voice（如 cixingnansheng）
  - 请求头：Content-Type: application/json；Authorization: Bearer STEP_API_KEY
- 响应处理
  - voices：返回 id、object=audio.voice、duplicated、sample_text、sample_audio(base64 wav)
  - speech：返回生成音频流/文件；保存与回传下载链接
- 错误与回退
  - invalid_api_key：立即告警与禁止继续重试；提示配置问题
  - 限流与超时：退避重试与队列重排；熔断与降级

## 数据与存储
- 数据库表
  - users、files（原始/stepFileId）、voices（voiceId、creatorId、meta）、embeddings（vector、hash、fileId）、usage、settlements、contracts
- 对象存储
  - uploads/{userId}/{fileId}.wav，samples/{voiceId}/sample.wav
  - 访问控制与签名 URL；生命周期与归档策略
- 索引与审计
  - 幂等键、请求日志、错误栈；调用记录与成本分析

## 计费与结算
- 用量计量：按生成时长与调用次数；记录至 usage
- 创作者分成：依据其角色被调用真实用量分成；周期结算与对账
- 支付通道：法币与加密支付；风控与退款
- Web3：合约登记角色索引与收益分账；只在背后承担身份与结算

## DevOps 与部署
- 环境：dev/staging/prod；配置中心与密钥管理（环境变量/KMS）
- 构建发布：CI/CD；蓝绿或滚动发布；版本化与回滚
- 监控：APM、日志与指标；外部 API 成功率/延迟；错误告警（invalid_api_key、限流）
- 灰度与限流：网关限流、熔断与降级；保护外部依赖

## 测试计划
- 单元与集成：文件上传、StepFun 代理、embedding 生成、用量计费
- 端到端：用户上传 → 复刻 → 试听 → 角色调用
- 异常场景：invalid_api_key、外部超时与重复创建 duplicated
- 负载与稳定性：队列压力与外部限速；容量与成本评估

## 迭代里程碑
- M0 原型：上传与校验、随机 embedding、调用 /voices 创建与 /speech 试听
- M1 创作者控制台、用量计费与基础结算；最小上链登记
- M2 接入真实 embedding/codec 模型；实时语音与更丰富角色能力
- M3 完整结算闭环与生态开放（第三方调用市场）

## 风险与合规
- 版权与授权；隐私保护与撤回机制；地域与存储合规
- 滥用与安全：内容审核与封禁；签名与访问控制；密钥与凭证管理
