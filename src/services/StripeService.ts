import { initPaymentSheet, presentPaymentSheet, confirmPaymentSheetPayment } from '@stripe/stripe-react-native';
export interface StripePaymentResult { success: boolean; paymentIntentId?: string; error?: string; }
class StripeService {
  async initializePaymentSheet(amount: number, currency: string, planId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const clientSecret = `pi_mock_${Date.now()}_secret_${planId}`;
      const { error } = await initPaymentSheet({ merchantDisplayName: 'IAP Stripe POC', paymentIntentClientSecret: clientSecret, allowsDelayedPaymentMethods: true, defaultBillingDetails: { name: 'Test User' }, applePay: { merchantCountryCode: 'US' }, googlePay: { merchantCountryCode: 'US', testEnv: true } });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed to initialize payment' }; }
  }
  async presentPaymentSheet(): Promise<StripePaymentResult> {
    try { const { error } = await presentPaymentSheet(); if (error) return { success: false, error: error.code === 'Canceled' ? 'Payment cancelled' : error.message }; return { success: true, paymentIntentId: `pi_completed_${Date.now()}` }; } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Payment failed' }; }
  }
  async confirmPayment(): Promise<StripePaymentResult> {
    try { const { error } = await confirmPaymentSheetPayment(); if (error) return { success: false, error: error.message }; return { success: true, paymentIntentId: `pi_confirmed_${Date.now()}` }; } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Confirmation failed' }; }
  }
  async simulateCardPayment(_amount: number, _currency: string): Promise<StripePaymentResult> { await new Promise((resolve) => setTimeout(resolve, 1500)); return { success: true, paymentIntentId: `pi_sim_${Date.now()}` }; }
}
export const stripeService = new StripeService();
