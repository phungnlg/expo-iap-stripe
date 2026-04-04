import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';

const STRIPE_PUBLISHABLE_KEY = 'pk_test_DEMO_KEY_REPLACE_IN_PRODUCTION';

/**
 * Root application component.
 *
 * Expo IAP + Stripe Payment Integration POC
 *
 * Demonstrates:
 * - In-App Purchases (Apple IAP + Google Play Billing) via react-native-iap
 * - Apple Pay and Google Pay integration
 * - Stripe payment integration (PaymentSheet + manual card entry)
 * - Subscription management (monthly/yearly plans with grace periods)
 * - Mock server-side receipt validation
 * - Professional paywall UI with plan comparison
 * - Purchase history tracking
 * - Zustand state management with proper TypeScript types
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey={STRIPE_PUBLISHABLE_KEY}
        merchantIdentifier="merchant.com.tranthienhau.expoiapstripe"
      >
        <StatusBar style="auto" />
        <AppNavigator />
      </StripeProvider>
    </SafeAreaProvider>
  );
}
