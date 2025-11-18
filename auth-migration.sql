-- Authentication Migration: Add user_id to sessions and messages tables
-- Run this migration in Supabase SQL Editor

-- 1. Add user_id column to sessions table
ALTER TABLE sessions
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Add user_id column to messages table
ALTER TABLE messages
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Create indexes for better query performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);

-- 4. Drop existing permissive RLS policies
DROP POLICY IF EXISTS "Enable all operations for all users on sessions" ON sessions;
DROP POLICY IF EXISTS "Enable all operations for all users on messages" ON messages;

-- 5. Create user-scoped RLS policies for sessions table
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create user-scoped RLS policies for messages table
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Ensure RLS is enabled on both tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Migration complete!
-- Next steps:
-- 1. Clear existing sessions/messages (or assign to a user)
-- 2. Invite users via Supabase Dashboard → Authentication → Users → Invite User
-- 3. Deploy frontend changes
