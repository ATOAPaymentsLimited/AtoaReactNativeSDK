import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
  Pressable,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  AtoaSdk,
  type AtoaEnv,
  type AtoaPayOptions,
} from '@atoapayments/atoa-react-native-sdk';

function App(): React.JSX.Element {
  const [paymentId, setPaymentId] = useState('');
  const [isSandbox, setIsSandbox] = useState(true);

  const env: AtoaEnv = isSandbox ? 'sandbox' : 'prod';

  const handleInitiatePayment = async () => {
    const trimmed = paymentId.trim();
    if (!trimmed) {
      return;
    }

    const options: AtoaPayOptions = {
      paymentId: trimmed,
      env,
      showHowPaymentWorks: false,
      environment: 'development',
      customerDetails: {
        phoneCountryCode: '44',
        phoneNumber: '8788899999',
        email: 'aaa@gmail.com',
      },
      onUserClose: ({paymentRequestId}) => {
        console.log(
          `User closed payment for paymentRequestId: ${paymentRequestId}`,
        );
      },
      onPaymentStatusChange: ({status}) => {
        console.log(`Payment Status Changed to ${status}`);
      },
      onError: error => {
        console.error(`Error in Atoa SDK: ${error.message}`);
      },
    };

    await AtoaSdk.pay(options);
  };

  const isButtonDisabled = paymentId.trim().length === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.body}>
        {/* Payment ID Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={paymentId}
            onChangeText={setPaymentId}
            placeholder="Payment ID"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.spacer} />

        {/* Sandbox Toggle */}
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>is Sandbox?</Text>
          <Switch value={isSandbox} onValueChange={setIsSandbox} />
        </View>
      </View>

      {/* Initiate Payment Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={[
            styles.payButton,
            isButtonDisabled && styles.payButtonDisabled,
          ]}
          onPress={handleInitiatePayment}
          disabled={isButtonDisabled}>
          <Text style={styles.payButtonText}>Initiate Payment</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  inputContainer: {
    paddingHorizontal: 12,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    paddingVertical: 8,
  },
  spacer: {
    height: 12,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  payButton: {
    backgroundColor: '#6750A4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default App;
