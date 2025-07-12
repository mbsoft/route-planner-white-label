# Deployment Quickstart

## 🚀 Quick Deploy to Vercel

### Prerequisites Checklist
- [ ] Node.js 18.17.0+ installed
- [ ] NextBillion API key
- [ ] Turso database setup
- [ ] Vercel account

### 1. Environment Setup
```bash
# Create .env.local
NEXTBILLION_API_KEY=your_key_here
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token_here
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app
USE_CASE=jobs
```

### 2. Local Test
```bash
nvm use 18.20.8
npm install
npm run dev
# Test at http://localhost:3000
```

### 3. Deploy to Vercel
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 4. Configure Vercel Environment Variables
Go to Vercel Dashboard → Settings → Environment Variables

| Variable | Value |
|----------|-------|
| `NEXTBILLION_API_KEY` | Your NextBillion API key |
| `TURSO_DATABASE_URL` | Your Turso database URL |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |
| `NEXTAUTH_SECRET` | Random secret string |
| `NEXTAUTH_URL` | Your Vercel domain |
| `USE_CASE` | `jobs` |

### 5. Verify Deployment
- [ ] Application loads without errors
- [ ] Can upload CSV files
- [ ] Can run optimizations
- [ ] Can view results and maps
- [ ] Database stores data correctly

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| Node.js version error | Set Node.js 18+ in Vercel settings |
| API key not found | Add `NEXTBILLION_API_KEY` to Vercel env vars |
| Database connection failed | Verify Turso URL and token |
| Build fails | Check for TypeScript errors |

## 📞 Support
- **Full Guide**: See `VERCEL_DEPLOYMENT.md`
- **Vercel Docs**: https://vercel.com/docs
- **NextBillion Docs**: https://nextbillion.ai/docs
- **Turso Docs**: https://turso.tech/docs 