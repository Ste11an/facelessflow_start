# FacelessFlow SaaS Web App - Deployment Guide

This document provides instructions for deploying the FacelessFlow SaaS web application.

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- API keys for all integrated services:
  - OpenAI
  - ElevenLabs
  - Shotstack
  - Pexels
  - YouTube
  - TikTok

## Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/facelessflow.git
cd facelessflow
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the Supabase database by following the instructions in `SUPABASE_SETUP.md`.

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Deployment

### Option 1: Deploy to Vercel (Recommended)

1. Push your code to a GitHub repository.

2. Sign up for a [Vercel](https://vercel.com) account if you don't have one.

3. Create a new project in Vercel and connect it to your GitHub repository.

4. Configure the environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Deploy the project.

### Option 2: Self-Hosted Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Post-Deployment Steps

1. Create an admin account by signing up through the application.

2. Access the Admin Dashboard and add your API keys for:
   - OpenAI
   - ElevenLabs
   - Shotstack
   - Pexels
   - YouTube
   - TikTok

3. Create your first series and start generating content!

## Troubleshooting

- If you encounter issues with API integrations, verify that your API keys are correctly entered in the Admin Dashboard.
- For database issues, check the Supabase console for error logs.
- For deployment issues, check the Vercel deployment logs or your server logs.

## Security Considerations

- All API keys are stored encrypted in the database.
- Row-level security ensures users can only access their own data.
- Make sure to set up proper authentication settings in your Supabase project.
