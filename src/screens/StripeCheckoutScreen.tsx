import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, Alert } from 'react-native';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { PaymentMethodCard } from '../components/PaymentMethodCard';
import { nativePayService } from '../services/NativePayService';
import { stripeService } from '../services/StripeService';
import { subscriptionManager } from '../services/SubscriptionManager';
import { formattedPrice, billingPeriod } from '../models/SubscriptionPlan';
import type { SubscriptionPlan } from '../models/SubscriptionPlan';
import { PurchaseSource, PurchaseStatus } from '../models/PurchaseRecord';
import type { PurchaseRecord } from '../models/PurchaseRecord';
import { PaymentMethodType, ALL_PAYMENT_METHODS } from '../models/PaymentMethod';
import type { PaymentMethod } from '../models/PaymentMethod';

interface StripeCheckoutScreenProps {
  plan: SubscriptionPlan;
  onComplete: () => void;
}

type PayStep = 'select' | 'processing' | 'success' | 'error';

export function StripeCheckoutScreen({ plan, onComplete }: StripeCheckoutScreenProps) {
  const [step, setStep] = useState<PayStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [applePayAvailable, setApplePayAvailable] = useState(false);
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);

  useEffect(() => {
    async function checkPay() {
      setApplePayAvailable(await nativePayService.isApplePayAvailable());
      setGooglePayAvailable(await nativePayService.isGooglePayAvailable());
    }
    checkPay();
  }, []);

  const quickPayMethods = ALL_PAYMENT_METHODS.filter((m) => {
    if (m.type === PaymentMethodType.ApplePay) return applePayAvailable;
    if (m.type === PaymentMethodType.GooglePay) return googlePayAvailable;
    return false;
  });

  async function handleQuickPay(method: PaymentMethod) {
    setStep('processing');
    try {
      if (method.type === PaymentMethodType.ApplePay) {
        const result = await nativePayService.payWithApplePay(plan.price, 'USD', plan.name);
        if (!result.success) throw new Error(result.error ?? 'Apple Pay failed');
      } else {
        const result = await nativePayService.payWithGooglePay(plan.price, 'USD', plan.name);
        if (!result.success) throw new Error(result.error ?? 'Google Pay failed');
      }
      await activateSubscription(method.type === PaymentMethodType.ApplePay ? PurchaseSource.ApplePay : PurchaseSource.GooglePay);
      setStep('success');
    } catch (err) {
      setErrorMsg(`${err}`);
      setStep('error');
    }
  }

  async function handleCardPayment() {
    if (cardNumber.length < 16 || expiry.length < 5 || cvc.length < 3) {
      Alert.alert('Invalid Card', 'Please enter valid card details.');
      return;
    }
    setStep('processing');
    try {
      const intent = await stripeService.createPaymentIntent(plan.price, 'USD');
      await stripeService.confirmPayment(intent.clientSecret);
      await activateSubscription(PurchaseSource.Stripe);
      setStep('success');
    } catch (err) {
      setErrorMsg(`${err}`);
      setStep('error');
    }
  }

  async function activateSubscription(source: PurchaseSource) {
    const now = new Date();
    const expiryMs = plan.tier === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    const record: PurchaseRecord = {
      id: `stripe_${Date.now()}`, productId: plan.storeProductId ?? plan.id, productName: plan.name,
      amount: plan.price, currency: 'USD', source,
      status: PurchaseStatus.Completed, purchaseDate: now.toISOString(),
      expiryDate: new Date(now.getTime() + expiryMs).toISOString(),
      transactionId: `stripe_txn_${Date.now()}`,
    };
    await subscriptionManager.activateSubscription({ record, tier: plan.tier });
  }

  if (step === 'processing') {
    return <View style={styles.center}><LoadingOverlay visible={true} message="Processing payment..." /></View>;
  }

  if (step === 'success') {
    return (
      <View style={styles.center}>
        <View style={styles.resultCard}>
          <Text style={styles.successIcon}>{'\u2713'}</Text>
          <Text style={styles.resultTitle}>Payment Successful!</Text>
          <Text style={styles.resultMsg}>{plan.name} is now active.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={onComplete}><Text style={styles.doneBtnText}>Done</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'error') {
    return (
      <View style={styles.center}>
        <View style={styles.resultCard}>
          <Text style={styles.errorIcon}>{'\u2717'}</Text>
          <Text style={styles.resultTitle}>Payment Failed</Text>
          <Text style={styles.resultMsg}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setStep('select')}><Text style={styles.retryBtnText}>Try Again</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total</Text>
        <Text style={styles.summaryPrice}>{formattedPrice(plan)}{billingPeriod(plan)}</Text>
      </View>

      {quickPayMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Pay</Text>
          {quickPayMethods.map((m) => (
            <TouchableOpacity key={m.type} style={styles.quickPayBtn} onPress={() => handleQuickPay(m)}>
              <Text style={styles.quickPayText}>{m.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput style={styles.input} placeholder="4242 4242 4242 4242" keyboardType="number-pad" maxLength={19} value={cardNumber} onChangeText={setCardNumber} />
        </View>
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Expiry</Text>
            <TextInput style={styles.input} placeholder="MM/YY" keyboardType="number-pad" maxLength={5} value={expiry} onChangeText={setExpiry} />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>CVC</Text>
            <TextInput style={styles.input} placeholder="123" keyboardType="number-pad" maxLength={4} secureTextEntry value={cvc} onChangeText={setCvc} />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.payButton} onPress={handleCardPayment}>
        <Text style={styles.payButtonText}>Pay {formattedPrice(plan)}</Text>
      </TouchableOpacity>

      <Text style={styles.secure}>Payments are processed securely via Stripe. Your card details are never stored on our servers.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: 24 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryLabel: { fontSize: 15, color: '#6b7280' },
  summaryPrice: { fontSize: 22, fontWeight: '800', color: '#4F46E5' },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  quickPayBtn: { backgroundColor: '#1f2937', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  quickPayText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  orText: { marginHorizontal: 16, fontSize: 13, color: '#9ca3af' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1f2937' },
  inputRow: { flexDirection: 'row' },
  payButton: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  payButtonText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secure: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 16, marginHorizontal: 16, lineHeight: 16 },
  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 },
  successIcon: { fontSize: 48, color: '#10b981', marginBottom: 16 },
  errorIcon: { fontSize: 48, color: '#ef4444', marginBottom: 16 },
  resultTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  resultMsg: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  doneBtn: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  doneBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  retryBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  retryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
