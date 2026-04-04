import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionTier } from '../models/SubscriptionPlan';
import { PurchaseRecord, isPurchaseActive } from '../models/PurchaseRecord';
const KEYS = { ACTIVE_TIER: '@sub_active_tier', ACTIVE_SUBSCRIPTION: '@sub_active_record', PURCHASE_HISTORY: '@sub_purchase_history' } as const;
interface ActivateParams { record: PurchaseRecord; tier: SubscriptionTier; }
class SubscriptionManager {
  async getActiveTier(): Promise<SubscriptionTier> { try { const raw = await AsyncStorage.getItem(KEYS.ACTIVE_TIER); if (!raw) return SubscriptionTier.Free; return raw as SubscriptionTier; } catch { return SubscriptionTier.Free; } }
  async getActiveSubscription(): Promise<PurchaseRecord | null> { try { const raw = await AsyncStorage.getItem(KEYS.ACTIVE_SUBSCRIPTION); if (!raw) return null; const record: PurchaseRecord = JSON.parse(raw); if (!isPurchaseActive(record)) { await this.cancelSubscription(); return null; } return record; } catch { return null; } }
  async activateSubscription(params: ActivateParams): Promise<void> { await AsyncStorage.setItem(KEYS.ACTIVE_TIER, params.tier); await AsyncStorage.setItem(KEYS.ACTIVE_SUBSCRIPTION, JSON.stringify(params.record)); await this.addToHistory(params.record); }
  async cancelSubscription(): Promise<void> { await AsyncStorage.setItem(KEYS.ACTIVE_TIER, SubscriptionTier.Free); await AsyncStorage.removeItem(KEYS.ACTIVE_SUBSCRIPTION); }
  async getPurchaseHistory(): Promise<PurchaseRecord[]> { try { const raw = await AsyncStorage.getItem(KEYS.PURCHASE_HISTORY); if (!raw) return []; return JSON.parse(raw) as PurchaseRecord[]; } catch { return []; } }
  async addToHistory(record: PurchaseRecord): Promise<void> { const h = await this.getPurchaseHistory(); h.unshift(record); await AsyncStorage.setItem(KEYS.PURCHASE_HISTORY, JSON.stringify(h)); }
  async clearAll(): Promise<void> { await AsyncStorage.multiRemove(Object.values(KEYS)); }
}
export const subscriptionManager = new SubscriptionManager();
