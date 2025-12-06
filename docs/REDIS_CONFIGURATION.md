# Redis Configuration Guide

This guide explains how to configure and use Redis for session management and caching in the ERP SteinmetZ application.

## Overview

The application uses Redis for:

- **Session Management**: Distributed session storage for multi-server deployments
- **Caching**: (Future) Distributed caching for improved performance
- **Real-time Data**: (Future) Pub/Sub for real-time features

### Fallback Behavior

The system automatically falls back to in-memory storage when Redis is unavailable, making it:

- Development-friendly (works without Redis)
- Production-ready (with Redis for scalability)
- Fault-tolerant (graceful degradation)

## Installation

### Ubuntu/Debian

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### macOS (Homebrew)

```bash
brew install redis
brew services start redis
```

### Windows (WSL or Docker)

```bash
# Using WSL
sudo apt update
sudo apt install redis-server
sudo service redis-server start

# Using Docker
docker run -d -p 6379:6379 redis:alpine
```

### Verify Installation

```bash
redis-cli ping
# Should return: PONG
```

## Configuration

### Environment Variables

Create or update `.env` file in `apps/backend/`:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=          # Leave empty for no password
REDIS_DB=0               # Database number (0-15)
REDIS_ENABLED=true       # Enable Redis in development (optional)

# Session Configuration
SESSION_SECRET=your-secret-key-change-in-production
```

### Production Environment

```bash
# Production Redis
REDIS_HOST=redis.production.example.com
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password
REDIS_DB=0

# Enable TLS for production
REDIS_TLS=true

# Session Secret (required)
SESSION_SECRET=generate-a-strong-secret-key
```

## Redis Service Features

### Location

`apps/backend/src/services/redisService.ts`

### Automatic Fallback

The service automatically falls back to in-memory storage when:

- Redis is not installed
- Redis connection fails
- Running in development without `REDIS_ENABLED=true`

### Methods

#### Initialize

```typescript
import { redisService } from "./services/redisService";

// Initialize with custom config
await redisService.initialize({
  host: "localhost",
  port: 6379,
  password: "optional-password",
});
```

#### Get/Set Values

```typescript
// Set value with expiry (in seconds)
await redisService.set("key", "value", 3600); // Expires in 1 hour

// Get value
const value = await redisService.get("key");

// Delete value
await redisService.del("key");
```

#### Check Existence

```typescript
const exists = await redisService.exists("key");
```

#### Set Expiry

```typescript
await redisService.expire("key", 3600); // Expire in 1 hour
```

#### Get Multiple Values

```typescript
const values = await redisService.mget(["key1", "key2", "key3"]);
```

#### Increment Counter

```typescript
const newValue = await redisService.incr("counter");
```

#### Pattern Matching

```typescript
// Get all keys matching pattern
const keys = await redisService.keys("user:*");
```

#### Statistics

```typescript
const stats = redisService.getStats();
// Returns: { connected, usingFallback, inMemoryKeys }
```

## Session Management

### Location

`apps/backend/src/middleware/sessionMiddleware.ts`

### Features

- Redis-backed session store
- Automatic fallback to in-memory store
- Configurable session TTL
- Secure cookie settings

### Usage

The session middleware is automatically configured in `apps/backend/src/index.ts`:

```typescript
import { createSessionMiddleware } from "./middleware/sessionMiddleware";
app.use(createSessionMiddleware());
```

### Session Data Access

```typescript
// In route handlers
app.get("/api/user/profile", (req, res) => {
  if (req.session.userId) {
    // Access session data
    const userId = req.session.userId;
    res.json({ userId });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// Set session data
app.post("/api/auth/login", (req, res) => {
  // After authentication
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ success: true });
});

// Destroy session
app.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});
```

### Session Statistics

```bash
# Get session statistics
curl http://localhost:3000/api/session/stats
```

Response:

```json
{
  "success": true,
  "store": "redis",
  "totalSessions": 5,
  "redisStats": {
    "connected": true,
    "usingFallback": false,
    "inMemoryKeys": 0
  }
}
```

## Development Mode

### Without Redis

The application works perfectly without Redis in development:

```bash
# No Redis configuration needed
npm run dev
```

Output:

```
[middleware] Session middleware configured with Redis support
⚠️ Using in-memory session store (not recommended for production)
```

### With Redis

To use Redis in development:

```bash
# .env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

Output:

```
[middleware] Session middleware configured with Redis support
🔴 Redis client connected
✅ Redis client ready
📦 Using Redis session store
```

