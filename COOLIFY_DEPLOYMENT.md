# Coolify Deployment Guide
## Steal Deal E-Commerce Platform

This guide covers deploying the Steal Deal platform on Coolify with proper configuration to avoid 504 Gateway Timeout issues.

---

## Prerequisites

- Coolify instance running (v4.x recommended)
- Server with minimum 3 CPU cores and 8GB RAM
- Domain name configured
- MongoDB credentials (if using external MongoDB)

---

## Quick Deployment Steps

### 1. Connect Repository to Coolify

1. In Coolify dashboard, click **Add Resource** → **Git Repository**
2. Select your repository: `https://github.com/sumeet22/steal-deal.git`
3. Choose the branch you want to deploy (usually `main`)

### 2. Configure Build Settings

**Build Pack**: Docker Compose

**Docker Compose Location**: `docker-compose.yml`

### 3. Environment Variables

Add these environment variables in Coolify:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration
MONGO_URI=mongodb://db:27017/stealdeal

# JWT Configuration (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email Configuration (for order notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Payment Gateway (Cashfree)
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=production

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Coolify-specific settings
NODE_OPTIONS=--max-old-space-size=1024
```

### 4. Port Configuration

In Coolify, configure the following ports:

| Service | Internal Port | Public Port |
|---------|---------------|-------------|
| Nginx (Frontend) | 80 | 443 (HTTPS) |
| Backend API | 5000 | Internal only |
| MongoDB | 27017 | Internal only |

### 5. Health Check Configuration

Configure health checks in Coolify:

**Backend Health Check:**
- URL: `http://localhost:5000/health`
- Interval: 15 seconds
- Timeout: 10 seconds
- Retries: 3
- Start Period: 60 seconds

**Frontend Health Check:**
- URL: `http://localhost:80/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

---

## Troubleshooting 504 Gateway Timeout

### Common Causes and Solutions

#### 1. Backend Not Starting

**Symptoms**: 504 error, backend container keeps restarting

**Solutions:**
```bash
# Check backend logs
docker logs <backend_container_name>

# Check if MongoDB is connected
docker logs <backend_container_name> | grep -i "mongo"

# Verify MongoDB is running
docker logs <db_container_name>
```

#### 2. MongoDB Connection Issues

**Symptoms**: Backend logs show "MongoDB connection error"

**Solutions:**
- Ensure MongoDB container is healthy before backend starts
- Check `MONGO_URI` environment variable
- Verify network connectivity between containers

```bash
# Test MongoDB connection from backend container
docker exec -it <backend_container_name> wget -qO- http://db:27017
```

#### 3. Memory Issues

**Symptoms**: Container gets killed, OOM errors

**Solutions:**
- Increase memory limits in Coolify resource settings
- Backend: Minimum 1536MB
- MongoDB: Minimum 2048MB
- Nginx: Minimum 512MB

```bash
# Check memory usage
docker stats

# Check for OOM kills
dmesg | grep -i oom
```

#### 4. Coolify Proxy Conflicts

**Symptoms**: 504 error but containers are healthy

**Solutions:**
- Coolify uses Traefik as reverse proxy
- Ensure your docker-compose doesn't conflict with Traefik
- In Coolify settings, disable "Add Traefik labels" if using custom nginx

#### 5. Slow Database Queries

**Symptoms**: Backend responds but slowly, occasional timeouts

**Solutions:**
```bash
# Check MongoDB slow queries
docker exec -it <db_container_name> mongosh
use stealdeal
db.setProfilingLevel(1, { slowms: 100 })

# View slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

---

## Coolify-Specific Configuration

### Using Coolify's Built-in Database

If you prefer using Coolify's managed MongoDB instead of docker-compose:

1. **Create MongoDB Service** in Coolify
2. **Get Connection String** from Coolify dashboard
3. **Update Environment Variables**:
   ```env
   MONGO_URI=mongodb://username:password@host:port/stealdeal?authSource=admin
   ```
4. **Remove `db` service** from docker-compose.yml or set it to `enabled: false`

### Using Custom Domain

1. In Coolify, go to your application settings
2. Add your domain: `yourdomain.com`
3. Coolify will automatically configure SSL via Let's Encrypt
4. Wait for DNS propagation (up to 24 hours)

### Auto-Deploy on Push

1. In Coolify application settings
2. Enable "Auto Deploy"
3. Configure webhook URL in GitHub repository settings
4. Every push to the configured branch will trigger a deployment

---

## Monitoring and Maintenance

### Check Container Status

```bash
# View all containers
docker ps

# View container logs
docker logs -f <container_name>

# View resource usage
docker stats
```

### Database Backup

```bash
# Backup MongoDB
docker exec <db_container_name> mongodump --out /data/backup

# Copy backup to host
docker cp <db_container_name>:/data/backup ./backup
```

### Database Restore

```bash
# Copy backup to container
docker cp ./backup <db_container_name>:/data/backup

# Restore MongoDB
docker exec <db_container_name> mongorestore /data/backup
```

### Restart Services

```bash
# Restart all services
docker compose restart

# Restart specific service
docker compose restart backend

# Rebuild and restart
docker compose up -d --build
```

---

## Performance Tuning for Coolify

### 1. Resource Allocation

Based on your server (3 cores, 8GB RAM):

| Service | CPU | Memory |
|---------|-----|--------|
| Nginx | 0.5 core | 512MB |
| Backend | 1.5 cores | 1536MB |
| MongoDB | 1 core | 2048MB |

### 2. MongoDB Optimization

The docker-compose already includes:
- `wiredTigerCacheSizeGB: 1.5` - Limits MongoDB cache
- Proper memory limits to prevent OOM kills

### 3. Nginx Optimization

Already configured with:
- Gzip compression
- Static file caching (1 year for images)
- Rate limiting
- Connection keepalive

### 4. Backend Optimization

Already configured with:
- Node.js memory limit: 1024MB
- MongoDB connection pooling
- Rate limiting
- Graceful shutdown

---

## Deployment Checklist

- [ ] Repository connected to Coolify
- [ ] All environment variables configured
- [ ] MongoDB credentials verified
- [ ] Health checks configured
- [ ] Resource limits set (CPU/Memory)
- [ ] Domain configured with SSL
- [ ] Initial deployment successful
- [ ] Health endpoints responding (200 OK)
- [ ] Frontend loading without 504 errors
- [ ] API endpoints responding correctly
- [ ] Database connection verified

---

## Emergency Recovery

### If Site Goes Down

1. **Check Coolify Dashboard** for container status
2. **View Logs**:
   ```bash
   docker compose logs --tail=100
   ```
3. **Restart Services**:
   ```bash
   docker compose down
   docker compose up -d
   ```
4. **Check Health**:
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:80/health
   ```

### If MongoDB Fails

1. **Check MongoDB Status**:
   ```bash
   docker exec <db_container_name> mongosh --eval "db.adminCommand('ping')"
   ```
2. **Restart MongoDB**:
   ```bash
   docker compose restart db
   ```
3. **Check Data Integrity**:
   ```bash
   docker exec <db_container_name> mongosh
   use stealdeal
   db.products.countDocuments()
   db.orders.countDocuments()
   ```

---

## Support

If you continue experiencing issues:

1. Check application logs in Coolify dashboard
2. Verify all environment variables are correct
3. Ensure sufficient server resources
4. Check Coolify's own logs for proxy issues
5. Review server resource usage with `htop` or `docker stats`

---

## Version History

| Date | Change |
|------|--------|
| 2025-07-04 | Added graceful shutdown, increased memory limits, MongoDB cache optimization |
| 2025-12-15 | Added database indexes, connection pooling |