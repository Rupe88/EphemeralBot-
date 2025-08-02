# 🚀 EphemeralBot API Documentation

## 📊 **API Health Check**

```bash
GET /health
Response: {"status":"OK","timestamp":"2025-08-02T16:37:30.582Z","uptime":281.562617379}
```

## 🔐 **Authentication Endpoints**

### Discord OAuth Login

```bash
GET /api/auth/login
Description: Redirects to Discord OAuth
Response: Redirects to Discord authorization
```

### OAuth Callback

```bash
GET /api/auth/callback?code=xxx
Description: Exchanges Discord code for JWT token
Response: Redirects to dashboard with token
```

### Verify Token

```bash
GET /api/auth/verify
Headers: Authorization: Bearer <jwt_token>
Response: {"valid": true, "discordId": "123456789"}
```

### Refresh Discord Token

```bash
POST /api/auth/refresh
Body: {"refreshToken": "discord_refresh_token"}
Response: New Discord tokens
```

## 🏠 **Server Management Endpoints**

### Get User's Discord Servers

```bash
GET /api/servers
Headers: Authorization: Bearer <jwt_token>
Response: [
  {
    "id": "server_id",
    "name": "Server Name",
    "icon": "icon_url",
    "botPresent": true,
    "subscription": "free|premium",
    "stats": {
      "totalMessagesTracked": 150,
      "totalMessagesDeleted": 45,
      "channelsWithRules": 2
    }
  }
]
```

### Get Channel Rules for Server

```bash
GET /api/servers/{serverId}/channels
Headers: Authorization: Bearer <jwt_token>
Response: [
  {
    "_id": "rule_id",
    "serverId": "server_id",
    "channelId": "channel_id",
    "channelName": "general",
    "expirationHours": 24,
    "isActive": true,
    "stats": {
      "messagesTracked": 75,
      "messagesDeleted": 25
    }
  }
]
```

### Create Channel Rule

```bash
POST /api/servers/{serverId}/channels
Headers: Authorization: Bearer <jwt_token>
Body: {
  "channelId": "channel_id",
  "channelName": "general",
  "expirationHours": 24
}
Response: Created rule object
```

### Delete Channel Rule

```bash
DELETE /api/servers/{serverId}/channels/{ruleId}
Headers: Authorization: Bearer <jwt_token>
Response: {"success": true}
```

### Get Server Statistics

```bash
GET /api/servers/{serverId}/stats
Headers: Authorization: Bearer <jwt_token>
Response: {
  "totalMessagesTracked": 150,
  "totalMessagesDeleted": 45,
  "channelsWithRules": 2
}
```

## 💰 **Payment Endpoints**

### Create Payment Session

```bash
POST /api/payments/create
Headers: Authorization: Bearer <jwt_token>
Body: {"serverId": "server_id"}
Response: {
  "checkout_url": "https://dodopay.com/checkout/xxx",
  "payment_id": "payment_id"
}
```

### Get Payment Status

```bash
GET /api/payments/status/{paymentId}
Headers: Authorization: Bearer <jwt_token>
Response: Payment status from DodoPay
```

### Get Subscription Status

```bash
GET /api/payments/subscription/{serverId}
Headers: Authorization: Bearer <jwt_token>
Response: {
  "subscription": "free|premium",
  "subscriptionExpiry": "2025-09-02T16:37:30.582Z",
  "isExpired": false,
  "isActive": true
}
```

### Cancel Subscription

```bash
POST /api/payments/cancel/{serverId}
Headers: Authorization: Bearer <jwt_token>
Response: {"success": true}
```

## 🔗 **Webhook Endpoints**

### DodoPay Webhook

```bash
POST /api/webhooks/dodo
Body: {
  "event": "payment.succeeded|payment.failed|subscription.cancelled",
  "data": {
    "amount": 600,
    "metadata": {"serverId": "server_id"}
  }
}
Response: {"success": true}
```

