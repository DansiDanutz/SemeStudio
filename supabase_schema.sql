-- ============================================================
-- Supabase Database Schema for Upload Automation Pipeline
-- Run this SQL in your Supabase SQL editor to create all tables.
-- ============================================================

-- 1. YouTube upload queue (triggered by n8n on insert)
CREATE TABLE IF NOT EXISTS yt_upload_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_path TEXT NOT NULL,
    thumbnail_path TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    -- queued | scheduled | uploading | processing | published | failed | crossposting | completed
    youtube_video_id TEXT,
    youtube_url TEXT,
    scheduled_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    -- Stores SEO fields: title, description, tags, category_id, privacy_status
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for polling pending/scheduled items
CREATE INDEX IF NOT EXISTS idx_upload_queue_status ON yt_upload_queue(status);
CREATE INDEX IF NOT EXISTS idx_upload_queue_scheduled ON yt_upload_queue(scheduled_at) WHERE status = 'scheduled';

-- 2. Upload status tracking (per platform)
CREATE TABLE IF NOT EXISTS upload_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_id UUID REFERENCES yt_upload_queue(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    -- youtube | tiktok | linkedin | twitter | instagram
    status TEXT NOT NULL DEFAULT 'pending',
    -- pending | uploading | published | failed | skipped
    url TEXT,
    external_id TEXT,
    -- Platform-specific post/video ID
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_upload_status_queue ON upload_status(queue_id);
CREATE INDEX IF NOT EXISTS idx_upload_status_platform ON upload_status(platform);

-- 3. Performance metrics
CREATE TABLE IF NOT EXISTS performance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_id UUID REFERENCES yt_upload_queue(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_id TEXT NOT NULL,
    metrics JSONB DEFAULT '{}',
    -- views, likes, comments, shares, watch_time, ctr, etc.
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_performance_queue ON performance(queue_id);

-- 4. Channel analytics (for best-time prediction)
CREATE TABLE IF NOT EXISTS channel_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    youtube_video_id TEXT NOT NULL,
    publish_time TIMESTAMPTZ NOT NULL,
    views_24h INTEGER DEFAULT 0,
    views_7d INTEGER DEFAULT 0,
    views_30d INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    watch_time_hours FLOAT DEFAULT 0,
    subscriber_gain INTEGER DEFAULT 0,
    engagement_rate FLOAT DEFAULT 0,
    -- computed: (likes + comments) / views
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_publish_time ON channel_analytics(publish_time);

-- 5. Cross-post queue (tracks cross-platform posts)
CREATE TABLE IF NOT EXISTS crosspost_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_id UUID REFERENCES yt_upload_queue(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    -- tiktok | linkedin | twitter | instagram
    content TEXT,
    media_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    -- pending | posting | posted | failed | skipped
    external_id TEXT,
    url TEXT,
    error TEXT,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crosspost_queue_status ON crosspost_queue(status);
CREATE INDEX IF NOT EXISTS idx_crosspost_queue_platform ON crosspost_queue(platform);

-- ============================================================
-- RLS Policies (enable Row Level Security)
-- ============================================================

-- yt_upload_queue
ALTER TABLE yt_upload_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access" ON yt_upload_queue FOR ALL USING (true);

-- upload_status
ALTER TABLE upload_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access" ON upload_status FOR ALL USING (true);

-- performance
ALTER TABLE performance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access" ON performance FOR ALL USING (true);

-- channel_analytics
ALTER TABLE channel_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access" ON channel_analytics FOR ALL USING (true);

-- crosspost_queue
ALTER TABLE crosspost_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow service role full access" ON crosspost_queue FOR ALL USING (true);

-- ============================================================
-- Realtime: enable subscriptions for n8n webhook triggers
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE yt_upload_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE crosspost_queue;
