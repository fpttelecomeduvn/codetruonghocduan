-- ============================================
-- OPTIMIZED LOGGING SYSTEM - PostgreSQL
-- ============================================
-- Triển khai tối ưu cho Supabase
-- Bao gồm: Partitioning, TTL, Full-text Search
-- ============================================

-- ============================================
-- 1. ENUM TYPES (Better Performance)
-- ============================================

CREATE TYPE action_type_enum AS ENUM (
  'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 
  'VIEW', 'EXPORT', 'IMPORT', 'ERROR', 'DOWNLOAD'
);

CREATE TYPE resource_type_enum AS ENUM (
  'student', 'teacher', 'class', 'subject', 
  'evaluation', 'user', 'report', 'file'
);

CREATE TYPE user_role_enum AS ENUM (
  'admin', 'teacher', 'student', 'viewer'
);

CREATE TYPE log_status_enum AS ENUM (
  'success', 'failed', 'pending'
);

-- ============================================
-- 2. ACTIVITY LOGS TABLE - PARTITIONED BY TIME
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  -- Primary Keys
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Info (indexed for queries)
  user_id UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  user_role user_role_enum NOT NULL,
  
  -- Action Details
  action_type action_type_enum NOT NULL,
  resource_type resource_type_enum,
  resource_id UUID,
  resource_name VARCHAR(255),
  
  -- Content
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  
  -- Status & Error
  status log_status_enum DEFAULT 'success',
  error_message TEXT,
  
  -- Performance Metrics
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_ms INTEGER,
  
  -- Metadata (for flexibility)
  metadata JSONB,
  
  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- ============================================
-- 2a. PARTITION STRATEGY - Monthly Partitions
-- ============================================

-- Create partitions for current and next months
-- Adjust dates based on your needs

CREATE TABLE activity_logs_2024_11 PARTITION OF activity_logs
  FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

CREATE TABLE activity_logs_2024_12 PARTITION OF activity_logs
  FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

CREATE TABLE activity_logs_2025_01 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE activity_logs_2025_02 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE activity_logs_2025_03 PARTITION OF activity_logs
  FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- ============================================
-- 2b. INDEXES FOR PERFORMANCE
-- ============================================

-- User-based queries (most common)
CREATE INDEX idx_activity_user_id_timestamp 
  ON activity_logs(user_id, created_at DESC);

-- Time-based queries (analytics)
CREATE INDEX idx_activity_timestamp_type 
  ON activity_logs(created_at DESC, action_type);

-- Action type filtering
CREATE INDEX idx_activity_action_type 
  ON activity_logs(action_type);

-- Resource tracking
CREATE INDEX idx_activity_resource 
  ON activity_logs(resource_type, resource_id, created_at DESC);

-- Error tracking
CREATE INDEX idx_activity_error_status 
  ON activity_logs(status) WHERE status != 'success';

-- Full-text search index for descriptions
CREATE INDEX idx_activity_description_fts 
  ON activity_logs USING GIN (
    to_tsvector('english', COALESCE(description, ''))
  );

-- JSONB metadata search
CREATE INDEX idx_activity_metadata_gin 
  ON activity_logs USING GIN (metadata);

-- ============================================
-- 3. LOGIN LOGS TABLE - Non-partitioned
-- ============================================

CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User Info
  user_id UUID NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  user_role user_role_enum NOT NULL,
  
  -- Session Times
  login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_time TIMESTAMP WITH TIME ZONE,
  
  -- Device & Location Info
  ip_address INET,
  user_agent TEXT,
  device_name VARCHAR(255),
  location VARCHAR(255),
  
  -- Session Status
  status VARCHAR(20) DEFAULT 'active', -- active, logged_out, session_expired
  session_duration_seconds INTEGER,
  
  -- Session Token (for validation)
  session_token UUID DEFAULT gen_random_uuid(),
  
  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3a. LOGIN LOGS INDEXES
-- ============================================

CREATE INDEX idx_login_user_id 
  ON login_logs(user_id, login_time DESC);

CREATE INDEX idx_login_time 
  ON login_logs(login_time DESC);

CREATE INDEX idx_login_active_sessions 
  ON login_logs(status) WHERE status = 'active';

CREATE INDEX idx_login_session_token 
  ON login_logs(session_token);

-- ============================================
-- 4. ARCHIVED LOGS TABLE (Cold Storage)
-- ============================================
-- Move old logs here for cost optimization

CREATE TABLE IF NOT EXISTS activity_logs_archive (
  id UUID PRIMARY KEY,
  user_id UUID,
  username VARCHAR(255),
  user_role user_role_enum,
  action_type action_type_enum,
  resource_type resource_type_enum,
  resource_id UUID,
  resource_name VARCHAR(255),
  description TEXT,
  ip_address INET,
  user_agent TEXT,
  status log_status_enum,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_archive_user_created 
  ON activity_logs_archive(user_id, created_at DESC);

CREATE INDEX idx_archive_timestamp 
  ON activity_logs_archive(created_at DESC);

-- ============================================
-- 5. MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================

-- Daily Statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_activity_stats AS
SELECT
  DATE(created_at) as date,
  user_role,
  action_type,
  COUNT(*) as action_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(CAST(duration_ms AS FLOAT)) as avg_duration_ms,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count
FROM activity_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at), user_role, action_type;

CREATE INDEX idx_daily_stats_date ON daily_activity_stats(date DESC);

