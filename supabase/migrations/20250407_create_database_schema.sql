CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  platform TEXT NOT NULL, -- 'youtube', 'tiktok', or 'both'
  topic TEXT NOT NULL,
  content_prompt TEXT NOT NULL,
  style_settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  duration INTEGER, -- estimated duration in seconds
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'rejected'
  ai_model TEXT, -- which AI model generated this
  generation_prompt TEXT, -- the prompt used to generate
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  script_id UUID REFERENCES scripts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  duration INTEGER, -- in seconds
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'ready', 'published', 'failed'
  platform TEXT NOT NULL, -- 'youtube', 'tiktok', or 'both'
  platform_video_id TEXT, -- ID on the platform after publishing
  voice_id TEXT, -- ElevenLabs voice ID
  media_assets JSONB DEFAULT '[]', -- array of media assets used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  platforms JSONB DEFAULT '[]', -- array of platforms to publish to
  status TEXT DEFAULT 'scheduled', -- 'scheduled', 'published', 'failed'
  recurrence TEXT, -- 'once', 'daily', 'weekly', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'youtube', 'tiktok'
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  watch_time INTEGER DEFAULT 0, -- in seconds
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own data
CREATE POLICY "Users can only access their own user data" 
  ON users 
  FOR ALL 
  USING (auth.uid() = id);

CREATE POLICY "Users can only access their own subscriptions" 
  ON subscriptions 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own series" 
  ON series 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Scripts are accessed through series
CREATE POLICY "Users can only access scripts for their series" 
  ON scripts 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM series 
    WHERE series.id = scripts.series_id 
    AND series.user_id = auth.uid()
  ));

-- Videos are accessed through series
CREATE POLICY "Users can only access videos for their series" 
  ON videos 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM series 
    WHERE series.id = videos.series_id 
    AND series.user_id = auth.uid()
  ));

CREATE POLICY "Users can only access their own schedules" 
  ON schedules 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Analytics are accessed through videos
CREATE POLICY "Users can only access analytics for their videos" 
  ON analytics 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM videos
    JOIN series ON videos.series_id = series.id
    WHERE videos.id = analytics.video_id 
    AND series.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX series_user_id_idx ON series(user_id);
CREATE INDEX scripts_series_id_idx ON scripts(series_id);
CREATE INDEX videos_series_id_idx ON videos(series_id);
CREATE INDEX videos_script_id_idx ON videos(script_id);
CREATE INDEX schedules_user_id_idx ON schedules(user_id);
CREATE INDEX schedules_series_id_idx ON schedules(series_id);
CREATE INDEX schedules_video_id_idx ON schedules(video_id);
CREATE INDEX analytics_video_id_idx ON analytics(video_id);
