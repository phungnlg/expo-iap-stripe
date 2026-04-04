import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Platform } from 'react-native';
import { usePurchaseStore } from '../stores/purchaseStore';
import { sourceLabel, statusLabel, PurchaseStatus } from '../models/PurchaseRecord';
import type { PurchaseRecord } from '../models/PurchaseRecord';

export function PurchaseHistoryScreen() {
  const { history, isLoading, loadHistory } = usePurchaseStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const totalSpent = history.filter((r) => r.status === PurchaseStatus.Completed).reduce((sum, r) => sum + r.amount, 0);
  const activeCount = history.filter((r) => r.status === PurchaseStatus.Completed && (!r.expiryDate || new Date(r.expiryDate) > new Date())).length;

  function statusColor(status: PurchaseStatus): string {
    switch (status) {
      case PurchaseStatus.Completed: return '#16a34a';
      case PurchaseStatus.Pending: return '#f59e0b';
      case PurchaseStatus.Failed: return '#ef4444';
      case PurchaseStatus.Refunded: return '#6366f1';
      case PurchaseStatus.Cancelled: return '#9ca3af';
    }
  }

  function renderItem({ item }: { item: PurchaseRecord }) {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName}>{item.productName}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>{statusLabel(item.status)}</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>${item.amount.toFixed(2)} {item.currency}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Source</Text>
          <Text style={styles.value}>{sourceLabel(item.source)}</Text>
        </View>
        <View style={styles.cardRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date(item.purchaseDate).toLocaleDateString()}</Text>
        </View>
        {item.expiryDate && (
          <View style={styles.cardRow}>
            <Text style={styles.label}>Expires</Text>
            <Text style={styles.value}>{new Date(item.expiryDate).toLocaleDateString()}</Text>
          </View>
        )}
        {item.transactionId && (
          <Text style={styles.receiptId}>ID: {item.transactionId}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{activeCount}</Text>
          <Text style={styles.summaryLabel}>Active</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{history.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>${totalSpent.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Spent</Text>
        </View>
      </View>

      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadHistory} tintColor="#4F46E5" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{'\u2261'}</Text>
            <Text style={styles.emptyTitle}>No Purchases Yet</Text>
            <Text style={styles.emptyMsg}>Your purchase history will appear here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  summaryCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '700', color: '#4F46E5' },
  summaryLabel: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: '#e5e7eb' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  label: { fontSize: 13, color: '#6b7280' },
  value: { fontSize: 13, color: '#1f2937', fontWeight: '500' },
  receiptId: { fontSize: 11, color: '#9ca3af', marginTop: 8, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, color: '#d1d5db', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 },
  emptyMsg: { fontSize: 14, color: '#9ca3af' },
});
