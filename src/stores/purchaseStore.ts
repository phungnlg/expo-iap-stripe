import { create } from 'zustand';
import { PurchaseRecord } from '../models/PurchaseRecord';
import { subscriptionManager } from '../services/SubscriptionManager';
interface PurchaseState { history: PurchaseRecord[]; isLoading: boolean; loadHistory: () => Promise<void>; }
export const usePurchaseStore = create<PurchaseState>((set) => ({
  history: [], isLoading: false,
  loadHistory: async () => { set({ isLoading: true }); const records = await subscriptionManager.getPurchaseHistory(); set({ history: records, isLoading: false }); },
}));
