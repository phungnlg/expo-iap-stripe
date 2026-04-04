import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
interface GradientHeaderProps { title: string; subtitle?: string; }
export function GradientHeader({ title, subtitle }: GradientHeaderProps) {
  return (
    <LinearGradient colors={['#4F46E5', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.grad}>
      <View style={s.c1} /><View style={s.c2} />
      <Text style={s.title}>{title}</Text>
      {subtitle && <Text style={s.sub}>{subtitle}</Text>}
    </LinearGradient>
  );
}
const s = StyleSheet.create({
  grad: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 24, overflow: 'hidden' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center' },
  sub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8 },
  c1: { position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.08)' },
  c2: { position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.06)' },
});
