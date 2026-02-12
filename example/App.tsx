import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
  Pressable,
} from 'react-native';
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
    backgroundColor: '#FAFAFA',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputContainer: {
    paddingHorizontal: 16,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#999',
    paddingVertical: 8,
  },
  spacer: {
    height: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  payButton: {
    backgroundColor: '#6750A4',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
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
