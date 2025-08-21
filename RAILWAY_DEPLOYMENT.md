# Railway Deployment Guide - Madras Mini Golf

This guide walks you through deploying your mini golf application to Railway with PostgreSQL database integration.

## Prerequisites

- GitHub account with your project repository
- Railway account (sign up at railway.app)
- Railway CLI installed (optional but recommended)

## Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Ensure your code is committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Verify your repository has these key files:**
   - `package.json` with correct scripts
   - `DEPLOYMENT.md` and this `RAILWAY_DEPLOYMENT.md`
   - All source code properly committed

### Step 2: Create Railway Project

1. **Go to Railway Dashboard:**
   - Visit [railway.app](https://railway.app)
   - Sign in with your GitHub account

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your mini golf repository
   - Click "Deploy Now"

3. **Railway will automatically:**
   - Detect it's a Node.js project
   - Run `npm install`
   - Build using `npm run build`
   - Start using `npm start`

### Step 3: Add PostgreSQL Database

1. **In your Railway project dashboard:**
   - Click "Add Service" or the "+" button
   - Select "Database"
   - Choose "PostgreSQL"
   - Railway will automatically provision the database

2. **Database connection is automatic:**
   - Railway provides `DATABASE_URL` environment variable
   - Your app automatically detects and connects to Railway PostgreSQL
   - No manual configuration needed

### Step 4: Configure Environment Variables

1. **In Railway project dashboard:**
   - Go to your web service (not the database)
   - Click "Variables" tab
   - Add these environment variables:

   ```
   NODE_ENV=production
   SESSION_SECRET=your_secure_random_secret_here
   ```

   **To generate a secure SESSION_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **DATABASE_URL is automatically set** by Railway when you add PostgreSQL

### Step 5: Initialize Database Schema

1. **Install Railway CLI (if not already installed):**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Link to your project:**
   ```bash
   railway link
   # Select your project from the list
   ```

4. **Push database schema:**
   ```bash
   railway run npm run db:push
   ```

   This command:
   - Connects to your Railway PostgreSQL database
   - Creates all necessary tables (users, players, games, scores, pricing)
   - Sets up the complete database schema

### Step 6: Verify Deployment

1. **Check deployment status:**
   - In Railway dashboard, view the "Deployments" tab
   - Wait for build to complete (usually 2-3 minutes)
   - Green checkmark indicates successful deployment

2. **Access your live application:**
   - Railway provides a public URL (like `https://your-app-name.railway.app`)
   - Click the domain or copy the URL
   - Test the complete flow: registration → gameplay → results

3. **Test key features:**
   - Player registration and game setup
   - Score entry and hole progression
   - Final results and sharing functionality
   - Admin login and dashboard access

### Step 7: Custom Domain (Optional)

1. **In Railway project settings:**
   - Go to "Settings" → "Domains"
   - Add your custom domain
   - Configure DNS records as instructed
   - Railway provides automatic SSL certificates

## Post-Deployment Configuration

### Admin Account Setup

1. **Access your live app's admin registration:**
   - Visit `https://your-app.railway.app/admin-login`
   - Create your admin account
   - Set up initial pricing (weekday/weekend rates)

### Database Management

1. **View database directly in Railway:**
   - Click on your PostgreSQL service
   - Use the "Query" tab to run SQL commands
   - Monitor database usage and performance

2. **Backup considerations:**
   - Railway automatically backs up your database
   - Export data if needed for additional backups

## Troubleshooting

### Common Issues

1. **Build fails:**
   - Check "Deploy Logs" in Railway dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Database connection errors:**
   - Confirm PostgreSQL service is running
   - Check if `DATABASE_URL` is set in environment variables
   - Verify schema was pushed successfully

3. **Application not loading:**
   - Check if `SESSION_SECRET` is set
   - Review application logs in Railway dashboard
   - Ensure port configuration is correct (app uses Railway's PORT)

### Getting Help

- Railway documentation: [docs.railway.app](https://docs.railway.app)
- Railway Discord community for support
- Check Railway status page for service issues

## Monitoring and Maintenance

### Performance Monitoring

1. **Railway provides built-in metrics:**
   - CPU and memory usage
   - Request metrics and response times
   - Database performance stats

2. **Application logs:**
   - Access real-time logs in Railway dashboard
   - Monitor for errors or performance issues
   - Set up log-based alerts if needed

### Scaling

1. **Automatic scaling:**
   - Railway scales automatically based on traffic
   - No manual configuration needed for basic scaling

2. **Resource limits:**
   - Monitor usage in Railway dashboard
   - Upgrade plan if you exceed limits

## Security Best Practices

1. **Environment variables:**
   - Keep `SESSION_SECRET` secure and random
   - Never commit secrets to your repository
   - Rotate secrets periodically

2. **Database security:**
   - Railway PostgreSQL is private by default
   - Only your application can access the database
   - Regular security updates handled by Railway

## Cost Optimization

1. **Monitor usage:**
   - Check Railway billing dashboard monthly
   - Optimize database queries if needed
   - Consider upgrading plan for better performance

2. **Development vs Production:**
   - Use Railway for production
   - Keep using local development environment
   - This maintains cost efficiency

---

## Quick Reference Commands

```bash
# Build and test locally before deploying
npm run build
npm start

# Deploy to Railway (after push to GitHub)
# Railway automatically builds and deploys

# Update database schema
railway run npm run db:push

# View live logs
railway logs

# Check deployment status
railway status
```

Your Madras Mini Golf application is now live on Railway with full database functionality!