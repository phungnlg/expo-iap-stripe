import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
interface FeatureRowProps { feature: string; included: boolean; }
export function FeatureRow({ feature, included }: FeatureRowProps) {
  return (<View style={s.row}><Text style={[s.icon, included ? s.iconY : s.iconN]}>{included ? '\u2713' : '\u2717'}</Text><Text style={[s.text, !included && s.textN]}>{feature}</Text></View>);
}
const s = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 }, icon: { fontSize: 14, width: 24, textAlign: 'center' }, iconY: { color: '#10b981' }, iconN: { color: '#d1d5db' }, text: { fontSize: 14, color: '#374151', flex: 1, marginLeft: 8 }, textN: { color: '#9ca3af', textDecorationLine: 'line-through' } });
