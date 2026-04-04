import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PaymentMethodType } from '../models/PaymentMethod';
import type { PaymentMethod } from '../models/PaymentMethod';
interface PaymentMethodCardProps { method: PaymentMethod; isSelected: boolean; onSelect: (m: PaymentMethod) => void; }
function getIcon(t: PaymentMethodType): string { switch(t) { case PaymentMethodType.AppleIap: case PaymentMethodType.ApplePay: return '\uF8FF'; case PaymentMethodType.GooglePlay: return '\u25B6'; case PaymentMethodType.GooglePay: return 'G'; case PaymentMethodType.Stripe: return '\u2666'; } }
export function PaymentMethodCard({ method, isSelected, onSelect }: PaymentMethodCardProps) {
  return (
    <TouchableOpacity style={[s.card, isSelected && s.cardSel]} onPress={() => onSelect(method)} activeOpacity={0.7}>
      <View style={s.iconC}><Text style={s.icon}>{getIcon(method.type)}</Text></View>
      <View style={s.info}><Text style={s.label}>{method.label}</Text>{method.lastFourDigits && <Text style={s.sub}>**** {method.lastFourDigits}</Text>}</View>
      <View style={[s.radio, isSelected && s.radioSel]}>{isSelected && <View style={s.dot} />}</View>
    </TouchableOpacity>
  );
}
const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 2, borderColor: '#e5e7eb' },
  cardSel: { borderColor: '#4F46E5', backgroundColor: '#eef2ff' },
  iconC: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  icon: { fontSize: 18, color: '#374151' }, info: { flex: 1 }, label: { fontSize: 15, fontWeight: '600', color: '#1f2937' }, sub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },
  radioSel: { borderColor: '#4F46E5' }, dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4F46E5' },
});
