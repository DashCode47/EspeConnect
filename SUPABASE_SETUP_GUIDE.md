# Supabase MCP Setup Guide for ESPEConnect

## Step 1: MCP Server Configuration ✅

The `.mcp.json` file has been created in your project root with the Supabase MCP server configuration.

## Step 2: Restart VSCode

**IMPORTANT:** You need to restart VSCode for the MCP server configuration to take effect.

1. Close this VSCode window completely
2. Reopen the project in VSCode
3. Claude Code will automatically detect the Supabase MCP server

## Step 3: Authenticate with Supabase

When you first use the Supabase MCP tools, you'll be prompted to authenticate:

1. A browser window will open
2. Sign in to your Supabase account (or create one at https://supabase.com)
3. Grant the MCP client access to your Supabase organization
4. Return to VSCode - the authentication will be complete

## Step 4: Verify MCP Server Connection

After restarting VSCode, you can verify the Supabase MCP server is connected by:

1. Opening Claude Code chat
2. Typing `/mcp` to see all available MCP servers
3. You should see "supabase" listed as an available server

## Alternative: Manual Project Creation

If the MCP server doesn't work or you prefer to create the project manually:

### Option A: Create via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in the details:
   - **Name:** ESPEConnect
   - **Database Password:** (choose a strong password and save it securely)
   - **Region:** Choose the closest to your users
   - **Pricing Plan:** Start with Free tier

### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (you'll be prompted for details)
supabase projects create especonnect
```

## Next Steps After MCP Setup

Once the MCP server is connected and you're authenticated, we'll proceed with:

1. ✅ Creating the Supabase project
2. ⏳ Executing SQL scripts to create ENUMs
3. ⏳ Creating all database tables
4. ⏳ Setting up triggers
5. ⏳ Configuring RLS policies
6. ⏳ Creating Storage buckets
7. ⏳ Verifying table ownership (postgres)
8. ⏳ Generating TypeScript types

## Resources

- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- [ESPEConnect Migration Document](../ESPEConnect/docs/SUPABASE_MIGRATION.md)

## Security Notes

- The MCP server uses OAuth 2.1 with dynamic client registration (no manual tokens needed)
- For development, it's recommended to use `read_only` mode and `project_ref` scoping
- Never commit sensitive credentials to version control
- Consider using a separate development project before migrating production data

## Troubleshooting

### MCP Server Not Detected
- Ensure you've restarted VSCode completely
- Check that `.mcp.json` is in the project root directory
- Try running `/mcp` command in Claude Code to refresh server list

### Authentication Issues
- Clear browser cache and try authenticating again
- Ensure you're using a supported browser (Chrome, Firefox, Edge)
- Check that you have a valid Supabase account

### Need Help?
- Ask Claude Code: "Check MCP server status" or "/mcp"
- Supabase Support: https://supabase.com/support
- Supabase Discord: https://discord.supabase.com
