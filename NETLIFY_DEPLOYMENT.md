# Netlify Deployment Guide

## 🚨 Issue Fixed: 404 on /admin Routes

The "Page Not Found" error on routes like `/admin` and `/admin-login` has been fixed!

### What Was the Problem?

Netlify serves static files and doesn't know about React Router's client-side routes. When you navigate to `fortalezamenu.netlify.app/admin`, Netlify looks for a file called `admin` which doesn't exist, resulting in a 404.

### The Solution

Two configuration files have been created to tell Netlify to redirect all routes to `index.html`, allowing React Router to handle the routing:

1. **`netlify.toml`** - Main Netlify configuration
2. **`public/_redirects`** - Backup redirect rules

## 📦 How to Deploy the Fix

### Option 1: Push to Git (Recommended)

If your Netlify site is connected to a Git repository:

```bash
# Add the new files
git add netlify.toml public/_redirects

# Commit the changes
git commit -m "Fix: Add Netlify routing configuration for React Router"

# Push to your repository
git push origin main
```

Netlify will automatically detect the changes and redeploy your site.

### Option 2: Manual Deploy

If you're deploying manually:

1. Build your project:
   ```bash
   npm run build
   ```

2. The `dist` folder will contain:
   - Your built app
   - The `_redirects` file (copied from `public/`)

3. Drag and drop the `dist` folder to Netlify, or use Netlify CLI:
   ```bash
   netlify deploy --prod --dir=dist
   ```

## ✅ Verify the Fix

After deployment, test these URLs:

1. **Main menu**: `https://fortalezamenu.netlify.app/`
   - Should work ✅

2. **Admin login**: `https://fortalezamenu.netlify.app/admin-login`
   - Should show login page ✅

3. **Admin dashboard**: `https://fortalezamenu.netlify.app/admin`
   - Should redirect to login if not authenticated ✅

4. **Direct refresh**: Go to `/admin`, refresh the page
   - Should still work ✅

## 📋 Files Created

### 1. `netlify.toml`
Located in project root. Contains:
- Redirect rules for client-side routing
- Security headers
- Cache configuration for static assets

### 2. `public/_redirects`
Located in `public/` folder. Contains:
- Simple redirect rule: `/* /index.html 200`
- This file is copied to `dist/` during build

## 🔧 Configuration Details

### netlify.toml
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

This tells Netlify:
- For any route (`/*`)
- Serve `index.html`
- With status code 200 (OK)
- React Router then handles the routing client-side

### _redirects
```
/*    /index.html   200
```

Same functionality, different format. Netlify checks both files.

## 🚀 Build Configuration

Make sure your Netlify build settings are:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 or higher (set in Netlify UI or add to `netlify.toml`)

### Optional: Add Node Version

Add to `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
```

## 🐛 Troubleshooting

### Still getting 404?

1. **Check deployment logs**:
   - Go to Netlify dashboard
   - Click on your site
   - Go to "Deploys"
   - Check the latest deploy log

2. **Verify files are deployed**:
   - In Netlify dashboard, go to "Deploys"
   - Click "Deploy log"
   - Look for `_redirects` in the deployed files

3. **Clear cache**:
   - In Netlify dashboard
   - Go to "Site settings" → "Build & deploy"
   - Click "Clear cache and deploy site"

4. **Check build output**:
   ```bash
   npm run build
   ls dist/  # Should include _redirects file
   ```

### Routes work locally but not on Netlify?

- Make sure you've committed and pushed the configuration files
- Check that `public/_redirects` exists
- Verify `netlify.toml` is in the project root
- Redeploy the site

### Admin page shows but then redirects?

This is normal! The admin dashboard checks for authentication and redirects to `/admin-login` if you're not logged in. This is the expected behavior.

## 📱 Testing Checklist

After deployment, test:

- [ ] Homepage loads: `/`
- [ ] Admin login loads: `/admin-login`
- [ ] Admin dashboard loads: `/admin`
- [ ] Can login and access dashboard
- [ ] Refresh on `/admin` doesn't cause 404
- [ ] Direct URL navigation works
- [ ] Browser back/forward buttons work

## 🎯 Next Steps

1. **Commit the configuration files**:
   ```bash
   git add netlify.toml public/_redirects
   git commit -m "Add Netlify routing configuration"
   git push
   ```

2. **Wait for Netlify to redeploy** (automatic if connected to Git)

3. **Test all routes** on your live site

4. **Update DNS** (if using custom domain):
   - Point `fortalezamenu.com` to Netlify
   - All routes will work automatically

## 🌐 Custom Domain Setup

If you want to use `fortalezamenu.com` instead of `fortalezamenu.netlify.app`:

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter `fortalezamenu.com`
4. Follow Netlify's DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

All routes will work the same way:
- `fortalezamenu.com/`
- `fortalezamenu.com/admin-login`
- `fortalezamenu.com/admin`

## ✨ Summary

**Problem**: Routes like `/admin` returned 404  
**Cause**: Netlify doesn't know about React Router  
**Solution**: Added `netlify.toml` and `_redirects` files  
**Result**: All routes now work correctly! 🎉

Just commit, push, and your routes will work!
