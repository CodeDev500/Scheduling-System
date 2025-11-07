# Deployment Guide for Optisched

This guide covers deploying the Optisched application to Vercel with Cloudinary integration.

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Cloudinary Account](https://cloudinary.com)
- PostgreSQL Database (e.g., [Supabase](https://supabase.com), [Neon](https://neon.tech), or [Railway](https://railway.app))

## Part 1: Cloudinary Setup

### 1. Create Cloudinary Account
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Navigate to your dashboard
3. Copy the following credentials:
   - Cloud Name
   - API Key
   - API Secret

## Part 2: Database Setup

### Option A: Supabase (Recommended)
1. Create a project at [supabase.com](https://supabase.com)
2. Go to Project Settings → Database
3. Copy the connection string (URI format)

### Option B: Neon
1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string

### Option C: Railway
1. Create a PostgreSQL database at [railway.app](https://railway.app)
2. Copy the connection string

## Part 3: Server Deployment (Vercel)

### 1. Prepare Server for Deployment

Create `server/vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ]
}
```

### 2. Deploy to Vercel

#### Via Vercel CLI:
```bash
cd server
npm install -g vercel
vercel
```

#### Via Vercel Dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set Root Directory to `server`
4. Configure environment variables (see below)

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Database
DATABASE_URL=your-postgresql-connection-string

# JWT Secrets
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server
NODE_ENV=production
```

### 4. Run Database Migrations

After deployment, run migrations:
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Link to your project
vercel link

# Run migrations
vercel env pull .env.production
npx prisma migrate deploy
```

## Part 4: Client Deployment (Vercel)

### 1. Update API URL

In `client/src/api/axios.ts`, update the base URL:
```typescript
const axios = Axios.create({
  baseURL: "https://your-server-url.vercel.app", // Replace with your actual server URL
  withCredentials: true,
});
```

### 2. Deploy Client

#### Via Vercel Dashboard:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Set Root Directory to `client`
4. Framework Preset: Vite (or your framework)
5. Deploy

#### Via Vercel CLI:
```bash
cd client
vercel
```

### 3. Configure Client Environment Variables (if needed)

```env
VITE_API_URL=https://your-server-url.vercel.app
```

## Part 5: Post-Deployment

### 1. Test Image Upload
1. Go to your deployed client URL
2. Register a new user with a profile image
3. Verify the image appears in Cloudinary dashboard
4. Verify the image displays correctly in the app

### 2. Verify Database Connection
1. Check that users are being created in your database
2. Test login functionality
3. Verify OTP email delivery

### 3. Update CORS Settings

In `server/src/index.ts`, update CORS to allow your client domain:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-client-url.vercel.app'
  ],
  credentials: true
}));
```

## Troubleshooting

### Issue: "Cannot write to filesystem"
- **Solution**: This is why we use Cloudinary. Ensure all file uploads use Cloudinary, not local storage.

### Issue: "Database connection failed"
- **Solution**: Verify DATABASE_URL is correct and the database is accessible from Vercel's servers.

### Issue: "CORS errors"
- **Solution**: Add your client URL to the CORS whitelist in the server.

### Issue: "Images not uploading"
- **Solution**: 
  - Verify Cloudinary credentials in environment variables
  - Check Cloudinary dashboard for error logs
  - Ensure file size is under 5MB

### Issue: "OTP emails not sending"
- **Solution**: 
  - Verify EMAIL_USER and EMAIL_PASS are correct
  - For Gmail, use an App Password, not your regular password
  - Enable "Less secure app access" or use OAuth2

## Monitoring

### Vercel Logs
- View real-time logs in Vercel Dashboard → Deployments → [Your Deployment] → Logs

### Cloudinary Usage
- Monitor storage and bandwidth in Cloudinary Dashboard → Reports

### Database
- Monitor connections and queries in your database provider's dashboard

## Scaling Considerations

### Free Tier Limits
- **Vercel**: 100GB bandwidth/month
- **Cloudinary**: 25GB storage, 25GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth/month

### Upgrade Paths
- Consider upgrading plans as your user base grows
- Implement image compression before upload
- Use Cloudinary transformations for responsive images

## Security Checklist

- ✅ Environment variables are set in Vercel (not in code)
- ✅ JWT secrets are strong and unique
- ✅ Database credentials are secure
- ✅ CORS is properly configured
- ✅ File upload size limits are enforced
- ✅ Only allowed file types can be uploaded
- ✅ HTTPS is enabled (automatic with Vercel)

## Support

For issues:
1. Check Vercel deployment logs
2. Check Cloudinary dashboard for upload errors
3. Verify all environment variables are set correctly
4. Test locally first with the same environment variables
