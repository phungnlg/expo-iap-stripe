import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { PaywallScreen } from '../screens/PaywallScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { PurchaseHistoryScreen } from '../screens/PurchaseHistoryScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { StripeCheckoutScreen } from '../screens/StripeCheckoutScreen';
import type { SubscriptionPlan } from '../models/SubscriptionPlan';

type Screen = { name: 'tabs' } | { name: 'checkout'; plan: SubscriptionPlan } | { name: 'stripe-checkout'; plan: SubscriptionPlan };
const TABS = [{ key: 'plans', label: 'Plans', icon: '\u2605' }, { key: 'sub', label: 'My Plan', icon: '\u2663' }, { key: 'history', label: 'History', icon: '\u2261' }];

export function AppNavigator() {
  const [tab, setTab] = useState(0);
  const [stack, setStack] = useState<Screen[]>([{ name: 'tabs' }]);
  const current = stack[stack.length - 1];
  function push(s: Screen) { setStack((prev) => [...prev, s]); }
  function pop() { setStack((prev) => prev.length <= 1 ? prev : prev.slice(0, -1)); }
  function popToRoot() { setStack([{ name: 'tabs' }]); }

  function renderScreen() {
    if (current.name === 'checkout') {
      return (<View style={styles.sc}><Header title="Checkout" onBack={pop} /><CheckoutScreen plan={current.plan} onGoToStripe={(p) => push({ name: 'stripe-checkout', plan: p })} onComplete={popToRoot} /></View>);
    }
    if (current.name === 'stripe-checkout') {
      return (<View style={styles.sc}><Header title="Card Payment" onBack={pop} /><StripeCheckoutScreen plan={current.plan} onComplete={popToRoot} /></View>);
    }
    return (
      <View style={styles.sc}>
        <View style={{ flex: 1 }}>
          {tab === 0 && <PaywallScreen onSelectPlan={(p) => push({ name: 'checkout', plan: p })} />}
          {tab === 1 && <><Header title="My Subscription" /><SubscriptionScreen onNavigateToPaywall={() => setTab(0)} /></>}
          {tab === 2 && <><Header title="Payment History" /><PurchaseHistoryScreen /></>}
        </View>
        <View style={styles.tabBar}>
          {TABS.map((t, i) => { const active = tab === i; return (<TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(i)}><Text style={[styles.tabIcon, active && styles.tabIconActive]}>{t.icon}</Text><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text></TouchableOpacity>); })}
        </View>
      </View>
    );
  }
  return (<SafeAreaView style={styles.safe}><StatusBar barStyle="dark-content" />{renderScreen()}</SafeAreaView>);
}

function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  return (<View style={styles.header}>{onBack ? <TouchableOpacity onPress={onBack} style={styles.backBtn}><Text style={styles.backText}>{'\u2039'} Back</Text></TouchableOpacity> : <View style={styles.spacer} />}<Text style={styles.headerTitle}>{title}</Text><View style={styles.spacer} /></View>);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  sc: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f9fafb', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: '#1f2937', textAlign: 'center' },
  backBtn: { paddingVertical: 4, paddingHorizontal: 8, width: 80 },
  backText: { fontSize: 16, color: '#4F46E5' },
  spacer: { width: 80 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8 },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 20, color: '#9ca3af', marginBottom: 2 },
  tabIconActive: { color: '#4F46E5' },
  tabLabel: { fontSize: 11, color: '#9ca3af' },
  tabLabelActive: { color: '#4F46E5', fontWeight: '600' },
});
