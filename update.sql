-- Update Script for Chat Application Database Schema
-- Adds type and final columns to messages table for future extensibility

-- Add type column to messages table
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'message' CHECK (type IN ('message', 'system', 'error', 'tool', 'function'));

-- Add final column to messages table
-- Used to indicate if a message is the final response or if the agent is still thinking
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS final BOOLEAN DEFAULT true;

-- Create index on type for filtering
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);

-- Create index on final for filtering non-final messages
CREATE INDEX IF NOT EXISTS idx_messages_final ON messages(final) WHERE final = false;

-- Add comments explaining the columns
COMMENT ON COLUMN messages.type IS 'Message type: message (default user/agent chat), system (system notifications), error (error messages), tool (tool usage), function (function calls)';
COMMENT ON COLUMN messages.final IS 'Indicates if this is the final message (true) or if agent is still thinking/processing (false). Used to show thinking animations in UI.';
