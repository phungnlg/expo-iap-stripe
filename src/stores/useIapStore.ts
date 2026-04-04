import { create } from 'zustand';
import { iapService } from '../services/IapService';
import { subscriptionManager } from '../services/SubscriptionManager';
import { SubscriptionTier } from '../models/SubscriptionPlan';
import type { SubscriptionPlan } from '../models/SubscriptionPlan';
import { PurchaseSource, PurchaseStatus } from '../models/PurchaseRecord';
import type { PurchaseRecord } from '../models/PurchaseRecord';
interface IapState { isInitialized: boolean; isLoading: boolean; isPurchasing: boolean; error: string | null; initialize: () => Promise<void>; purchaseProduct: (plan: SubscriptionPlan) => Promise<void>; restorePurchases: () => Promise<void>; clearError: () => void; }
export const useIapStore = create<IapState>((set) => ({
  isInitialized: false, isLoading: false, isPurchasing: false, error: null,
  initialize: async () => { try { set({ isLoading: true }); const r = await iapService.initialize(); set({ isInitialized: r, isLoading: false }); } catch (err) { set({ isLoading: false, error: `IAP init failed: ${err}` }); } },
  purchaseProduct: async (plan) => {
    if (plan.tier === SubscriptionTier.Free) return; set({ isPurchasing: true, error: null });
    try { const products = await iapService.querySubscriptions(); const match = products.find((p) => p.id === plan.storeProductId);
      if (match) { await iapService.purchaseSubscription(match.id); } else {
        await new Promise((r) => setTimeout(r, 1000)); const now = new Date(); const expiryMs = plan.tier === SubscriptionTier.Monthly ? 30*24*60*60*1000 : 365*24*60*60*1000;
        const record: PurchaseRecord = { id: `iap_${Date.now()}`, productId: plan.storeProductId ?? plan.id, productName: plan.name, amount: plan.price, currency: 'USD', source: PurchaseSource.AppleIap, status: PurchaseStatus.Completed, purchaseDate: now.toISOString(), expiryDate: new Date(now.getTime()+expiryMs).toISOString(), transactionId: `iap_txn_${Date.now()}` };
        await subscriptionManager.activateSubscription({ record, tier: plan.tier });
      } set({ isPurchasing: false }); } catch (err) { set({ isPurchasing: false, error: `Purchase failed: ${err}` }); }
  },
  restorePurchases: async () => { set({ isLoading: true, error: null }); try { await iapService.restorePurchases(); set({ isLoading: false }); } catch (err) { set({ isLoading: false, error: `Restore failed: ${err}` }); } },
  clearError: () => set({ error: null }),
}));
