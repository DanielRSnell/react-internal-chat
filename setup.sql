-- Chat Application Database Schema
-- This schema supports a chat interface where messages are sent to N8N webhook
-- and responses are stored in Supabase with real-time updates

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_html TEXT, -- For storing rendered HTML content
  role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  metadata JSONB DEFAULT '{}'::jsonb -- For storing additional message metadata
);

-- Create index on created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);

-- Create index on session_id for filtering messages by session
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

-- Create index on sessions updated_at for sorting
CREATE INDEX IF NOT EXISTS idx_sessions_updated_at ON sessions(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can restrict this based on your auth setup)
CREATE POLICY "Enable all operations for all users on sessions" ON sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for all users on messages" ON messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- Function to insert messages (useful for N8N webhook integration)
CREATE OR REPLACE FUNCTION insert_message(
  p_session_id UUID,
  p_content TEXT,
  p_content_html TEXT DEFAULT NULL,
  p_role TEXT DEFAULT 'agent',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
BEGIN
  -- Insert the message
  INSERT INTO messages (session_id, content, content_html, role, metadata)
  VALUES (p_session_id, p_content, p_content_html, p_role, p_metadata)
  RETURNING id INTO v_message_id;

  -- Update session's updated_at timestamp
  UPDATE sessions SET updated_at = TIMEZONE('utc', NOW()) WHERE id = p_session_id;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new session
CREATE OR REPLACE FUNCTION create_session(
  p_title TEXT DEFAULT 'New Chat'
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO sessions (title)
  VALUES (p_title)
  RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;
