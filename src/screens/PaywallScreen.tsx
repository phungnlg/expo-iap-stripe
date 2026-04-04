import React, { useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GradientHeader } from '../components/GradientHeader';
import { PlanCard } from '../components/PlanCard';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { SubscriptionTier, DEFAULT_PLANS } from '../models/SubscriptionPlan';
import type { SubscriptionPlan } from '../models/SubscriptionPlan';
interface PaywallScreenProps { onSelectPlan: (plan: SubscriptionPlan) => void; }
export function PaywallScreen({ onSelectPlan }: PaywallScreenProps) {
  const { activeTier, isLoading, initialize, restorePurchases, successMessage, errorMessage, clearMessages } = useSubscriptionStore();
  useEffect(() => { initialize(); }, []);
  useEffect(() => { if (successMessage || errorMessage) { const t = setTimeout(clearMessages, 3000); return () => clearTimeout(t); } }, [successMessage, errorMessage]);
  const paidPlans = DEFAULT_PLANS.filter((p) => p.tier !== SubscriptionTier.Free);
  return (
    <View style={st.container}>
      <LoadingOverlay visible={isLoading} message="Loading..." />
      <ScrollView style={st.scroll} showsVerticalScrollIndicator={false}>
        <GradientHeader title="Choose Your Plan" subtitle="Unlock premium features today" />
        {(successMessage || errorMessage) && <View style={[st.banner, errorMessage ? st.errBanner : st.okBanner]}><Text style={st.bannerText}>{successMessage ?? errorMessage}</Text></View>}
        <View style={st.plans}>{paidPlans.map((plan) => <PlanCard key={plan.id} plan={plan} isActive={activeTier === plan.tier} onSelect={onSelectPlan} />)}</View>
        <TouchableOpacity style={st.restoreBtn} onPress={restorePurchases}><Text style={st.restoreText}>Restore Purchases</Text></TouchableOpacity>
        <Text style={st.legal}>Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. Payment will be charged to your account at confirmation of purchase.</Text>
      </ScrollView>
    </View>
  );
}
const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' }, scroll: { flex: 1 }, plans: { paddingTop: 24 },
  banner: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10 }, okBanner: { backgroundColor: '#dcfce7' }, errBanner: { backgroundColor: '#fee2e2' },
  bannerText: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#1f2937' },
  restoreBtn: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 }, restoreText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
  legal: { fontSize: 11, color: '#9ca3af', textAlign: 'center', marginHorizontal: 32, marginTop: 12, marginBottom: 32, lineHeight: 16 },
});
