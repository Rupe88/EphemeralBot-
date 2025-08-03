import express from 'express';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';
import { ErrorLogger } from '../services/ErrorLogger';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Discord OAuth login
router.get('/login', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  const redirectUri = `${process.env.FRONTEND_URL}/api/auth/callback`;
  const scope = 'identify guilds';

  const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(scope)}`;

  res.redirect(authUrl);
});

// Discord OAuth callback
router.get('/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  try {
    // Exchange code for Discord tokens
    const tokens = await AuthService.exchangeCodeForTokens(code);
    // Get Discord user info
    const discordUser = await AuthService.getDiscordUser(tokens.access_token);
    // Save user in DB
    const user = await AuthService.saveUser(discordUser, tokens);
    // Generate JWT for your app
    const jwt = AuthService.generateToken(user.discordId);

    // Return JWT and user info to frontend
    return res.json({
      token: jwt,
      user: {
        discordId: user.discordId,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(401).json({ error: 'auth_failed' });
  }
});

// Get current user info
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = AuthService.verifyToken(token);
    const user = await User.findOne({ discordId: decoded.discordId });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
    });
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'auth.me');
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Refresh Discord token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const tokens = await AuthService.refreshDiscordToken(refreshToken);

    res.json(tokens);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'auth.refresh');
    res.status(400).json({ error: 'Failed to refresh token' });
  }
});

export default router;
