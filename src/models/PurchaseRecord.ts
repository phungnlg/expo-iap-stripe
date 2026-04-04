export enum PurchaseSource {
  AppleIap = 'appleIap', GooglePlay = 'googlePlay', Stripe = 'stripe',
  ApplePay = 'applePay', GooglePay = 'googlePay',
}

export enum PurchaseStatus {
  Pending = 'pending', Completed = 'completed', Failed = 'failed',
  Refunded = 'refunded', Cancelled = 'cancelled',
}

export interface PurchaseRecord {
  id: string;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  source: PurchaseSource;
  status: PurchaseStatus;
  purchaseDate: string;
  expiryDate?: string;
  transactionId?: string;
  receiptData?: string;
}

export function isPurchaseActive(record: PurchaseRecord): boolean {
  if (record.status !== PurchaseStatus.Completed) return false;
  if (!record.expiryDate) return true;
  return new Date(record.expiryDate) > new Date();
}

export function sourceLabel(source: PurchaseSource): string {
  switch (source) {
    case PurchaseSource.AppleIap: return 'Apple IAP';
    case PurchaseSource.GooglePlay: return 'Google Play';
    case PurchaseSource.Stripe: return 'Stripe';
    case PurchaseSource.ApplePay: return 'Apple Pay';
    case PurchaseSource.GooglePay: return 'Google Pay';
  }
}

export function statusLabel(status: PurchaseStatus): string {
  switch (status) {
    case PurchaseStatus.Pending: return 'Pending';
    case PurchaseStatus.Completed: return 'Completed';
    case PurchaseStatus.Failed: return 'Failed';
    case PurchaseStatus.Refunded: return 'Refunded';
    case PurchaseStatus.Cancelled: return 'Cancelled';
  }
}
