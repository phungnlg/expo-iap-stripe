import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
interface LoadingOverlayProps { message?: string; visible: boolean; }
export function LoadingOverlay({ message, visible }: LoadingOverlayProps) {
  if (!visible) return null;
  return (<View style={s.overlay}><View style={s.content}><ActivityIndicator size="large" color="#4F46E5" />{message && <Text style={s.text}>{message}</Text>}</View></View>);
}
const s = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', zIndex: 999 },
  content: { backgroundColor: '#fff', borderRadius: 16, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  text: { marginTop: 16, fontSize: 15, color: '#374151', fontWeight: '500' },
});
