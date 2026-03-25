# Doubtify Platform Deployment Guide

## 📦 Deployment Architecture

### Frontend (Vercel)

- **Platform**: Vercel (Next.js optimized)
- **Build**: Automatic from GitHub
- **Domain**: Custom domain ready
- **CDN**: Global edge network

### Backend (Render)

- **Platform**: Render (Docker/Node.js)
- **Database**: PostgreSQL on Supabase
- **Environment**: Production variables
- **SSL**: Automatic HTTPS

### Database (Supabase)

- **Provider**: Supabase PostgreSQL
- **Connection**: SSL enabled
- **Backups**: Automatic daily
- **Scaling**: Managed

---

## 🚀 Frontend Deployment (Vercel)

### 1. Environment Variables (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://uwrnbvfuudccqqxlgipl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_NAME=Doubtify
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 2. Vercel Deployment Steps

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Configure Build**: Vercel auto-detects Next.js settings
3. **Set Environment Variables**: Add production environment variables
4. **Deploy**: Automatic deployment on push to main branch

### 3. Build Configuration (vercel.json)

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url"
  }
}
```

---

## 🔧 Backend Deployment (Render)

### 1. Environment Variables

```env
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.uwrnbvfuudccqqxlgipl:doubtify67%21%40%23%24%25@aws-0-us-east-1.pooler.supabase.com:6543/postgres
JWT_SECRET=your_production_jwt_secret_very_long_and_secure
SUPABASE_URL=https://uwrnbvfuudccqqxlgipl.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
FRONTEND_URL=https://your-app.vercel.app
```

### 2. Render Service Configuration

```yaml
# render.yaml
services:
  - type: web
    name: doubtify-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: doubtify-db
          property: connectionString
```

### 3. Production Dockerfile (Optional)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 10000
CMD ["npm", "start"]
```

---

## 🗄️ Database Setup (Supabase)

### 1. Production Connection

- **URL**: https://uwrnbvfuudccqqxlgipl.supabase.co
- **Connection String**: Ready for production
- **SSL**: Required (already configured)
- **Pooling**: Connection pooler enabled

### 2. Security Configuration

- **Row Level Security**: Enabled on sensitive tables
- **API Keys**: Separate keys for production
- **Backups**: Point-in-time recovery enabled

---

## 🌍 Custom Domain Setup

### 1. Vercel Domain Configuration

1. Add custom domain in Vercel dashboard
2. Configure DNS records:
   - `A` record: `76.76.19.61`
   - `CNAME` record: `cname.vercel-dns.com`

### 2. SSL Certificates

- Automatic SSL via Let's Encrypt
- HTTPS redirect enabled
- HSTS headers configured

---

## 📊 Monitoring & Analytics

### 1. Vercel Analytics

```bash
npm install @vercel/analytics
```

### 2. Error Tracking (Optional)

```bash
npm install @sentry/nextjs
```

### 3. Performance Monitoring

- Core Web Vitals tracking
- Real User Monitoring
- Performance insights

---

## 🔒 Security Checklist

### Frontend

- [x] Environment variables secured
- [x] API endpoints validated
- [x] HTTPS enforced
- [x] CSP headers configured

### Backend

- [x] JWT secrets secured
- [x] Database credentials encrypted
- [x] Rate limiting enabled
- [x] CORS properly configured

### Database

- [x] SSL connections required
- [x] Connection pooling enabled
- [x] Regular backups scheduled
- [x] Access controls configured

---

## 🚀 Deployment Commands

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd /path/to/frontend
vercel --prod
```

### Deploy to Render

1. Connect GitHub repository
2. Configure environment variables
3. Deploy automatically on push

### Database Migration

```bash
# Run in production environment
npm run db:migrate
npm run db:seed
```

---

## 📈 Post-Deployment

### 1. Health Checks

- Frontend: https://your-app.vercel.app
- Backend API: https://your-api.onrender.com/health
- Database: Connection test via backend

### 2. Performance Testing

- Load testing with realistic traffic
- API response time monitoring
- Database query optimization

### 3. User Acceptance Testing

- Authentication flow
- Doubt creation and management
- Response system functionality
- Search and filtering

---

## 🛠️ Maintenance

### 1. Updates

- Weekly dependency updates
- Security patch monitoring
- Performance optimizations

### 2. Backup Strategy

- Database: Automatic daily backups
- Code: Git repository with tags
- Environment: Configuration versioning

### 3. Scaling Considerations

- Database connection limits
- API rate limiting
- CDN cache optimization

---

🎉 **Deployment Complete!**

Your Doubtify platform is ready for production use with:

- ✅ Scalable architecture
- ✅ Security best practices
- ✅ Monitoring and analytics
- ✅ Automated deployments
