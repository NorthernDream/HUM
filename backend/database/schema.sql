-- 创建数据库（如果不存在）
-- CREATE DATABASE voice_platform;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文件表
CREATE TABLE IF NOT EXISTS files (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    duration DECIMAL(10, 2) NOT NULL,
    format VARCHAR(10) NOT NULL,
    step_file_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Embedding表
CREATE TABLE IF NOT EXISTS embeddings (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL UNIQUE,
    vector JSONB NOT NULL,
    vector_hash VARCHAR(64) NOT NULL UNIQUE,
    dimension INTEGER NOT NULL,
    model_version VARCHAR(50) DEFAULT 'random-v1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);

-- 角色表
CREATE TABLE IF NOT EXISTS voices (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    step_voice_id VARCHAR(255) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    model VARCHAR(50) NOT NULL,
    text TEXT,
    sample_text TEXT,
    sample_audio_path TEXT,
    embedding_hash VARCHAR(64) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    UNIQUE(file_id, model) -- 确保同一文件+模型只创建一个voice
);

-- TTS请求记录表
CREATE TABLE IF NOT EXISTS tts_requests (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    voice_id VARCHAR(36) NOT NULL,
    input_text TEXT NOT NULL,
    model VARCHAR(50) NOT NULL,
    audio_path TEXT NOT NULL,
    duration DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (voice_id) REFERENCES voices(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_created_at ON files(created_at);
CREATE INDEX IF NOT EXISTS idx_embeddings_file_id ON embeddings(file_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_vector_hash ON embeddings(vector_hash);
CREATE INDEX IF NOT EXISTS idx_voices_user_id ON voices(user_id);
CREATE INDEX IF NOT EXISTS idx_voices_file_id ON voices(file_id);
CREATE INDEX IF NOT EXISTS idx_voices_created_at ON voices(created_at);
CREATE INDEX IF NOT EXISTS idx_tts_requests_user_id ON tts_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tts_requests_voice_id ON tts_requests(voice_id);
CREATE INDEX IF NOT EXISTS idx_tts_requests_created_at ON tts_requests(created_at);



