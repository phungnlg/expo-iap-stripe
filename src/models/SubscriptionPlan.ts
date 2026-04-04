export enum SubscriptionTier {
  Free = 'free',
  Monthly = 'monthly',
  Yearly = 'yearly',
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  tier: SubscriptionTier;
  storeProductId?: string;
  currencySymbol: string;
  features: string[];
}

export function formattedPrice(plan: SubscriptionPlan): string {
  if (plan.tier === SubscriptionTier.Free) return 'Free';
  return `${plan.currencySymbol}${plan.price.toFixed(2)}`;
}

export function billingPeriod(plan: SubscriptionPlan): string {
  switch (plan.tier) {
    case SubscriptionTier.Free: return '';
    case SubscriptionTier.Monthly: return '/month';
    case SubscriptionTier.Yearly: return '/year';
  }
}

export function monthlyEquivalent(plan: SubscriptionPlan): number {
  if (plan.tier === SubscriptionTier.Yearly) return plan.price / 12;
  return plan.price;
}

export function savingsPercent(plan: SubscriptionPlan): number {
  if (plan.tier !== SubscriptionTier.Yearly) return 0;
  const monthlyPrice = 9.99;
  return Math.round((1 - monthlyEquivalent(plan) / monthlyPrice) * 100);
}

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'free', name: 'Free', description: 'Basic access with limited features',
    price: 0, tier: SubscriptionTier.Free, currencySymbol: '$',
    features: ['Basic content access', 'Limited to 5 items per day', 'Community support'],
  },
  {
    id: 'monthly_premium', name: 'Premium Monthly', description: 'Full access, billed monthly',
    price: 9.99, tier: SubscriptionTier.Monthly,
    storeProductId: 'com.tranthienhau.expo_iap_stripe.monthly', currencySymbol: '$',
    features: ['Unlimited content access', 'No ads', 'Priority support', 'Offline downloads', 'Advanced analytics'],
  },
  {
    id: 'yearly_premium', name: 'Premium Yearly', description: 'Full access, billed annually - best value',
    price: 79.99, tier: SubscriptionTier.Yearly,
    storeProductId: 'com.tranthienhau.expo_iap_stripe.yearly', currencySymbol: '$',
    features: ['Everything in Monthly', 'Save 33% vs monthly', 'Exclusive yearly content', 'Early access to new features', 'Premium badge'],
  },
];
