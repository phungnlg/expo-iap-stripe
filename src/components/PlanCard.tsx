import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FeatureRow } from './FeatureRow';
import { formattedPrice, billingPeriod, savingsPercent, SubscriptionTier } from '../models/SubscriptionPlan';
import type { SubscriptionPlan } from '../models/SubscriptionPlan';
interface PlanCardProps { plan: SubscriptionPlan; isActive: boolean; onSelect: (plan: SubscriptionPlan) => void; }
export function PlanCard({ plan, isActive, onSelect }: PlanCardProps) {
  const isFree = plan.tier === SubscriptionTier.Free;
  const isPopular = plan.tier === SubscriptionTier.Yearly;
  const savings = savingsPercent(plan);
  return (
    <View style={[s.card, isPopular && s.cardPop, isActive && s.cardAct]}>
      {isPopular && <View style={s.popBadge}><Text style={s.popText}>BEST VALUE</Text></View>}
      <View style={s.hdr}><Text style={s.name}>{plan.name}</Text><Text style={s.desc}>{plan.description}</Text></View>
      <View style={s.priceRow}><Text style={s.price}>{formattedPrice(plan)}</Text>{!isFree && <Text style={s.period}>{billingPeriod(plan)}</Text>}</View>
      {savings > 0 && <View style={s.savBadge}><Text style={s.savText}>Save {savings}%</Text></View>}
      <View style={s.feats}>{plan.features.map((f, i) => <FeatureRow key={i} feature={f} included={true} />)}</View>
      <TouchableOpacity style={[s.btn, isActive && s.btnAct, isPopular && !isActive && s.btnPop]} onPress={() => onSelect(plan)} disabled={isActive}>
        <Text style={[s.btnTxt, isPopular && !isActive && s.btnTxtPop]}>{isActive ? 'Current Plan' : isFree ? 'Downgrade' : 'Subscribe'}</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4, borderWidth: 2, borderColor: 'transparent' },
  cardPop: { borderColor: '#4F46E5' }, cardAct: { borderColor: '#10b981', backgroundColor: '#f0fdf4' },
  popBadge: { position: 'absolute', top: -12, right: 20, backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  popText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  hdr: { marginBottom: 12 }, name: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 4 }, desc: { fontSize: 13, color: '#6b7280' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }, price: { fontSize: 32, fontWeight: '800', color: '#1f2937' }, period: { fontSize: 14, color: '#6b7280', marginLeft: 4 },
  savBadge: { backgroundColor: '#dcfce7', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, marginBottom: 12 }, savText: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
  feats: { marginBottom: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
  btn: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }, btnAct: { backgroundColor: '#d1fae5' }, btnPop: { backgroundColor: '#4F46E5' },
  btnTxt: { fontSize: 16, fontWeight: '600', color: '#374151' }, btnTxtPop: { color: '#fff' },
});
