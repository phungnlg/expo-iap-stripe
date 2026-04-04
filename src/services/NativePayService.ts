import { Platform } from 'react-native';

export interface NativePayResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

class NativePayService {
  async isApplePayAvailable(): Promise<boolean> {
    return Platform.OS === 'ios';
  }

  async isGooglePayAvailable(): Promise<boolean> {
    return Platform.OS === 'android';
  }

  async payWithApplePay(amount: number, currency: string, label: string): Promise<NativePayResult> {
    if (Platform.OS !== 'ios') return { success: false, error: 'Apple Pay is only available on iOS' };
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log(`[NativePayService] Apple Pay simulated: ${currency} ${amount} for ${label}`);
    return { success: true, transactionId: `apple_pay_${Date.now()}` };
  }

  async payWithGooglePay(amount: number, currency: string, label: string): Promise<NativePayResult> {
    if (Platform.OS !== 'android') return { success: false, error: 'Google Pay is only available on Android' };
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log(`[NativePayService] Google Pay simulated: ${currency} ${amount} for ${label}`);
    return { success: true, transactionId: `google_pay_${Date.now()}` };
  }
}

export const nativePayService = new NativePayService();
