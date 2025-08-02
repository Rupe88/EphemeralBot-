import express from 'express';
import { Server } from '../models/Server';
import { ErrorLogger } from '../services/ErrorLogger';

const router = express.Router();

// DodoPay webhook handler
router.post('/dodo', async (req, res) => {
  try {
    const { event, data } = req.body;

    console.log(`📦 Webhook received: ${event}`, data);

    if (event === 'payment.succeeded') {
      const { serverId } = data.metadata;

      // Upgrade server to premium
      await Server.findOneAndUpdate(
        { serverId },
        {
          subscription: 'premium',
          subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        }
      );

      await ErrorLogger.logPaymentEvent(
        'payment_succeeded',
        serverId,
        data.amount,
        true
      );
      console.log(`✅ Server ${serverId} upgraded to premium`);
    } else if (event === 'payment.failed') {
      const { serverId } = data.metadata;
      await ErrorLogger.logPaymentEvent(
        'payment_failed',
        serverId,
        data.amount,
        false
      );
      console.log(`❌ Payment failed for server ${serverId}`);
    } else if (event === 'subscription.cancelled') {
      const { serverId } = data.metadata;

      // Downgrade server to free
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
      console.log(`🔄 Server ${serverId} downgraded to free`);
    }

    res.json({ success: true });
  } catch (error) {
    await ErrorLogger.logError(error as Error, 'webhooks.dodo', {
      body: req.body,
    });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check for webhooks
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
