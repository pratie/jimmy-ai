# 🔧 Fix Vector Search Error

## Problem
```
ERROR: function match_knowledge_chunks(vector, double precision, integer, text) does not exist
HINT: No function matches the given name and argument types. You might need to add explicit type casts.
```

## Root Cause
The PostgreSQL function `match_knowledge_chunks` is missing from your database. This function is required for RAG (Retrieval Augmented Generation) vector similarity search.

## Solution

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project
   - Click "SQL Editor" in the left sidebar

2. **Run the Fix SQL**
   - Click "New Query"
   - Copy the contents of `fix_vector_search.sql`
   - Paste into the SQL editor
   - Click "Run" or press Cmd/Ctrl + Enter

3. **Verify Success**
   - You should see output:
     ```
     routine_name           | routine_type
     ----------------------|-------------
     match_knowledge_chunks | FUNCTION
     ```

### Option 2: Using psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the fix script
\i fix_vector_search.sql

# Exit
\q
```

### Option 3: Using a Database Client (DBeaver, pgAdmin, etc.)

1. Connect to your Supabase PostgreSQL database
2. Open a new SQL query window
3. Copy and paste the contents of `fix_vector_search.sql`
4. Execute the query

## What This Does

The fix script:
1. ✅ Enables the `pgvector` extension (if not already enabled)
2. ✅ Creates the `match_knowledge_chunks` function with correct signature
3. ✅ Verifies the function was created successfully

## After Running the Fix

1. **Test the chatbot**
   - Go to your chatbot widget
   - Ask a question related to your knowledge base
   - The RAG vector search should now work

2. **Check the logs**
   - You should see successful search results:
     ```
     [RAG] ✅ Found X relevant chunks
     [RAG]   1. Similarity: 85.3% - "..."
     ```

3. **No more errors**
   - The error `function match_knowledge_chunks does not exist` should be gone

## Troubleshooting

### If pgvector extension fails
```sql
-- Enable the extension manually
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
```

### If the function still doesn't work
Check if the KnowledgeChunk table exists:
```sql
SELECT * FROM information_schema.tables
WHERE table_name = 'KnowledgeChunk';
```

If it doesn't exist, you may need to:
1. Run Prisma migrations: `npx prisma migrate deploy`
2. Or run the full setup: `supabase-vector-setup.sql`

### If you need to recreate everything
Run the complete setup from `supabase-vector-setup.sql` which includes:
- pgvector extension
- KnowledgeChunk table
- Vector index
- match_knowledge_chunks function

## Why This Happened

The function was likely:
- Never created initially
- Dropped during a database reset
- Lost during a migration
- Or the database connection is pointing to a different environment

## Prevention

To prevent this in the future:
1. Include vector setup in your deployment pipeline
2. Add the function creation to Prisma migrations
3. Document database setup steps in your README
4. Test RAG functionality after deployments

## Need Help?

If the fix doesn't work:
1. Check your Supabase project is active
2. Verify database connection string in `.env`
3. Check Supabase logs for permission errors
4. Ensure pgvector extension is available in your plan
