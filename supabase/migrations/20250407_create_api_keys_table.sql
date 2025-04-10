CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keys JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS) policies
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see and modify their own API keys
CREATE POLICY "Users can only access their own API keys" 
  ON api_keys 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Create index on user_id for faster lookups
CREATE INDEX api_keys_user_id_idx ON api_keys(user_id);
