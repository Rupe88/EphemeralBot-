export interface PaymentRequest {
  serverId: string;
  tier: 'premium';
  amount: number;
  currency: string;
}

export interface PaymentResponse {
  checkout_url: string;
  payment_id: string;
  status: 'pending' | 'success' | 'failed';
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  created_at: string;
  metadata?: {
    serverId: string;
    tier: string;
  };
}

export class PaymentService {
  private static API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  /**
   * Create a new payment session
   */
  static async createPayment(
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${this.API_BASE}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serverId: request.serverId,
          tier: request.tier,
          amount: request.amount,
          currency: request.currency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment creation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment creation error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Payment creation failed'
      );
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${this.API_BASE}/api/payments/status/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get payment status');
      }

      return await response.json();
    } catch (error) {
      console.error('Payment status error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to get payment status'
      );
    }
  }

  /**
   * Get subscription status for a server
   */
  static async getSubscriptionStatus(serverId: string): Promise<{
    subscription: 'free' | 'premium';
    subscriptionExpiry?: string;
    isExpired: boolean;
    isActive: boolean;
  }> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${this.API_BASE}/api/payments/subscription/${serverId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get subscription status');
      }

      return await response.json();
    } catch (error) {
      console.error('Subscription status error:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to get subscription status'
      );
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(
    serverId: string
  ): Promise<{ success: boolean }> {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${this.API_BASE}/api/payments/cancel/${serverId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to cancel subscription'
      );
    }
  }

  /**
   * Handle payment success callback
   */
  static handlePaymentSuccess(paymentId: string): void {
    // Store payment success in localStorage for tracking
    const paymentHistory = JSON.parse(
      localStorage.getItem('paymentHistory') || '[]'
    );
    paymentHistory.push({
      paymentId,
      status: 'success',
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));

    // Redirect to dashboard with success message
    window.location.href = '/dashboard?payment=success';
  }

  /**
   * Handle payment failure callback
   */
  static handlePaymentFailure(paymentId: string, error?: string): void {
    // Store payment failure in localStorage for tracking
    const paymentHistory = JSON.parse(
      localStorage.getItem('paymentHistory') || '[]'
    );
    paymentHistory.push({
      paymentId,
      status: 'failed',
      error,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('paymentHistory', JSON.stringify(paymentHistory));

    // Redirect to pricing with error message
    window.location.href =
      '/pricing?payment=failed&error=' +
      encodeURIComponent(error || 'Payment failed');
  }

  /**
   * Format currency
   */
  static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100); // Convert cents to dollars
  }

  /**
   * Validate payment request
   */
  static validatePaymentRequest(request: PaymentRequest): string[] {
    const errors: string[] = [];

    if (!request.serverId) {
      errors.push('Server ID is required');
    }

    if (!request.tier || !['premium'].includes(request.tier)) {
      errors.push('Valid tier is required');
    }

    if (!request.amount || request.amount <= 0) {
      errors.push('Valid amount is required');
    }

    if (!request.currency || !['USD'].includes(request.currency)) {
      errors.push('Valid currency is required');
    }

    return errors;
  }
}
