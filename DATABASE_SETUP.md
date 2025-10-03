# 🗄️ Database Setup Guide

This guide provides instructions for setting up the required database tables in Supabase for the User History Dashboard feature.

## Prerequisites

- An active Supabase project
- Access to the Supabase SQL Editor

## Setup Instructions

### Step 1: Access SQL Editor

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **SQL Editor** from the left sidebar
4. Click **New Query**

### Step 2: Create User History Table

Copy and paste the following SQL code into the SQL Editor and click **Run**:

```sql
-- ========================================
-- 📚 USER HISTORY TABLE
-- ========================================
-- This table stores user's analyzed sentences and generated scenarios

CREATE TABLE user_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('analysis', 'scenario')),
    sentence TEXT,
    scenario_title TEXT,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_user_history_user_id ON user_history(user_id);
CREATE INDEX idx_user_history_type ON user_history(type);
CREATE INDEX idx_user_history_created_at ON user_history(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Users can only view their own history
CREATE POLICY "Users can view their own history"
    ON user_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own history
CREATE POLICY "Users can insert their own history"
    ON user_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own history
CREATE POLICY "Users can delete their own history"
    ON user_history
    FOR DELETE
    USING (auth.uid() = user_id);
```

### Step 3: Verify Setup

After running the SQL, verify the table was created successfully:

1. Navigate to **Table Editor** in the Supabase dashboard
2. You should see a new table called `user_history`
3. Click on the table to view its structure

## Table Schema

### `user_history` Table

| Column           | Type      | Description                                           |
|------------------|-----------|-------------------------------------------------------|
| `id`             | UUID      | Primary key (auto-generated)                          |
| `user_id`        | UUID      | Foreign key to auth.users (user who owns this record) |
| `type`           | TEXT      | Type of history: 'analysis' or 'scenario'             |
| `sentence`       | TEXT      | The German sentence (for analysis type)               |
| `scenario_title` | TEXT      | The scenario title (for scenario type)                |
| `content`        | JSONB     | The full analysis or scenario data                    |
| `created_at`     | TIMESTAMP | When the record was created                           |

### Security

- **Row Level Security (RLS)** is enabled to ensure users can only access their own history
- Three policies are in place:
  - `SELECT`: Users can view only their own records
  - `INSERT`: Users can create only their own records
  - `DELETE`: Users can delete only their own records

## Example Data Structure

### Analysis Type Record

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "type": "analysis",
  "sentence": "Ich gehe zum Supermarkt",
  "scenario_title": null,
  "content": {
    "translation_layers": { ... },
    "vocab_breakdown": [ ... ],
    "structure_analysis": { ... },
    "deeper_analysis": { ... },
    "linguistics_nuggets": { ... },
    "plug_and_play": [ ... ]
  },
  "created_at": "2025-10-03T10:30:00Z"
}
```

### Scenario Type Record

```json
{
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "type": "scenario",
  "sentence": null,
  "scenario_title": "At the Supermarket",
  "content": {
    "title": "At the Supermarket",
    "dialogue": [
      {
        "speaker": "Customer",
        "line_german": "Guten Tag!",
        "line_english": "Good day!"
      },
      ...
    ]
  },
  "created_at": "2025-10-03T11:45:00Z"
}
```

## Troubleshooting

### Issue: Permission Denied Error

**Solution**: Make sure Row Level Security policies are properly configured. Re-run the RLS policy creation SQL above.

### Issue: Table Already Exists

**Solution**: If you need to recreate the table, first drop it:
```sql
DROP TABLE IF EXISTS user_history CASCADE;
```
Then re-run the table creation SQL.

### Issue: Foreign Key Constraint Error

**Solution**: Ensure your Supabase authentication is properly configured and users exist in the `auth.users` table.

## Migration Notes

If you're migrating from an existing system, ensure:
- All UUIDs are properly formatted
- User IDs match those in the `auth.users` table
- JSONB content is valid JSON
- The `type` field only contains 'analysis' or 'scenario'

---

**Need Help?** Refer to the [Supabase Documentation](https://supabase.com/docs) for more information on database management.

