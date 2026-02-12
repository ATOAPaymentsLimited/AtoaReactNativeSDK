import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
} from 'react-native';
import {
  AtoaSdk,
  type TransactionDetails,
  type AtoaPayOptions,
} from '@atoapayments/atoa-react-native-sdk';

function App(): React.JSX.Element {
  const [lastResult, setLastResult] = useState<TransactionDetails | null>(null);

  const handlePayNow = async () => {
    try {
      const options: AtoaPayOptions = {
        paymentId: 'payment-request-id', // Replace with actual payment ID
        env: 'prod',
        environment: 'production', // 'development' | 'staging' | 'production'
        showHowPaymentWorks: true,
        customerDetails: {
          phoneCountryCode: '44',
          phoneNumber: '8788899999',
          email: 'customer@example.com',
        },
        onUserClose: ({ paymentRequestId }) => {
          console.log(
            `User closed payment for paymentRequestId: ${paymentRequestId}`
          );
        },
        onPaymentStatusChange: ({ status }) => {
          console.log(`Payment Status Changed to ${status}`);
        },
        onError: (error) => {
          console.error(`Error in Atoa SDK: ${error.message}`);
        },
      };

      const result = await AtoaSdk.pay(options);
      setLastResult(result);

      if (result) {
        if (result.status === 'COMPLETED') {
          Alert.alert('Success', 'Payment completed successfully!');
        } else {
          Alert.alert('Payment Status', `Status: ${result.status}`);
        }
      } else {
        Alert.alert('Cancelled', 'Payment was cancelled by user.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'Failed to initiate payment.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Atoa SDK Demo</Text>
        <Text style={styles.subtitle}>React Native Example App</Text>

        <View style={styles.spacer} />

        {/* Product Card */}
        <View style={styles.productCard}>
          <Text style={styles.productEmoji}>👟</Text>
          <Text style={styles.productName}>Nike Air Max 90</Text>
          <Text style={styles.productPrice}>£130.00</Text>
          <View style={styles.spacerSmall} />
          <Pressable style={styles.payButton} onPress={handlePayNow}>
            <Text style={styles.payButtonText}>
              Pay Now
            </Text>
          </Pressable>
        </View>

        {/* Last Result */}
        {lastResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Last Payment Result</Text>
            <Text style={styles.resultText}>
              Status: {lastResult.status}
            </Text>
            <Text style={styles.resultText}>
              Amount: £{lastResult.paidAmount?.toFixed(2)}
            </Text>
            <Text style={styles.resultText}>
              ID: {lastResult.paymentIdempotencyId}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  spacer: {
    height: 40,
  },
  spacerSmall: {
    height: 16,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6B4EFF',
    marginTop: 8,
  },
  payButton: {
    backgroundColor: '#6B4EFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 48,
    width: '100%',
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
});

export default App;
