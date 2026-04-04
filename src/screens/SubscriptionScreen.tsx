import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { FeatureRow } from '../components/FeatureRow';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { SubscriptionTier, DEFAULT_PLANS, formattedPrice, billingPeriod } from '../models/SubscriptionPlan';

interface SubscriptionScreenProps {
  onNavigateToPaywall: () => void;
}

export function SubscriptionScreen({ onNavigateToPaywall }: SubscriptionScreenProps) {
  const { activeTier, activeSubscription, isLoading, loadSubscription, cancelSubscription, successMessage, errorMessage, clearMessages } = useSubscriptionStore();

  useEffect(() => {
    loadSubscription();
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(clearMessages, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const activePlan = DEFAULT_PLANS.find((p) => p.tier === activeTier) ?? DEFAULT_PLANS[0];
  const isFree = activeTier === SubscriptionTier.Free;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LoadingOverlay visible={isLoading} message="Loading..." />

      {(successMessage || errorMessage) && (
        <View style={[styles.banner, errorMessage ? styles.errorBanner : styles.successBanner]}>
          <Text style={styles.bannerText}>{successMessage ?? errorMessage}</Text>
        </View>
      )}

      <View style={styles.planCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{activePlan.name}</Text>
          <View style={[styles.statusBadge, isFree ? styles.freeBadge : styles.activeBadge]}>
            <Text style={[styles.statusText, isFree ? styles.freeText : styles.activeText]}>
              {isFree ? 'Free' : 'Active'}
            </Text>
          </View>
        </View>
        <Text style={styles.planPrice}>{formattedPrice(activePlan)}{billingPeriod(activePlan)}</Text>
        {activeSubscription?.expiryDate && (
          <Text style={styles.expiryText}>
            Renews: {new Date(activeSubscription.expiryDate).toLocaleDateString()}
          </Text>
        )}
        <View style={styles.features}>
          {activePlan.features.map((f, i) => (
            <FeatureRow key={i} feature={f} included={true} />
          ))}
        </View>
      </View>

      {isFree ? (
        <TouchableOpacity style={styles.upgradeBtn} onPress={onNavigateToPaywall}>
          <Text style={styles.upgradeBtnText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <TouchableOpacity style={styles.manageBtn} onPress={onNavigateToPaywall}>
            <Text style={styles.manageBtnText}>Change Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelSubscription}>
            <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  banner: { padding: 12, borderRadius: 10, marginBottom: 16 },
  successBanner: { backgroundColor: '#dcfce7' },
  errorBanner: { backgroundColor: '#fee2e2' },
  bannerText: { fontSize: 14, fontWeight: '500', textAlign: 'center', color: '#1f2937' },
  planCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  planName: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  freeBadge: { backgroundColor: '#f3f4f6' },
  activeBadge: { backgroundColor: '#dcfce7' },
  statusText: { fontSize: 12, fontWeight: '600' },
  freeText: { color: '#6b7280' },
  activeText: { color: '#16a34a' },
  planPrice: { fontSize: 28, fontWeight: '800', color: '#4F46E5', marginBottom: 4 },
  expiryText: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  features: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginTop: 8 },
  upgradeBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  upgradeBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  manageBtn: { backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  manageBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  cancelBtn: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ef4444' },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});
