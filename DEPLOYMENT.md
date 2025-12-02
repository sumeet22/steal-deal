# Deploying to Coolify

This guide walks you through deploying the StealDeal application to Coolify.

## Prerequisites

- Coolify instance set up and running
- MongoDB database (can be deployed on Coolify or use external service like MongoDB Atlas)
- Domain names configured (optional but recommended)

## Architecture

The application consists of three services:
1. **Frontend** - React SPA served by Nginx
2. **Backend** - Node.js/Express API
3. **MongoDB** - Database (can be external)

## Deployment Steps

### 1. Deploy MongoDB (Option A: On Coolify)

1. In Coolify, create a new **Database** resource
2. Select **MongoDB**
3. Note the connection string provided by Coolify
4. Format: `mongodb://username:password@host:port/database`

### 1. Deploy MongoDB (Option B: MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get your connection string
3. Whitelist Coolify server IP address

### 2. Deploy Backend

1. In Coolify, create a new **Application**
2. Connect your Git repository
3. Configure the following:
   - **Build Pack**: Dockerfile
   - **Dockerfile**: `Dockerfile.backend`
   - **Port**: 5000

4. Set **Environment Variables**:
   ```
   MONGO_URI=mongodb://your-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   BASE_URL=https://api.yourdomain.com
   NODE_ENV=production
   PORT=5000
   ```

5. **Deploy** the backend
6. Note the backend URL (e.g., `https://api.yourdomain.com`)

### 3. Deploy Frontend

1. In Coolify, create another new **Application**
2. Connect the same Git repository
3. Configure the following:
   - **Build Pack**: Dockerfile
   - **Dockerfile**: `Dockerfile.frontend`
   - **Port**: 80

4. Set **Environment Variables** (build-time):
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```

5. **Important**: Update `nginx.conf` before deploying
   - Replace `proxy_pass http://backend:5000;` with your actual backend URL
   - Example: `proxy_pass https://api.yourdomain.com;`

6. **Deploy** the frontend

### 4. Configure Domains (Optional)

1. In Coolify, go to each application's settings
2. Add your custom domain:
   - Backend: `api.yourdomain.com`
   - Frontend: `yourdomain.com` or `app.yourdomain.com`
3. Enable **SSL/TLS** (Coolify handles this automatically with Let's Encrypt)

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://user:pass@host:27017/stealdeal` |
| `JWT_SECRET` | Secret key for JWT tokens | `super-secret-key-change-in-prod` |
| `EMAIL_USER` | Email for sending notifications | `your-email@gmail.com` |
| `EMAIL_PASS` | Email app password | `your-app-password` |
| `BASE_URL` | Backend API URL | `https://api.yourdomain.com` |
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `5000` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | API key for Gemini AI | `your-api-key` |

## Testing Your Deployment

1. **Backend Health Check**:
   ```bash
   curl https://api.yourdomain.com/
   # Should return: "API is running..."
   ```

2. **Frontend Access**:
   - Open your browser to `https://yourdomain.com`
   - Verify the application loads
   - Check browser console for any errors

3. **API Connectivity**:
   - In browser DevTools, check Network tab
   - Verify `/api/*` requests are successful
   - Confirm they're being proxied to the backend

## Troubleshooting

### Frontend Build Fails

**Error**: `Cannot find module @rollup/rollup-linux-arm64-musl`

**Solution**: The updated `Dockerfile.frontend` handles this by removing `package-lock.json` and using `npm install --force`

### Backend Can't Connect to MongoDB

**Check**:
- Verify `MONGO_URI` is correct
- Ensure MongoDB is running and accessible
- Check firewall rules and IP whitelisting

### API Requests Fail (CORS errors)

**Solution**: Update `nginx.conf` to use the correct backend URL:
```nginx
location /api {
    proxy_pass https://your-actual-backend-url.com;
    # ... rest of config
}
```

### Environment Variables Not Working

**Check**:
- Verify variables are set in Coolify UI
- Restart the application after changing variables
- Check application logs in Coolify

## Local Testing with Docker

Before deploying to Coolify, test locally:

```bash
# Build images
docker build -f Dockerfile.frontend -t stealdeal-frontend .
docker build -f Dockerfile.backend -t stealdeal-backend .

# Run with docker-compose
docker-compose up

# Access application
# Frontend: http://localhost:80
# Backend: http://localhost:5000
```

## Updating Your Application

1. Push changes to your Git repository
2. In Coolify, click **Redeploy** on the application
3. Coolify will automatically rebuild and deploy

## Security Best Practices

1. **Use Strong Secrets**: Generate random strings for `JWT_SECRET`
2. **Environment Variables**: Never commit `.env` files to Git
3. **HTTPS Only**: Always use SSL/TLS in production
4. **MongoDB**: Use authentication and restrict network access
5. **Email**: Use app-specific passwords, not your main password

## Support

For issues specific to:
- **Coolify**: Check [Coolify Documentation](https://coolify.io/docs)
- **Application**: Check application logs in Coolify dashboard