### Webhook Health Check

```bash
GET /api/webhooks/health
Response: {"status": "OK", "timestamp": "2025-08-02T16:37:30.582Z"}
```

## 🎯 **Discord Bot Commands**

### Setup Auto-Expiration

```bash
/expire setup #channel 24
Description: Set up auto-deletion for 24 hours
Response: Success embed with confirmation
```

### Check Status

```bash
/expire status
Description: Show all active expiration rules
Response: Embed with list of active rules
```

### Stop Auto-Expiration

```bash
/expire stop #channel
Description: Stop auto-deletion for a channel
Response: Confirmation embed
```

## 📋 **Feature Comparison**

### 🆓 **Free Tier Features**

- ✅ **1 channel per server** (auto-deletion)
- ✅ **All expiration times** (1h, 6h, 24h, 7d)
- ✅ **Basic Discord commands** (/expire setup, status, stop)
- ✅ **Web dashboard** (view servers and rules)
- ✅ **Discord OAuth login**
- ✅ **Message tracking and deletion**
- ✅ **Basic analytics** (messages tracked/deleted)

### ⭐ **Premium Tier Features** ($6/month)

- ✅ **Unlimited channels** per server
- ✅ **Advanced dashboard** with detailed analytics
- ✅ **Pin protection** (don't delete pinned messages)
- ✅ **Role & user exclusions** (skip certain roles/users)
- ✅ **Priority support**
- ✅ **Advanced statistics** (per-channel breakdown)
- ✅ **Custom expiration times** (coming soon)
- ✅ **Bulk channel management** (coming soon)
- ✅ **Webhook notifications** (coming soon)

## 🔧 **Technical Features**

### **Backend Infrastructure**

- ✅ **Node.js + Express.js + TypeScript**
- ✅ **MongoDB Atlas** with proper indexing
- ✅ **Discord.js v14** bot integration
- ✅ **JWT authentication** with Discord OAuth
- ✅ **Rate limiting** and security middleware
- ✅ **Error logging** and monitoring
- ✅ **Message scheduling** with node-cron
- ✅ **Payment processing** with DodoPay
- ✅ **Webhook handling** for payment events

### **Database Schema**

- ✅ **Server collection** (subscription status, stats)
- ✅ **Channel rules** (expiration settings, analytics)
- ✅ **Tracked messages** (message lifecycle, deletion tracking)
- ✅ **User sessions** (Discord OAuth tokens)

### **Security Features**

- ✅ **CORS protection** with origin validation
- ✅ **Rate limiting** (100 requests per 15 minutes)
- ✅ **JWT token verification**
- ✅ **Input validation** and sanitization
- ✅ **Error handling** without exposing internals

## 🚀 **Deployment Status**

### **Current Implementation**

- ✅ **Backend API** (all endpoints working)
- ✅ **Discord Bot** (commands registered and functional)
- ✅ **Database models** (properly indexed)
- ✅ **Authentication system** (Discord OAuth + JWT)
- ✅ **Payment integration** (DodoPay webhooks)
- ✅ **Message scheduling** (auto-deletion working)

### **Ready for Production**

- ✅ **Health checks** and monitoring
- ✅ **Graceful shutdown** handling
- ✅ **Environment configuration**
- ✅ **Error logging** and debugging
- ✅ **API documentation** (this file)

## 📊 **API Testing Commands**

```bash
# Health check
curl http://localhost:3001/health

# Test with JWT token (after login)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/servers

# Test payment creation
curl -X POST -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serverId":"test_server"}' \
  http://localhost:3001/api/payments/create
```

## 🎯 **Revenue Model**

- **Free Tier**: 1 channel per server (conversion funnel)
- **Premium Tier**: $6/month unlimited channels
- **Target**: 20% free-to-premium conversion rate
- **Projected Revenue**: $600+/month by month 3

---

**EphemeralBot - Snapchat for Discord** 🚀
_Keep your Discord clean and organized_
