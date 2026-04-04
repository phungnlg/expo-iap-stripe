export enum PaymentMethodType {
  AppleIap = 'appleIap', GooglePlay = 'googlePlay', Stripe = 'stripe',
  ApplePay = 'applePay', GooglePay = 'googlePay',
}

export interface PaymentMethod {
  type: PaymentMethodType;
  label: string;
  icon: string;
  isAvailable: boolean;
  lastFourDigits?: string;
}

export const ALL_PAYMENT_METHODS: PaymentMethod[] = [
  { type: PaymentMethodType.AppleIap, label: 'Apple In-App Purchase', icon: 'apple', isAvailable: true },
  { type: PaymentMethodType.GooglePlay, label: 'Google Play Billing', icon: 'shop', isAvailable: true },
  { type: PaymentMethodType.ApplePay, label: 'Apple Pay', icon: 'apple', isAvailable: true },
  { type: PaymentMethodType.GooglePay, label: 'Google Pay', icon: 'g-pay', isAvailable: true },
  { type: PaymentMethodType.Stripe, label: 'Credit / Debit Card', icon: 'credit-card', isAvailable: true },
];
