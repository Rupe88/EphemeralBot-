export class ErrorLogger {
  static async logError(
    error: Error,
    context: string,
    metadata?: any
  ): Promise<void> {
    const errorLog = {
      context,
      message: error.message,
      stack: error.stack,
      metadata,
      timestamp: new Date().toISOString(),
      level: 'ERROR',
    };

    console.error(`[${context}] ${error.message}`, {
      stack: error.stack,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // In production, you could send to external service like Sentry
    // await Sentry.captureException(error, { extra: metadata });

    // Or save to database for monitoring
    // await ErrorLog.create(errorLog);
  }

  static async logBotAction(
    action: string,
    serverId: string,
    success: boolean,
    metadata?: any
  ): Promise<void> {
    const actionLog = {
      action,
      serverId,
      success,
      metadata,
      timestamp: new Date().toISOString(),
    };

    console.log(`[BOT] ${action} - ${success ? 'SUCCESS' : 'FAILED'}`, {
      serverId,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Save to database for analytics
    // await BotActionLog.create(actionLog);
  }

  static async logPaymentEvent(
    event: string,
    serverId: string,
    amount: number,
    success: boolean
  ): Promise<void> {
    const paymentLog = {
      event,
      serverId,
      amount,
      success,
      timestamp: new Date().toISOString(),
    };

    console.log(`[PAYMENT] ${event} - ${success ? 'SUCCESS' : 'FAILED'}`, {
      serverId,
      amount,
      timestamp: new Date().toISOString(),
    });

    // Save to database for revenue tracking
    // await PaymentLog.create(paymentLog);
  }

  static async logUserAction(
    action: string,
    discordId: string,
    serverId?: string,
    metadata?: any
  ): Promise<void> {
    const userLog = {
      action,
      discordId,
      serverId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    console.log(`[USER] ${action}`, {
      discordId,
      serverId,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // Save to database for user analytics
    // await UserActionLog.create(userLog);
  }
}
