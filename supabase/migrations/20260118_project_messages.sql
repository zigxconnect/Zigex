-- MIGRATION: 20260118_project_messages.sql
-- DESCRIPTION: Adds a table for persistent project-related messages.

CREATE TABLE IF NOT EXISTS project_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) NOT NULL,
    -- We can use receiver_id for direct 1:1, but the project context is key
    recipient_id UUID REFERENCES auth.users(id) NOT NULL,
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    
    -- Optional metadata for richer messages
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_sender_recipient ON project_messages(sender_id, recipient_id);

-- Enable RLS
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages" ON project_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can insert messages if they are the sender
CREATE POLICY "Users can insert own messages" ON project_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Admins should be able to see all messages for auditing (optional, depends on company preference)
-- For now, let's keep it private to participants.

GRANT ALL ON project_messages TO authenticated;
