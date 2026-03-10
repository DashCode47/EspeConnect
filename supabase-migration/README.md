# ESPEConnect Supabase Migration Scripts

This directory contains all SQL scripts needed to migrate the ESPEConnect backend to Supabase (Phase 1).

## Migration Scripts

### Execution Order

| Script | Description | Purpose |
|--------|-------------|---------|
| `00_run_all_migrations.sql` | **Master script** | Runs all migrations in order (use this for automated execution) |
| `01_create_enums.sql` | Create ENUM types | Defines all custom enum types (UserRole, PostType, etc.) |
| `02_create_tables.sql` | Create all tables | Creates all 18 tables with proper relationships and indexes |
| `03_create_triggers.sql` | Create triggers | Auto-updates `updatedAt` columns on modifications |
| `04_enable_rls.sql` | Enable RLS | Enables Row Level Security on all tables |
| `05_create_rls_policies.sql` | Create RLS policies | Defines security policies for data access control |
| `06_create_storage_buckets.sql` | Create storage | Sets up file storage buckets and policies |
| `99_verify_migration.sql` | **Verification** | Validates that all migrations completed successfully |

## How to Execute

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each script **in order** (01 → 06)
4. Click **Run** for each script
5. Finally, run the verification script (`99_verify_migration.sql`)

### Option 2: Using Master Script (Recommended for advanced users)

1. Open Supabase SQL Editor
2. Copy and paste the entire contents of `00_run_all_migrations.sql`
3. Click **Run**
4. Run `99_verify_migration.sql` to verify

### Option 3: Using Supabase CLI

```bash
# Make sure you're in the migration directory
cd supabase-migration

# Run each script in order
supabase db execute < 01_create_enums.sql
supabase db execute < 02_create_tables.sql
supabase db execute < 03_create_triggers.sql
supabase db execute < 04_enable_rls.sql
supabase db execute < 05_create_rls_policies.sql
supabase db execute < 06_create_storage_buckets.sql

# Verify
supabase db execute < 99_verify_migration.sql
```

### Option 4: Using psql

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run all migrations
\i 00_run_all_migrations.sql

# Or run individually
\i 01_create_enums.sql
\i 02_create_tables.sql
# ... etc

# Verify
\i 99_verify_migration.sql
```

## What Gets Created

### Database Objects

- **6 ENUM Types:** UserRole, PostType, PromotionCategory, TripStatus, TripRequestStatus, EventCategory
- **18 Tables:** User, Connection, UserInteraction, Message, Post, PostReaction, Comment, Report, Notification, Banner, Establishment, Promotion, Career, Trip, TripRequest, TripRating, Event, EventAttendance
- **8 Triggers:** Auto-update `updatedAt` on User, Banner, Establishment, Promotion, Career, Trip, Event, Comment
- **Multiple Indexes:** For performance optimization on frequently queried columns
- **50+ RLS Policies:** Comprehensive security policies for all tables
- **6 Storage Buckets:** avatars, posts, events, banners, establishments, careers
- **24+ Storage Policies:** Security policies for file access control

### Storage Buckets

All buckets are configured as **public** (files are accessible via URL) with size limits and MIME type restrictions:

| Bucket | Max Size | Allowed Types | Purpose |
|--------|----------|---------------|---------|
| `avatars` | 5MB | Images | User profile pictures |
| `posts` | 5MB | Images | Post images (confessions, marketplace, lost & found) |
| `events` | 5MB | Images | Event images |
| `banners` | 5MB | Images | Promotional banners |
| `establishments` | 5MB | Images | Establishment and promotion images |
| `careers` | 10MB | PDF, Images | Career curriculum PDFs and images |

## Verification

After running the migrations, execute `99_verify_migration.sql` to check:

- ✓ All 6 ENUMs created
- ✓ All 18 tables created with postgres ownership
- ✓ All 8 triggers created
- ✓ RLS enabled on all tables
- ✓ All RLS policies created
- ✓ All 6 storage buckets created
- ✓ All storage policies created
- ✓ Foreign key relationships established

Expected verification output:
```
Component                          | Expected | Actual | Status
-----------------------------------+----------+--------+--------
ENUMs                              | 6        | 6      | ✓
Tables                             | 18       | 18     | ✓
Tables with postgres ownership     | 18       | 18     | ✓
Triggers                           | 8        | 8      | ✓
Tables with RLS enabled            | 18       | 18     | ✓
RLS Policies                       | 50       | 50+    | ✓
Storage Buckets                    | 6        | 6      | ✓
Storage Policies                   | 24       | 24+    | ✓
```

## Important Notes

### Table Ownership

All tables are explicitly set to `owner=postgres` as required. Verify with:

```sql
SELECT tablename, tableowner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

