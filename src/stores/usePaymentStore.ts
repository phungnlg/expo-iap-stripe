import { create } from 'zustand';
import { ALL_PAYMENT_METHODS } from '../models/PaymentMethod';
import type { PaymentMethod } from '../models/PaymentMethod';
interface PaymentState { paymentMethods: PaymentMethod[]; selectedMethod: PaymentMethod | null; isLoading: boolean; error: string | null; loadPaymentMethods: () => void; selectPaymentMethod: (m: PaymentMethod) => void; clearError: () => void; }
export const usePaymentStore = create<PaymentState>((set) => ({
  paymentMethods: [], selectedMethod: null, isLoading: false, error: null,
  loadPaymentMethods: () => { set({ isLoading: true }); const m = ALL_PAYMENT_METHODS.filter((x) => x.isAvailable); set({ paymentMethods: m, selectedMethod: m[0] ?? null, isLoading: false }); },
  selectPaymentMethod: (method) => set({ selectedMethod: method }),
  clearError: () => set({ error: null }),
}));
