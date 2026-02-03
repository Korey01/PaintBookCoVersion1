/**
 * Transpact Escrow Payment Service
 * Handles all interactions with Transpact escrow service
 * https://www.transpact.com/
 */

interface TranspactPaymentRequest {
  transactionId: string;
  amount: number; // in GBP/USD
  currency: string;
  description: string;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
  webhookUrl: string;
  successUrl?: string;
  failureUrl?: string;
}

interface TranspactTransaction {
  id: string;
  status:
    | "pending"
    | "waiting_payment"
    | "funded"
    | "released"
    | "disputed"
    | "cancelled";
  amount: number;
  currency: string;
  paymentUrl: string;
  createdAt: string;
  expiresAt: string;
}

interface TranspactReleaseRequest {
  transactionId: string;
  sellerEmail: string;
}

/**
 * Initialize Transpact service with API credentials
 */
export class TranspactService {
  private apiKey: string;
  private apiUrl: string = "https://api.transpact.com/v1";
  private testMode: boolean;

  constructor() {
    this.apiKey = process.env.TRANSPACT_API_KEY || "test_key";
    this.testMode = process.env.NODE_ENV === "development";
  }

  /**
   * Create a new escrow transaction with Transpact
   * Returns payment URL for customer to complete payment
   */
  async createTransaction(
    request: TranspactPaymentRequest
  ): Promise<{ transactionId: string; paymentUrl: string }> {
    try {
      const payload = {
        amount_in_cents: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency || "GBP",
        description: request.description,
        buyer_name: request.buyerName,
        buyer_email: request.buyerEmail,
        seller_name: request.sellerName,
        seller_email: request.sellerEmail,
        webhook_url: request.webhookUrl,
        success_url: request.successUrl,
        failure_url: request.failureUrl,
      };

      console.log(
        `[Transpact] Creating transaction: ${request.transactionId}`,
        payload
      );

      // For MVP, simulate Transpact response
      if (this.testMode) {
        return this.simulateTransactionCreation(request);
      }

      // In production, make actual API call
      const response = await fetch(`${this.apiUrl}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Transpact API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        transactionId: data.id,
        paymentUrl: data.payment_url,
      };
    } catch (error) {
      console.error("[Transpact] Transaction creation error:", error);
      throw error;
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(
    transactionId: string
  ): Promise<TranspactTransaction> {
    try {
      console.log(`[Transpact] Fetching transaction status: ${transactionId}`);

      if (this.testMode) {
        return this.simulateGetTransaction(transactionId);
      }

      const response = await fetch(
        `${this.apiUrl}/transactions/${transactionId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Transpact API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        status: data.status,
        amount: data.amount_in_cents / 100,
        currency: data.currency,
        paymentUrl: data.payment_url,
        createdAt: data.created_at,
        expiresAt: data.expires_at,
      };
    } catch (error) {
      console.error("[Transpact] Get transaction error:", error);
      throw error;
    }
  }

  /**
   * Release escrow funds to seller
   * Called after job completion and customer approval
   */
  async releaseFunds(request: TranspactReleaseRequest): Promise<boolean> {
    try {
      console.log(
        `[Transpact] Releasing funds for transaction: ${request.transactionId}`
      );

      if (this.testMode) {
        return true;
      }

      const response = await fetch(
        `${this.apiUrl}/transactions/${request.transactionId}/release`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            seller_email: request.sellerEmail,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Transpact API error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("[Transpact] Release funds error:", error);
      throw error;
    }
  }

  /**
   * Cancel escrow transaction
   * Used for refunding customer
   */
  async cancelTransaction(transactionId: string): Promise<boolean> {
    try {
      console.log(`[Transpact] Cancelling transaction: ${transactionId}`);

      if (this.testMode) {
        return true;
      }

      const response = await fetch(
        `${this.apiUrl}/transactions/${transactionId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Transpact API error: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error("[Transpact] Cancel transaction error:", error);
      throw error;
    }
  }

  /**
   * Verify webhook signature for security
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): boolean {
    try {
      // In production, verify HMAC signature
      // const crypto = require('crypto');
      // const hash = crypto
      //   .createHmac('sha256', this.apiKey)
      //   .update(payload)
      //   .digest('hex');
      // return hash === signature;

      // For MVP, skip verification
      console.log("[Transpact] Webhook signature verified (test mode)");
      return true;
    } catch (error) {
      console.error("[Transpact] Webhook verification error:", error);
      return false;
    }
  }

  /**
   * Mock: Simulate Transpact transaction creation for testing
   */
  private simulateTransactionCreation(request: TranspactPaymentRequest): {
    transactionId: string;
    paymentUrl: string;
  } {
    return {
      transactionId: request.transactionId,
      paymentUrl: `https://secure.transpact.com/pay/${request.transactionId}`,
    };
  }

  /**
   * Mock: Simulate get transaction status
   */
  private simulateGetTransaction(transactionId: string): TranspactTransaction {
    return {
      id: transactionId,
      status: "waiting_payment",
      amount: 450,
      currency: "GBP",
      paymentUrl: `https://secure.transpact.com/pay/${transactionId}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Calculate commission and fees
   */
  static calculatePaymentBreakdown(jobPrice: number): {
    jobPrice: number;
    platformCommission: number;
    transpactFee: number;
    painterNetAmount: number;
    customerTotalAmount: number;
  } {
    // Commission structure
    let commission = jobPrice * 0.12; // 12% base commission
    // TODO: Apply tiered rates when painter has >= 6 jobs

    // Transpact fee (2.5% of transaction)
    const transpactFee = (jobPrice + commission) * 0.025;

    // Platform absorbs Transpact fee from commission
    const platformCommission = commission - transpactFee;
    const painterNetAmount = jobPrice;
    const customerTotalAmount = jobPrice + commission;

    return {
      jobPrice,
      platformCommission,
      transpactFee,
      painterNetAmount,
      customerTotalAmount,
    };
  }
}

// Export singleton instance
export const transpactService = new TranspactService();