All should show `tableowner = postgres`.

### RLS Policies

Row Level Security (RLS) is **enabled** on all tables with comprehensive policies. This means:

- Users can only access their own data or data they're authorized to see
- Public data (banners, promotions, careers) is accessible to all authenticated users
- Some admin operations require service role key (not enforced by RLS, handle in backend)

### Storage Security

Storage buckets are configured with:
- **Public access** for reading (anyone with URL can view)
- **Authenticated access** for uploading/modifying
- **User-specific folders** for user-generated content (avatars, posts, events)
- **File size limits** to prevent abuse
- **MIME type restrictions** to allow only images/PDFs

## Next Steps After Migration

1. **Update Frontend Configuration**
   - Install Supabase client: `npm install @supabase/supabase-js`
   - Update `.env` with Supabase URL and anon key
   - Replace Prisma/API calls with Supabase client

2. **Generate TypeScript Types**
   ```bash
   npx supabase gen types typescript --project-id [YOUR-PROJECT-ID] > src/types/database.types.ts
   ```

3. **Test Authentication**
   - Replace JWT auth with Supabase Auth
   - Test sign up, sign in, sign out flows

4. **Test Storage**
   - Test file uploads to all buckets
   - Verify file access permissions

5. **Create Test Data** (optional)
   - Create sample users, posts, events, etc.
   - Test RLS policies with different user contexts

## Rollback

If you need to rollback the migration, run these commands in reverse order:

```sql
-- Drop storage policies
DROP POLICY IF EXISTS ... ON storage.objects;

-- Delete storage buckets
DELETE FROM storage.buckets WHERE id IN ('avatars', 'posts', 'events', 'banners', 'establishments', 'careers');

-- Drop RLS policies
DROP POLICY IF EXISTS ... ON "TableName";

-- Disable RLS
ALTER TABLE "TableName" DISABLE ROW LEVEL SECURITY;

-- Drop triggers
DROP TRIGGER IF EXISTS ... ON "TableName";

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables (in reverse dependency order)
DROP TABLE IF EXISTS "EventAttendance", "Event", "TripRating", "TripRequest", "Trip",
  "Career", "Promotion", "Establishment", "Banner", "Comment", "Report",
  "PostReaction", "Post", "Message", "UserInteraction", "Connection", "Notification", "User";

-- Drop ENUMs
DROP TYPE IF EXISTS "EventCategory", "TripRequestStatus", "TripStatus",
  "PromotionCategory", "PostType", "UserRole";
```

## Support

- **Supabase Documentation:** https://supabase.com/docs
- **Migration Guide:** See `../SUPABASE_MIGRATION.md` for complete migration plan
- **Setup Guide:** See `../SUPABASE_SETUP_GUIDE.md` for MCP configuration

## Troubleshooting

### "Permission denied" errors
- Ensure you're running scripts as `postgres` user or with sufficient privileges
- Check that you're connected to the correct database

### "Already exists" errors
- Some objects may already exist; safe to ignore if they're correct
- Run verification script to check if everything is properly configured

### RLS Policy conflicts
- If policies fail to create, check for existing policies with same name
- Drop conflicting policies and rerun

### Storage bucket creation fails
- Ensure storage extension is enabled: `CREATE EXTENSION IF NOT EXISTS storage;`
- Check that bucket names don't already exist

## File Structure

```
supabase-migration/
├── README.md                        # This file
├── 00_run_all_migrations.sql        # Master migration script
├── 01_create_enums.sql              # Create ENUM types
├── 02_create_tables.sql             # Create all tables
├── 03_create_triggers.sql           # Create triggers
├── 04_enable_rls.sql                # Enable RLS
├── 05_create_rls_policies.sql       # Create RLS policies
├── 06_create_storage_buckets.sql    # Create storage buckets
└── 99_verify_migration.sql          # Verification script
```

---

**Generated:** January 2026
**Version:** 1.0.0
**Target Platform:** Supabase (PostgreSQL 15+)
