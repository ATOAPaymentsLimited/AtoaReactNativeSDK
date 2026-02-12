import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  AtoaSdk,
  isCompleted,
  isFailed,
  isPending,
  type TransactionDetails,
  type AtoaPayOptions,
} from '@atoapayments/atoa-react-native-sdk';

const ATOA_TOKEN = 'YOUR_ATOA_TOKEN_HERE'; // Replace with your actual Atoa API token
const TOTAL_AMOUNT = 2;

function getRequestData(amount: number) {
  return {
    customerId: 'abc123',
    consumerDetails: {
      phoneCountryCode: '44',
      phoneNumber: '8788899999',
      email: 'aaa@gmail.com',
    },
    orderId: '242u9384jfjkw',
    currency: 'GBP',
    amount,
    paymentType: 'TRANSACTION',
    autoRedirect: false,
    callbackParams: {
      deviceId: '35356478',
      locationId: '8956545',
    },
    redirectUrl: 'atoa://devapp.atoa.me/sdk-redirect',
    expiresIn: 60000000,
    storeId: 'ee39ecfa-e336-461c-a957-1adc76ac087c',
    strictExpiry: false,
    splitBill: false,
  };
}

async function getPaymentRequestId(amount: number): Promise<string> {
  const response = await fetch(
    'https://devapi.atoa.me/api/payments/process-payment',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer MTlmMjFhYjQtNDhlOS00MzdiLTg3MmQtZThmMmUyNmQ0OThmOmlsVlFrRDdOTDlZNXNLd2I=`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(getRequestData(amount)),
    },
  );

  const data = await response.json();
  console.log('Payment API full response:', JSON.stringify(data));
  console.log('Payment API processed:', {
    paymentRequestId: data.paymentRequestId,
    amount,
    timestamp: new Date().toISOString(),
  });
  return data.paymentRequestId ?? '';
}

function App(): React.JSX.Element {
  const [lastResult, setLastResult] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const showHowPaymentWorksRef = useRef(true);

  const showPaymentSheet = async (paymentId: string) => {
    const options: AtoaPayOptions = {
      paymentId,
      env: 'prod',
      environment: 'development',
      showHowPaymentWorks: showHowPaymentWorksRef.current,
      customerDetails: {
        phoneCountryCode: '44',
        phoneNumber: '8788899999',
        email: 'aaa@gmail.com',
      },
      onUserClose: ({ paymentRequestId }) => {
        console.log(
          `User closed payment for paymentRequestId: ${paymentRequestId}`,
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
    showHowPaymentWorksRef.current = false;
    setLastResult(result);

    if (result) {
      if (isCompleted(result)) {
        Alert.alert('Payment Successful', 'Your payment has been completed.');
      } else if (isPending(result)) {
        Alert.alert('Payment Pending', 'Your payment is being processed.');
      } else if (isFailed(result)) {
        Alert.alert('Payment Failed', 'Your payment could not be processed.');
      } else {
        Alert.alert('Payment Status', `Status: ${result.status}`);
      }
    }
  };

  const handlePayNow = async () => {
    setIsLoading(true);
    try {
      const paymentRequestId = await getPaymentRequestId(TOTAL_AMOUNT);

      if (paymentRequestId) {
        setIsLoading(false);
        await showPaymentSheet(paymentRequestId);
      } else {
        setIsLoading(false);
        Alert.alert('Error', 'Oops, An Error Occurred');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Payment error:', error);
      Alert.alert('Error', 'Oops, An Error Occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Atoa SDK Demo</Text>
        <Text style={styles.subtitle}>React Native Demo App</Text>

        <View style={styles.spacer} />

        {/* Product Card */}
        <View style={styles.productCard}>
          <Text style={styles.productEmoji}>👟</Text>
          <Text style={styles.productName}>Nike Air Max 90</Text>
          <Text style={styles.productPrice}>
            £{TOTAL_AMOUNT.toFixed(2)}
          </Text>
          <View style={styles.spacerSmall} />
          <Pressable
            style={[styles.payButton, isLoading && styles.payButtonDisabled]}
            onPress={handlePayNow}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.payButtonText}>Pay Now</Text>
            )}
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
  payButtonDisabled: {
    opacity: 0.7,
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