## Production Deployment

### Security Best Practices

1. **Use Strong Passwords**

```bash
REDIS_PASSWORD=use-a-very-strong-password-here
```

2. **Enable TLS/SSL**

```bash
REDIS_TLS=true
```

3. **Restrict Network Access**

```bash
# In redis.conf
bind 127.0.0.1 ::1  # Only local connections
protected-mode yes
```

4. **Set Strong Session Secret**

```bash
SESSION_SECRET=$(openssl rand -base64 32)
```

5. **Configure Maxmemory Policy**

```bash
# In redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Multi-Server Setup

For load-balanced deployments:

1. **Centralized Redis Server**

```bash
# Server 1 .env
REDIS_HOST=redis.internal.example.com
REDIS_PORT=6379
REDIS_PASSWORD=shared-password

# Server 2 .env
REDIS_HOST=redis.internal.example.com
REDIS_PORT=6379
REDIS_PASSWORD=shared-password
```

2. **Redis Cluster** (for high availability)

```bash
# Configure Redis Cluster
REDIS_CLUSTER_NODES=redis1:6379,redis2:6379,redis3:6379
```

## Monitoring

### Check Connection Status

```typescript
import { redisService } from "./services/redisService";

if (redisService.isReady()) {
  console.log("Redis is ready");
} else {
  console.log("Using in-memory fallback");
}
```

### Get Statistics

```bash
# Redis statistics
curl http://localhost:3000/api/session/stats

# WebSocket statistics
curl http://localhost:3000/api/ws/stats
```

### Redis CLI Monitoring

```bash
# Monitor all commands
redis-cli monitor

# Check connected clients
redis-cli client list

# Get server info
redis-cli info

# Check memory usage
redis-cli info memory

# View session keys
redis-cli keys "sess:*"
```

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to Redis

```
Redis Client Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**:

1. Check Redis is running: `redis-cli ping`
2. Verify REDIS_HOST and REDIS_PORT in .env
3. Check firewall settings
4. Verify Redis is bound to correct IP: `redis-cli config get bind`

### Memory Issues

**Problem**: Redis out of memory

```
OOM command not allowed when used memory > 'maxmemory'
```

**Solution**:

1. Increase maxmemory in redis.conf
2. Set eviction policy: `maxmemory-policy allkeys-lru`
3. Monitor session count
4. Clean up old sessions

### Session Issues

**Problem**: Sessions not persisting across server restarts

**Solution**:

1. Verify Redis is running
2. Check session TTL configuration
3. Ensure cookies are being sent from frontend
4. Verify CORS credentials: true

### Performance Issues

**Problem**: Slow Redis operations

**Solution**:

1. Monitor slow queries: `redis-cli slowlog get`
2. Check network latency
3. Optimize key patterns
4. Consider Redis pipelining for bulk operations

## Migration from In-Memory to Redis

### Step 1: Install Redis

Follow installation instructions above.

### Step 2: Configure Environment

```bash
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Step 3: Restart Application

```bash
npm run build
npm run start
```

### Step 4: Verify

```bash
# Check logs for Redis connection
# Verify sessions persist across restarts
# Monitor Redis memory usage
```

## Advanced Configuration

### Custom Redis Configuration

```typescript
// apps/backend/src/index.ts
import { redisService } from "./services/redisService";

// Initialize with custom settings
await redisService.initialize({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || "0"),
});
```

### Session Store Options

```typescript
// apps/backend/src/middleware/sessionMiddleware.ts
sessionConfig.store = new RedisStore({
  client: redisClient,
  prefix: "sess:",
  ttl: 86400, // 24 hours
  disableTouch: false, // Enable session updates on activity
});
```

## Performance Optimization

### Connection Pooling

Redis client automatically manages connection pooling.

### Key Patterns

Use consistent key patterns:

```
sess:{sessionId}     # Session data
cache:{resource}:{id} # Cache entries
user:{userId}:*      # User-related data
```

### TTL Best Practices

- Sessions: 24 hours (86400 seconds)
- API Cache: 5-15 minutes (300-900 seconds)
- User Preferences: 7 days (604800 seconds)

## Additional Resources

- [Redis Documentation](https://redis.io/documentation)
- [Redis Best Practices](https://redis.io/topics/optimization)
- [connect-redis Documentation](https://github.com/tj/connect-redis)
- [Session Management Best Practices](https://owasp.org/www-community/vulnerabilities/Session_Management_Cheat_Sheet)