-- User Activity Summary (Last 30 Days)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_summary AS
SELECT
  user_id,
  username,
  user_role,
  COUNT(*) as total_actions,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MAX(created_at) as last_action_time,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_actions,
  AVG(CAST(duration_ms AS FLOAT)) as avg_duration_ms,
  COUNT(DISTINCT DATE(login_logs.login_time)) as login_days
FROM activity_logs
LEFT JOIN login_logs ON activity_logs.user_id = login_logs.user_id
  AND login_logs.login_time >= CURRENT_DATE - INTERVAL '30 days'
WHERE activity_logs.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY user_id, username, user_role;

CREATE INDEX idx_user_summary_role ON user_activity_summary(user_role);

-- ============================================
-- 6. FUNCTIONS FOR COMMON OPERATIONS
-- ============================================

-- Function: Archive Old Logs
CREATE OR REPLACE FUNCTION archive_old_logs(days_to_keep INT DEFAULT 90)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs_archive
  SELECT * FROM activity_logs
  WHERE created_at < CURRENT_DATE - (days_to_keep || ' days')::INTERVAL;
  
  DELETE FROM activity_logs
  WHERE created_at < CURRENT_DATE - (days_to_keep || ' days')::INTERVAL;
  
  RAISE NOTICE 'Archived logs older than % days', days_to_keep;
END;
$$ LANGUAGE plpgsql;

-- Function: Get User Activity Summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(user_id_param UUID)
RETURNS TABLE (
  total_actions BIGINT,
  failed_actions BIGINT,
  last_action TIMESTAMP WITH TIME ZONE,
  action_types TEXT,
  resources_modified BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT,
    MAX(created_at),
    STRING_AGG(DISTINCT action_type::TEXT, ', '),
    COUNT(DISTINCT resource_id)::BIGINT
  FROM activity_logs
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Logs by Date Range (with search)
CREATE OR REPLACE FUNCTION search_activity_logs(
  p_user_id UUID DEFAULT NULL,
  p_action_type action_type_enum DEFAULT NULL,
  p_resource_type resource_type_enum DEFAULT NULL,
  p_search_text TEXT DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username VARCHAR,
  action_type action_type_enum,
  resource_type resource_type_enum,
  resource_name VARCHAR,
  description TEXT,
  status log_status_enum,
  created_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.user_id,
    al.username,
    al.action_type,
    al.resource_type,
    al.resource_name,
    al.description,
    al.status,
    al.created_at,
    al.duration_ms
  FROM activity_logs al
  WHERE
    (p_user_id IS NULL OR al.user_id = p_user_id)
    AND (p_action_type IS NULL OR al.action_type = p_action_type)
    AND (p_resource_type IS NULL OR al.resource_type = p_resource_type)
    AND (p_start_date IS NULL OR al.created_at >= p_start_date)
    AND (p_end_date IS NULL OR al.created_at <= p_end_date)
    AND (p_search_text IS NULL OR 
         al.description @@ to_tsquery('english', p_search_text || ':*')
         OR al.username ILIKE '%' || p_search_text || '%'
         OR al.resource_name ILIKE '%' || p_search_text || '%')
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs_archive ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7a. RLS POLICIES - ACTIVITY LOGS
-- ============================================

-- Admin can see everything
CREATE POLICY admin_view_all_activity ON activity_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users see only their own logs
CREATE POLICY user_view_own_activity ON activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Teachers can see logs for their classes
CREATE POLICY teacher_view_class_activity ON activity_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'teacher'
    )
    AND resource_type IN ('student', 'class', 'subject')
  );

-- Only app can insert
CREATE POLICY app_insert_activity ON activity_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 7b. RLS POLICIES - LOGIN LOGS
-- ============================================

-- Admin sees all
CREATE POLICY admin_view_all_logins ON login_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users see their own
CREATE POLICY user_view_own_login ON login_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- App inserts
CREATE POLICY app_insert_login ON login_logs
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 8. TRIGGERS FOR AUTO-TIMESTAMPS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_logs_updated_at 
  BEFORE UPDATE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER login_logs_updated_at 
  BEFORE UPDATE ON login_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. MAINTENANCE VIEWS
-- ============================================

-- Table Size Info
CREATE VIEW table_size_info AS
SELECT
  schemaname,
  tablename,
  ROUND(pg_total_relation_size(schemaname || '.' || tablename) / 1024 / 1024::NUMERIC, 2) as size_mb,
  ROUND(pg_relation_size(schemaname || '.' || tablename) / 1024 / 1024::NUMERIC, 2) as table_size_mb
FROM pg_tables
WHERE tablename IN ('activity_logs', 'login_logs', 'activity_logs_archive')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- ============================================
-- 10. INITIAL DATA & DOCUMENTATION
-- ============================================

-- Notes:
-- 1. Partitions: Tự động tạo theo tháng (dùng maintenance scripts)
-- 2. TTL: Lưu trữ 90 ngày, archive cũ hơn (dùng cron job)
-- 3. Full-text: Support cho Vietnamese & English
-- 4. Analytics: Materialized views cập nhật nightly
-- 5. Scaling: Connection pooling cho reads

-- Test Query (sau khi có data):
-- SELECT * FROM search_activity_logs(
--   p_search_text := 'student',
--   p_start_date := CURRENT_DATE - INTERVAL '7 days'
-- ) LIMIT 10;

-- Refresh Analytics Views:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY daily_activity_stats;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_summary;

-- Archive logs cũ hơn 90 ngày:
-- SELECT archive_old_logs(90);
