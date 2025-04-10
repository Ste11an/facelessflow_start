# Supabase Setup Instructions

This document provides instructions for setting up the Supabase project for FacelessFlow.

## Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project (e.g., "facelessflow")
4. Set a secure database password
5. Choose a region closest to your users
6. Wait for the project to be created

## Get API Keys

After your project is created:

1. Go to the project dashboard
2. Navigate to Project Settings > API
3. Copy the "Project URL" and "anon public" key
4. These will be used in your `.env.local` file

## Set Up Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Run Database Migrations

To set up the database tables:

1. Install Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```

2. Log in to Supabase CLI:
   ```
   supabase login
   ```

3. Link your project:
   ```
   supabase link --project-ref your_project_reference
   ```

4. Run the migrations:
   ```
   supabase db push
   ```

Alternatively, you can manually run the SQL from the migration files in the Supabase SQL editor.

## Set Up Authentication

1. In the Supabase dashboard, go to Authentication > Settings
2. Configure Site URL to match your application URL
3. Enable Email auth provider if not already enabled
4. Customize email templates if desired

## Row Level Security

The migrations include Row Level Security (RLS) policies to ensure users can only access their own data. Make sure these are properly applied by checking the policies in the Supabase dashboard under Database > Policies.
