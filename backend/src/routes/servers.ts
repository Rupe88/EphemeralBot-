import express from 'express';
import { AuthService } from '../services/AuthService';
import { User } from '../models/User';
import { Server } from '../models/Server';
import { ChannelRule } from '../models/ChannelRule';
import { ErrorLogger } from '../services/ErrorLogger';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: { discordId: string };
    }
  }
}

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user's Discord servers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { discordId } = req.user!;

    // Get user from database
    const user = await User.findOne({ discordId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's Discord servers with admin perms
    const userGuilds = await AuthService.getUserGuilds(user.accessToken);
    const adminGuilds = userGuilds.filter((guild) =>
      AuthService.hasAdminPermissions(guild)
    );

    // Get our bot data for these servers
    const botServers = await Server.find({
      serverId: { $in: adminGuilds.map((g) => g.id) },
    });

    // Combine Discord + DB data
    const enrichedServers = adminGuilds.map((guild) => {
      const botServer = botServers.find((s) => s.serverId === guild.id);
      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        botPresent: !!botServer,
        subscription: botServer?.subscription || 'free',
        stats: botServer?.stats || {
          totalMessagesTracked: 0,
          totalMessagesDeleted: 0,
          channelsWithRules: 0,
        },
      };
    });

    res.json(enrichedServers);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'servers.get', {
      discordId: req.user?.discordId,
    });
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

// Get channel rules for a server
router.get('/:serverId/channels', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;

    const rules = await ChannelRule.find({
      serverId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(rules);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'servers.channels', {
      serverId: req.params.serverId,
    });
    res.status(500).json({ error: 'Failed to fetch channel rules' });
  }
});

// Create channel rule
router.post('/:serverId/channels', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;
    const { channelId, channelName, expirationHours } = req.body;

    // Validate expiration hours
    if (![1, 6, 24, 168].includes(expirationHours)) {
      return res.status(400).json({ error: 'Invalid expiration hours' });
    }

    // Check subscription limits
    const server = await Server.findOne({ serverId });
    if (!server || server.subscription === 'free') {
      const existingRules = await ChannelRule.countDocuments({
        serverId,
        isActive: true,
      });
      if (existingRules >= 1) {
        return res.status(402).json({ error: 'Free tier limit reached' });
      }
    }

    // Create rule
    const rule = await ChannelRule.findOneAndUpdate(
      { serverId, channelId },
      {
        serverId,
        channelId,
        channelName,
        expirationHours,
        isActive: true,
        createdAt: new Date(),
        createdBy: req.user!.discordId,
      },
      { upsert: true, new: true }
    );

    res.json(rule);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'servers.channels.create', {
      serverId: req.params.serverId,
      body: req.body,
    });
    res.status(500).json({ error: 'Failed to create channel rule' });
  }
});

// Delete channel rule
router.delete(
  '/:serverId/channels/:ruleId',
  authenticateToken,
  async (req, res) => {
    try {
      const { serverId, ruleId } = req.params;

      const rule = await ChannelRule.findOneAndUpdate(
        { _id: ruleId, serverId },
        { isActive: false },
        { new: true }
      );

      if (!rule) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      res.json({ success: true });
    } catch (error) {
      await ErrorLogger.logError(error as Error, 'servers.channels.delete', {
        serverId: req.params.serverId,
        ruleId: req.params.ruleId,
      });
      res.status(500).json({ error: 'Failed to delete channel rule' });
    }
  }
);

// Get server statistics
router.get('/:serverId/stats', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;

    const server = await Server.findOne({ serverId });
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    res.json(server.stats);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'servers.stats', {
      serverId: req.params.serverId,
    });
    res.status(500).json({ error: 'Failed to fetch server stats' });
  }
});

export default router;
