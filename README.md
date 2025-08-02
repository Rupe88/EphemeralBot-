# 🚀 EphemeralBot - Snapchat for Discord

Auto-delete Discord messages after 1h, 6h, 24h, or 7 days. Keep your Discord clean and organized without the clutter.

## ✨ Features

- **Auto-delete messages** after set time periods (1h, 6h, 24h, 7d)
- **Simple setup** with `/expire setup #channel 24` command
- **Web dashboard** for managing rules and viewing analytics
- **Free tier** with 1 channel, **Premium** with unlimited channels ($6/month)
- **Discord OAuth** authentication - no separate accounts needed
- **Real-time tracking** of message deletion statistics

## 🏗️ Architecture

```
Frontend (Next.js + Vercel)
    ↓ REST API
Backend (Node.js + Railway)
    ↓
MongoDB Atlas (Database)
    ↓
Discord Bot (Message Tracking)
    ↓
Node-cron (Scheduled Deletion)
```

## 🛠️ Tech Stack

### Backend

- **Node.js** + **Express.js** + **TypeScript**
- **Discord.js v14** for bot functionality
- **MongoDB** with Mongoose ODM
- **node-cron** for scheduled message deletion
- **JWT** for authentication
- **Railway** for hosting

### Frontend

- **Next.js 14** + **TypeScript** + **Tailwind CSS**
- **Discord OAuth** integration
- **Vercel** for hosting
- **Lucide React** for icons

### Payment

- **DodoPay** integration for $6/month subscriptions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Discord Application (for bot token and OAuth)
- Railway account (for backend hosting)
- Vercel account (for frontend hosting)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ephemeralbot.git
cd ephemeralbot
```

### 2. Install Dependencies

```bash
npm run install:all
```

### 3. Environment Setup

#### Backend (.env)

```bash
cd backend
cp env.example .env
```

Edit `.env` with your values:

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ephemeral-bot
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
DODO_SECRET_KEY=your_dodo_payments_secret_key
FRONTEND_URL=https://ephemeralbot.com
NODE_ENV=production
PORT=3001
```

#### Frontend (.env.local)

```bash
cd frontend
cp env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_DISCORD_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_FRONTEND_URL=https://ephemeralbot.com
```

### 4. Development

```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend  # Backend on port 3001
npm run dev:frontend # Frontend on port 3000
```

### 5. Discord Bot Setup

1. Create a Discord Application at https://discord.com/developers/applications
2. Create a bot and get the token
3. Set up OAuth2 with redirect URI: `https://ephemeralbot.com/api/auth/callback`
4. Add bot to your server with permissions:
   - Manage Messages
   - Read Message History
   - Send Messages
   - Use Slash Commands

## 📦 Deployment

### Backend (Railway)

```bash
cd backend
npm install -g @railway/cli
railway login
railway new ephemeralbot-backend
railway add mongodb  # Add managed MongoDB
railway variables:set DISCORD_TOKEN=your_token
railway variables:set MONGODB_URI=mongodb_connection_string
railway deploy
```

### Frontend (Vercel)

```bash
cd frontend
npm install -g vercel
vercel --prod
# Set environment variables in Vercel dashboard
```

## 🎯 Usage

### Discord Commands

- `/expire setup #channel 24` - Set up auto-deletion for 24 hours
- `/expire status` - Show all active rules
- `/expire stop #channel` - Stop auto-deletion for a channel

### Web Dashboard

1. Visit your dashboard URL
2. Login with Discord OAuth
3. Select a server to manage
4. Add/remove channel rules
5. View analytics and statistics

## 💰 Pricing

- **Free**: 1 channel per server
- **Premium ($6/month)**: Unlimited channels + advanced features

## 📊 Database Schema

### Servers

```typescript
{
  serverId: string;
  serverName: string;
  subscription: 'free' | 'premium';
  stats: {
    totalMessagesTracked: number;
    totalMessagesDeleted: number;
    channelsWithRules: number;
  }
}
```

### Channel Rules

```typescript
{
  serverId: string;
  channelId: string;
  expirationHours: number; // 1, 6, 24, 168
  isActive: boolean;
  stats: {
    messagesTracked: number;
    messagesDeleted: number;
  }
}
```

### Tracked Messages

```typescript
{
  messageId: string;
  serverId: string;
  channelId: string;
  expiresAt: Date;
  isDeleted: boolean;
}
```

## 🔧 API Endpoints

### Authentication

- `GET /api/auth/login` - Discord OAuth login
- `GET /api/auth/callback` - OAuth callback
- `GET /api/auth/verify` - Verify JWT token

### Servers

- `GET /api/servers` - Get user's Discord servers
- `GET /api/servers/:id/channels` - Get channel rules
- `POST /api/servers/:id/channels` - Create channel rule
- `DELETE /api/servers/:id/channels/:ruleId` - Delete channel rule

### Payments

- `POST /api/payments/create` - Create payment session
- `GET /api/payments/subscription/:serverId` - Get subscription status

### Webhooks

- `POST /api/webhooks/dodo` - DodoPay webhook handler

## 🎨 Customization

### Styling

The frontend uses Tailwind CSS with Discord-inspired colors:

- Primary: `#5865F2` (Discord Blurple)
- Success: `#57F287` (Discord Green)
- Warning: `#FEE75C` (Discord Yellow)
- Danger: `#ED4245` (Discord Red)

### Bot Commands

Add new commands in `backend/src/bot/commands/` and register them in `register.ts`.

## 🚨 Error Handling

The application includes comprehensive error logging:

- Discord API errors
- Database connection issues
- Payment processing failures
- Message deletion failures

## 📈 Monitoring

### Health Checks

- Backend: `GET /health`
- Webhooks: `GET /api/webhooks/health`

### Logging

- All errors logged to console
- Bot actions tracked
- Payment events logged
- User actions monitored

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Discord**: Join our support server
- **Email**: support@ephemeralbot.com
- **Documentation**: https://docs.ephemeralbot.com

## 🎯 Roadmap

- [ ] Redis integration for better performance
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Webhook notifications
- [ ] Custom expiration times
- [ ] Bulk channel management
- [ ] API rate limiting
- [ ] Multi-language support

---

**Built with ❤️ for the Discord community**
