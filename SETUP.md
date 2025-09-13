# Setup Instructions

## Environment Variables

To run this application, you need to set up your Supabase environment variables:

1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Go to Settings > API
5. Copy the Project URL and anon/public key

## GitHub Pages Deployment

For GitHub Pages deployment, you need to set up the environment variables as GitHub Secrets:

1. Go to your GitHub repository
2. Click on Settings > Secrets and variables > Actions
3. Add the following secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env.local` file with Supabase credentials

3. Run the development server:
   ```bash
   npm run dev
   ```

## Build

To build the application:

```bash
npm run build
```

The build will create a static export in the `out` directory.
