# Vercel Deployment Guide

This guide covers the setup and deployment process for launching the Route Planner White Label application on Vercel.

## Prerequisites

- Node.js 18.17.0 or higher (required for Next.js)
- Git repository access
- Vercel account
- NextBillion.ai API key
- Turso database setup

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# NextBillion API Configuration
NEXTBILLION_API_KEY=your_nextbillion_api_key_here

# Turso Database Configuration
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your_turso_auth_token_here

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app

# Optional: Use Case Configuration
USE_CASE=jobs
```

### Getting Your API Keys

#### NextBillion API Key
1. Sign up at [NextBillion.ai](https://nextbillion.ai)
2. Navigate to your dashboard
3. Generate an API key
4. Copy the key to `NEXTBILLION_API_KEY`

#### Turso Database Setup
1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Login: `turso auth login`
3. Create database: `turso db create route-planner-db`
4. Get database URL: `turso db show route-planner-db --url`
5. Create auth token: `turso db tokens create route-planner-db`
6. Copy URL to `TURSO_DATABASE_URL` and token to `TURSO_AUTH_TOKEN`

## Local Development Setup

### 1. Install Dependencies

```bash
# Install Node.js 18+ (if not already installed)
nvm install 18.20.8
nvm use 18.20.8

# Install project dependencies
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Verify Setup

1. Open `http://localhost:3000`
2. Check that the application loads without errors
3. Verify API configuration by running a test optimization

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Deploy to Vercel

#### Option A: Deploy from Git Repository

1. Push your code to GitHub/GitLab
2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Configure environment variables (see below)

#### Option B: Deploy from Local Directory

```bash
# From your project root
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? [your-account]
# - Link to existing project? N
# - Project name? route-planner-white-label
# - Directory? ./
# - Override settings? N
```

### 4. Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each environment variable:

| Name | Value | Environment |
|------|-------|-------------|
| `NEXTBILLION_API_KEY` | `your_nextbillion_api_key` | Production, Preview, Development |
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` | Production, Preview, Development |
| `TURSO_AUTH_TOKEN` | `your_turso_token` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `your_nextauth_secret` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://your-domain.vercel.app` | Production |
| `USE_CASE` | `jobs` | Production, Preview, Development |

### 5. Configure Build Settings

In your Vercel project settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x

### 6. Deploy

```bash
# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

## Post-Deployment Verification

### 1. Check Application Health

1. Visit your deployed URL
2. Verify the application loads correctly
3. Check browser console for any errors

### 2. Test Core Functionality

1. **Data Import**: Upload a CSV file with jobs/vehicles
2. **Optimization**: Run a route optimization
3. **Analysis**: View optimization results and shared maps
4. **Database**: Verify data is being stored in Turso

### 3. Monitor Logs

```bash
# View Vercel function logs
vercel logs

# View real-time logs
vercel logs --follow
```

## Custom Domain Setup (Optional)

### 1. Add Custom Domain

1. Go to Vercel project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

### 2. Update Environment Variables

Update `NEXTAUTH_URL` to your custom domain:

```bash
NEXTAUTH_URL=https://your-custom-domain.com
```

## Troubleshooting

### Common Issues

#### 1. Node.js Version Error
```
Error: You are using Node.js 16.20.2. For Next.js, Node.js version >= v18.17.0 is required.
```

**Solution**: Update Node.js to version 18+ in Vercel project settings.

#### 2. Environment Variables Not Found
```
Error: NEXTBILLION_API_KEY environment variable is required
```

**Solution**: Verify all environment variables are set in Vercel dashboard.

#### 3. Database Connection Issues
```
Error: Failed to connect to Turso database
```

**Solution**: 
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Check Turso database is active
- Ensure IP allowlist includes Vercel's IPs

#### 4. API Key Issues
```
Error: API request failed: 401 Unauthorized
```

**Solution**: Verify `NEXTBILLION_API_KEY` is correct and active.

### Debug Commands

```bash
# Check Vercel deployment status
vercel ls

# View deployment details
vercel inspect [deployment-url]

# Rollback to previous deployment
vercel rollback

# Remove deployment
vercel remove [project-name]
```

## Performance Optimization

### 1. Enable Edge Functions

Update `next.config.js` to use Edge Runtime for API routes:

```javascript
module.exports = {
  experimental: {
    runtime: 'edge',
  },
}
```

### 2. Optimize Images

Ensure images are optimized and served from CDN:

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
}
```

### 3. Enable Caching

Add caching headers to API routes:

```javascript
// app/api/optimization-results/route.ts
export async function GET(req: NextRequest) {
  const response = NextResponse.json(data)
  response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate')
  return response
}
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use Vercel's environment variable encryption
- Rotate API keys regularly

### 2. API Rate Limiting
- Implement rate limiting for optimization requests
- Monitor API usage to prevent abuse

### 3. Database Security
- Use Turso's built-in security features
- Regularly backup database
- Monitor database access logs

## Monitoring and Analytics

### 1. Vercel Analytics
Enable Vercel Analytics in your project settings for performance monitoring.

### 2. Error Tracking
Consider integrating Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

### 3. Performance Monitoring
Monitor Core Web Vitals and performance metrics through Vercel dashboard.

## Support

For issues related to:
- **Vercel Deployment**: [Vercel Documentation](https://vercel.com/docs)
- **NextBillion API**: [NextBillion Documentation](https://nextbillion.ai/docs)
- **Turso Database**: [Turso Documentation](https://turso.tech/docs)
- **Next.js**: [Next.js Documentation](https://nextjs.org/docs)

## Changelog

### Version 1.0.0
- Initial deployment guide
- Vercel configuration
- Environment variables setup
- Troubleshooting guide 