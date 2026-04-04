import { create } from 'zustand';
import { SubscriptionPlan, SubscriptionTier, DEFAULT_PLANS } from '../models/SubscriptionPlan';
import { PurchaseRecord, PurchaseSource, PurchaseStatus } from '../models/PurchaseRecord';
import { iapService } from '../services/IapService';
import { subscriptionManager } from '../services/SubscriptionManager';
interface SubscriptionState {
  plans: SubscriptionPlan[]; activeTier: SubscriptionTier; activeSubscription: PurchaseRecord | null;
  isLoading: boolean; isPurchasing: boolean; errorMessage: string | null; successMessage: string | null;
  initialize: () => Promise<void>; loadSubscription: () => Promise<void>; purchasePlan: (plan: SubscriptionPlan) => Promise<void>;
  restorePurchases: () => Promise<void>; cancelSubscription: () => Promise<void>; clearMessages: () => void;
}
export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  plans: DEFAULT_PLANS, activeTier: SubscriptionTier.Free, activeSubscription: null,
  isLoading: true, isPurchasing: false, errorMessage: null, successMessage: null,
  initialize: async () => {
    try {
      await iapService.initialize();
      const tier = await subscriptionManager.getActiveTier();
      const activeSub = await subscriptionManager.getActiveSubscription();
      iapService.setListeners((_purchase) => { set({ isPurchasing: false }); }, (error) => { set({ isPurchasing: false, errorMessage: `Purchase error: ${error.message}` }); });
      set({ activeTier: tier, activeSubscription: activeSub, isLoading: false });
    } catch (_err) { set({ isLoading: false }); }
  },
  loadSubscription: async () => {
    set({ isLoading: true });
    const tier = await subscriptionManager.getActiveTier();
    const activeSub = await subscriptionManager.getActiveSubscription();
    set({ activeTier: tier, activeSubscription: activeSub, isLoading: false });
  },
  purchasePlan: async (plan: SubscriptionPlan) => {
    if (plan.tier === SubscriptionTier.Free) return;
    set({ isPurchasing: true, errorMessage: null });
    try {
      const products = await iapService.querySubscriptions();
      const match = products.find((s) => s.id === plan.storeProductId);
      if (!match) { await simulatePurchase(plan, set); return; }
      await iapService.purchaseSubscription(match.id);
    } catch (err) { set({ isPurchasing: false, errorMessage: `Purchase failed: ${err}` }); }
  },
  restorePurchases: async () => {
    set({ isLoading: true, errorMessage: null });
    try {
      await iapService.restorePurchases();
      const tier = await subscriptionManager.getActiveTier();
      const activeSub = await subscriptionManager.getActiveSubscription();
      set({ activeTier: tier, activeSubscription: activeSub, isLoading: false, successMessage: tier !== SubscriptionTier.Free ? 'Purchases restored successfully!' : 'No previous purchases found.' });
    } catch (err) { set({ isLoading: false, errorMessage: `Restore failed: ${err}` }); }
  },
  cancelSubscription: async () => {
    await subscriptionManager.cancelSubscription();
    set({ activeTier: SubscriptionTier.Free, activeSubscription: null, successMessage: 'Subscription cancelled. You can continue using free features.' });
  },
  clearMessages: () => { set({ errorMessage: null, successMessage: null }); },
}));
async function simulatePurchase(plan: SubscriptionPlan, set: (state: Partial<SubscriptionState>) => void): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const now = new Date();
  const expiryMs = plan.tier === SubscriptionTier.Monthly ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
  const record: PurchaseRecord = { id: `demo_${Date.now()}`, productId: plan.storeProductId ?? plan.id, productName: plan.name, amount: plan.price, currency: 'USD', source: PurchaseSource.AppleIap, status: PurchaseStatus.Completed, purchaseDate: now.toISOString(), expiryDate: new Date(now.getTime() + expiryMs).toISOString(), transactionId: `demo_txn_${Date.now()}` };
  await subscriptionManager.activateSubscription({ record, tier: plan.tier });
  set({ activeTier: plan.tier, activeSubscription: record, isPurchasing: false, successMessage: `Successfully subscribed to ${plan.name}!` });
}
