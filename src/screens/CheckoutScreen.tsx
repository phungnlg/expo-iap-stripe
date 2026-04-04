import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { formattedPrice, billingPeriod, SubscriptionTier } from '../models/SubscriptionPlan';
import type { SubscriptionPlan } from '../models/SubscriptionPlan';
interface CheckoutScreenProps { plan: SubscriptionPlan; onGoToStripe: (plan: SubscriptionPlan) => void; onComplete: () => void; }
type CheckoutStep = 'confirm' | 'processing' | 'success' | 'error';
export function CheckoutScreen({ plan, onGoToStripe, onComplete }: CheckoutScreenProps) {
  const [step, setStep] = useState<CheckoutStep>('confirm');
  const [errorMsg, setErrorMsg] = useState('');
  const { purchasePlan } = useSubscriptionStore();
  async function handleIapPurchase() {
    setStep('processing');
    try { await purchasePlan(plan); setStep('success'); } catch (err) { setErrorMsg(`${err}`); setStep('error'); }
  }
  if (step === 'processing') return <View style={st.center}><LoadingOverlay visible={true} message="Processing your purchase..." /></View>;
  if (step === 'success') return (<View style={st.center}><View style={st.resultCard}><Text style={st.okIcon}>{'\u2713'}</Text><Text style={st.resultTitle}>Purchase Complete!</Text><Text style={st.resultMsg}>You are now subscribed to {plan.name}.</Text><TouchableOpacity style={st.doneBtn} onPress={onComplete}><Text style={st.doneBtnTxt}>Done</Text></TouchableOpacity></View></View>);
  if (step === 'error') return (<View style={st.center}><View style={st.resultCard}><Text style={st.errIcon}>{'\u2717'}</Text><Text style={st.resultTitle}>Purchase Failed</Text><Text style={st.resultMsg}>{errorMsg || 'Something went wrong.'}</Text><TouchableOpacity style={st.retryBtn} onPress={() => setStep('confirm')}><Text style={st.retryTxt}>Try Again</Text></TouchableOpacity></View></View>);
  return (
    <ScrollView style={st.container} contentContainerStyle={st.content}>
      <View style={st.orderCard}><Text style={st.orderTitle}>Order Summary</Text><View style={st.orderRow}><Text style={st.orderLabel}>{plan.name}</Text><Text style={st.orderVal}>{formattedPrice(plan)}{billingPeriod(plan)}</Text></View><View style={st.divider} /><View style={st.orderRow}><Text style={st.totalLabel}>Total</Text><Text style={st.totalVal}>{formattedPrice(plan)}</Text></View></View>
      <Text style={st.secTitle}>Payment Method</Text>
      <TouchableOpacity style={st.iapBtn} onPress={handleIapPurchase}><Text style={st.iapIcon}>{Platform.OS === 'ios' ? '\uF8FF' : '\u25B6'}</Text><Text style={st.iapTxt}>{Platform.OS === 'ios' ? 'Purchase with Apple' : 'Purchase with Google Play'}</Text></TouchableOpacity>
      <View style={st.orRow}><View style={st.orLine} /><Text style={st.orTxt}>OR</Text><View style={st.orLine} /></View>
      <TouchableOpacity style={st.stripeBtn} onPress={() => onGoToStripe(plan)}><Text style={st.stripeTxt}>Pay with Card (Stripe)</Text></TouchableOpacity>
    </ScrollView>
  );
}
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' }, content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: 24 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  orderTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 16 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  orderLabel: { fontSize: 15, color: '#374151' }, orderVal: { fontSize: 15, color: '#374151', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 8 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#1f2937' }, totalVal: { fontSize: 20, fontWeight: '800', color: '#4F46E5' },
  secTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 12 },
  iapBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1f2937', borderRadius: 12, paddingVertical: 16, marginBottom: 16 },
  iapIcon: { fontSize: 20, color: '#fff', marginRight: 8 }, iapTxt: { fontSize: 16, fontWeight: '600', color: '#fff' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 }, orLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' }, orTxt: { marginHorizontal: 16, fontSize: 13, color: '#9ca3af', fontWeight: '500' },
  stripeBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center' }, stripeTxt: { fontSize: 16, fontWeight: '600', color: '#fff' },
  resultCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 },
  okIcon: { fontSize: 48, color: '#10b981', marginBottom: 16 }, errIcon: { fontSize: 48, color: '#ef4444', marginBottom: 16 },
  resultTitle: { fontSize: 22, fontWeight: '700', color: '#1f2937', marginBottom: 8 }, resultMsg: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  doneBtn: { backgroundColor: '#10b981', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 }, doneBtnTxt: { fontSize: 16, fontWeight: '600', color: '#fff' },
  retryBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 }, retryTxt: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
