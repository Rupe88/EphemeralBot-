import express from 'express';
import axios from 'axios';
import { AuthService } from '../services/AuthService';
import { Server } from '../models/Server';
import { ErrorLogger } from '../services/ErrorLogger';

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
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create payment session
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.body;

    if (!serverId) {
      return res.status(400).json({ error: 'Server ID required' });
    }

    // Verify server exists and user has access
    const server = await Server.findOne({ serverId });
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    const paymentData = {
      amount: 600, // $6.00 in cents
      currency: 'USD',
      product_name: 'EphemeralBot Premium',
      success_url: `${process.env.FRONTEND_URL}/dashboard?payment=success&server=${serverId}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?payment=cancelled&server=${serverId}`,
      metadata: {
        serverId,
        discordId: req.user!.discordId,
      },
    };

    const response = await axios.post(
      'https://api.dodopayments.com/v1/payments',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${process.env.DODO_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { checkout_url, payment_id } = response.data;

    // Log payment creation
    await ErrorLogger.logPaymentEvent('payment_created', serverId, 600, true);

    res.json({
      checkout_url,
      payment_id,
    });
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'payments.create', {
      serverId: req.body.serverId,
      discordId: req.user?.discordId,
    });
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Get payment status
router.get('/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const response = await axios.get(
      `https://api.dodopayments.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.DODO_SECRET_KEY}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'payments.status', {
      paymentId: req.params.paymentId,
    });
    res.status(500).json({ error: 'Failed to get payment status' });
  }
});

// Get subscription status
router.get('/subscription/:serverId', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;

    const server = await Server.findOne({ serverId });
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    const isExpired =
      server.subscriptionExpiry && server.subscriptionExpiry < new Date();

    res.json({
      subscription: server.subscription,
      subscriptionExpiry: server.subscriptionExpiry,
      isExpired,
      isActive: server.subscription === 'premium' && !isExpired,
    });
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'payments.subscription', {
      serverId: req.params.serverId,
    });
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
});

// Cancel subscription
router.post('/cancel/:serverId', authenticateToken, async (req, res) => {
  try {
    const { serverId } = req.params;

    const server = await Server.findOne({ serverId });
    if (!server) {
      return res.status(404).json({ error: 'Server not found' });
    }

    // Update server to free tier
    await Server.findOneAndUpdate(
      { serverId },
      {
        subscription: 'free',
        subscriptionExpiry: null,
      }
    );

    await ErrorLogger.logPaymentEvent(
      'subscription_cancelled',
      serverId,
      0,
      true
    );

    res.json({ success: true });
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'payments.cancel', {
      serverId: req.params.serverId,
    });
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

export default router;
