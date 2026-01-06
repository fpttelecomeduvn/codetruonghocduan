-- ============================================
-- ACTIVITY LOGS TABLE - Lưu tất cả hành động
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  username VARCHAR(255),
  user_role VARCHAR(50), -- admin, teacher, viewer
  action_type VARCHAR(100) NOT NULL, -- LOGIN, CREATE, UPDATE, DELETE, VIEW
  resource_type VARCHAR(100), -- student, teacher, class, subject, evaluation
  resource_id UUID,
  resource_name VARCHAR(255),
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success', -- success, failed
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER, -- Thời gian thực hiện action (ms)
  metadata JSONB, -- Dữ liệu thêm: old_values, new_values, etc
  
  -- Constraints
  CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- LOGIN LOGS TABLE - Lưu lịch sử đăng nhập
-- ============================================
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  username VARCHAR(255),
  email VARCHAR(255),
  user_role VARCHAR(50),
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_name VARCHAR(255),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- active, logged_out, session_expired
  session_duration_seconds INTEGER,
  
  -- Constraints
  CREATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UPDATED_AT TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES - Tối ưu query
-- ============================================
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp DESC);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_user_id_timestamp ON activity_logs(user_id, timestamp DESC);

CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_login_time ON login_logs(login_time DESC);
CREATE INDEX idx_login_logs_username ON login_logs(username);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Chỉ Admin có thể xem tất cả logs
CREATE POLICY admin_view_all_logs ON activity_logs
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM users WHERE role = 'admin'
  ));

CREATE POLICY admin_view_all_login_logs ON login_logs
  FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM users WHERE role = 'admin'
  ));

-- Policy: User chỉ xem log của chính họ
CREATE POLICY user_view_own_logs ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_view_own_login_logs ON login_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Chỉ app có thể insert logs
CREATE POLICY app_insert_activity_logs ON activity_logs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY app_insert_login_logs ON login_logs
  FOR INSERT
  WITH CHECK (true);
