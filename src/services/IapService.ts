import { Platform } from 'react-native';
import {
  initConnection, endConnection, purchaseUpdatedListener, purchaseErrorListener,
  fetchProducts, requestPurchase, getAvailablePurchases, finishTransaction,
} from 'react-native-iap';
import type { Purchase, PurchaseError, ProductOrSubscription, EventSubscription } from 'react-native-iap';

const SUBSCRIPTION_SKUS = ['com.tranthienhau.expo_iap_stripe.monthly', 'com.tranthienhau.expo_iap_stripe.yearly'];

class IapService {
  private purchaseUpdateSub: EventSubscription | null = null;
  private purchaseErrorSub: EventSubscription | null = null;
  private onPurchaseUpdate?: (purchase: Purchase) => void;
  private onPurchaseError?: (error: PurchaseError) => void;

  async initialize(): Promise<boolean> {
    try {
      await initConnection();
      console.log('[IapService] Connection initialized');
      this.purchaseUpdateSub = purchaseUpdatedListener((purchase: Purchase) => { console.log('[IapService] Purchase update:', purchase.productId); this.onPurchaseUpdate?.(purchase); });
      this.purchaseErrorSub = purchaseErrorListener((error: PurchaseError) => { console.log('[IapService] Purchase error:', error.message); this.onPurchaseError?.(error); });
      return true;
    } catch (err) { console.log('[IapService] Init error:', err); return false; }
  }

  setListeners(onUpdate: (purchase: Purchase) => void, onError: (error: PurchaseError) => void): void {
    this.onPurchaseUpdate = onUpdate;
    this.onPurchaseError = onError;
  }

  async querySubscriptions(): Promise<ProductOrSubscription[]> {
    try {
      const products = await fetchProducts({ skus: SUBSCRIPTION_SKUS, type: 'subs' });
      console.log(`[IapService] Found ${products?.length ?? 0} subscriptions`);
      return products ?? [];
    } catch (err) { console.log('[IapService] Query error:', err); return []; }
  }

  async purchaseSubscription(sku: string): Promise<void> {
    try {
      if (Platform.OS === 'ios') { await requestPurchase({ type: 'subs', request: { apple: { sku } } }); }
      else { await requestPurchase({ type: 'subs', request: { google: { skus: [sku] } } }); }
      console.log('[IapService] Purchase initiated:', sku);
    } catch (err) { console.log('[IapService] Purchase error:', err); throw err; }
  }

  async restorePurchases(): Promise<Purchase[]> {
    try {
      const purchases = await getAvailablePurchases();
      console.log('[IapService] Restored purchases:', purchases?.length ?? 0);
      return purchases ?? [];
    } catch (err) { console.log('[IapService] Restore error:', err); return []; }
  }

  async finishPurchase(purchase: Purchase, isConsumable: boolean = false): Promise<void> {
    try { await finishTransaction({ purchase, isConsumable }); console.log('[IapService] Transaction finished:', purchase.productId); }
    catch (err) { console.log('[IapService] Finish transaction error:', err); }
  }

  dispose(): void { this.purchaseUpdateSub?.remove(); this.purchaseErrorSub?.remove(); endConnection(); console.log('[IapService] Disposed'); }
}

export const iapService = new IapService();
