# Supabase Setup Guide for STMBudget

This guide will help you set up Supabase as the backend for your STMBudget application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project name: `stm-budget`
5. Choose a database password (save this securely)
6. Select a region closest to your users
7. Click "Create new project"

## Step 2: Set Up Database Schema

1. Go to your project dashboard
2. Click on "SQL Editor" in the sidebar
3. Create a new query
4. Copy and paste the entire contents of `supabase-schema.sql` file
5. Click "RUN" to execute the schema

This will create:
- All necessary tables for users, budgets, stock management, workflows
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for automatic timestamps

## Step 3: Configure Environment Variables

1. In your Supabase project dashboard, go to "Settings" → "API"
2. Copy your project URL and anon public key
3. Create a `.env` file in your project root (copy from `.env.example`)
4. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Set Up Authentication

### Option 1: Use Existing Demo Users (Recommended for Testing)

The schema includes demo users that match your existing login system:
- admin@example.com
- salesman@example.com  
- manager@example.com
- supply@example.com

To use these, you need to create them in Supabase Auth:

1. Go to "Authentication" → "Users" in your Supabase dashboard
2. Click "Add user"
3. For each demo user:
   - Email: (use the emails above)
   - Password: `password`
   - Email Confirm: true
   - Click "Create user"

### Option 2: Enable Email/Password Auth

1. Go to "Authentication" → "Settings"
2. Under "Auth Providers", ensure "Email" is enabled
3. Configure email templates if needed
4. Set up SMTP settings for email verification (optional)

## Step 5: Configure Row Level Security (RLS)

The schema automatically sets up RLS policies that:
- Users can only see their own data
- Managers and admins can see data from their teams
- Admins have access to all data

Key policies:
- Budget data: Users see their own, managers see all
- Stock requests: Users see their own, managers/supply chain see all
- Workflow items: Based on role and creation ownership

## Step 6: Test the Connection

1. Start your development server: `npm run dev`
2. Try logging in with a demo user
3. Check browser console for any connection errors
4. Verify data operations work (create, read, update, delete)

## Development vs Production

### Development Mode
If Supabase is not configured (missing env vars), the app falls back to:
- Local storage for authentication
- In-memory state for data
- Mock data for testing

### Production Mode
With Supabase configured:
- Real authentication with password hashing
- Persistent database storage
- Real-time subscriptions (can be added)
- Automatic backups and scaling

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **RLS Policies**: Review and test all Row Level Security policies
3. **API Keys**: Use anon key for frontend, service key only for backend
4. **User Roles**: Validate user roles on both frontend and database level

## Monitoring and Maintenance

1. **Database Size**: Monitor your database usage in Supabase dashboard
2. **API Requests**: Track API usage and rate limits
3. **Error Logs**: Check Supabase logs for database errors
4. **Backups**: Supabase automatically backs up your database

## Troubleshooting

### Connection Issues
- Check environment variables are set correctly
- Verify Supabase project is active
- Check browser network tab for API errors

### Authentication Issues
- Ensure users exist in Supabase Auth
- Check email/password are correct
- Verify user records exist in `users` table

### Permission Issues
- Review RLS policies in Supabase dashboard
- Check user roles are set correctly
- Verify table permissions

### Data Issues
- Check table relationships and foreign keys
- Verify data types match your TypeScript interfaces
- Use Supabase table editor to inspect data

## Next Steps

1. **Real-time Updates**: Add Supabase real-time subscriptions for live data updates
2. **File Storage**: Use Supabase Storage for file uploads
3. **Edge Functions**: Add serverless functions for complex business logic
4. **Analytics**: Integrate Supabase analytics for usage tracking

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Community](https://github.com/supabase/supabase/discussions)
- [STMBudget Issues](https://github.com/your-repo/issues)
