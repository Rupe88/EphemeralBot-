# EphemeralBot Frontend

Modern React dashboard for managing Discord message expiration rules.

## Features

- 🎨 Modern UI with Framer Motion animations
- 🔐 Discord OAuth authentication
- 📊 Real-time server statistics
- ⚙️ Channel rule management
- 💳 DodoPay integration for premium subscriptions
- 📱 Responsive design

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Create environment file:**

   ```bash
   cp .env.local.example .env.local
   ```

3. **Configure environment variables:**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id_here
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Pages

- `/` - Landing page with features and pricing
- `/login` - Discord OAuth authentication
- `/dashboard` - Main dashboard (requires authentication)

## Components

- `Navigation` - Header with navigation and user menu
- `Hero` - Animated hero section
- `PricingSection` - Pricing plans with DodoPay integration
- `AnimatedButton` - Reusable animated button component

## Authentication Flow

1. User clicks "Continue with Discord" on login page
2. Redirected to Discord OAuth
3. User authorizes the application
4. Redirected back to `/login?code=...`
5. Backend exchanges code for tokens
6. JWT token stored in localStorage
7. User redirected to dashboard

## API Integration

The frontend integrates with the backend API for:

- User authentication and profile
- Server listing and management
- Channel rule creation/deletion
- Payment processing
- Subscription management

## Styling

- Tailwind CSS for utility-first styling
- Custom Discord-themed color palette
- Framer Motion for animations
- GSAP for advanced animations
- Responsive design for all screen sizes
