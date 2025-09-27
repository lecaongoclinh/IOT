-- ============================================
-- Tạo cơ sở dữ liệu và sử dụng
-- ============================================
CREATE DATABASE IF NOT EXISTS iot_system;
USE iot_system;

-- ============================================
-- Bảng devices
-- ============================================
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'off'
);

-- Index theo type
CREATE INDEX idx_devices_type ON devices(type);

-- ============================================
-- Bảng sensor_data
-- ============================================
CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    light INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index cho sensor_data
CREATE INDEX idx_sensor_data_time ON sensor_data(created_at);
CREATE INDEX idx_sensor_data_temperature ON sensor_data(temperature);
CREATE INDEX idx_sensor_data_time_humidity ON sensor_data(created_at, humidity);

-- ============================================
-- Bảng action_history
-- ============================================
CREATE TABLE IF NOT EXISTS action_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    action VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Index cho action_history
CREATE INDEX idx_action_history_device ON action_history(device_id);
CREATE INDEX idx_action_history_time ON action_history(created_at);
CREATE INDEX idx_action_history_device_time ON action_history(device_id, created_at);
