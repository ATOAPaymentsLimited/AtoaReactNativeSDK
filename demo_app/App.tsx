import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  AtoaSdk,
  isCompleted,
  isFailed,
  isPending,
  type TransactionDetails,
  type AtoaPayOptions,
} from '@atoapayments/atoa-react-native-sdk';
import Svg, {Path, G, ClipPath, Rect, Defs} from 'react-native-svg';

const ATOA_TOKEN = 'YOUR_ATOA_TOKEN_HERE'; // Replace with your actual Atoa API token

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const INITIAL_PRODUCTS: Product[] = [
  {id: '1', name: 'NikeCourt Lite 1', price: 1.0, quantity: 1},
  {id: '2', name: 'NikeCourt Lite 2', price: 1.0, quantity: 1},
];

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
    'https://api.atoa.me/api/payments/process-payment',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ATOA_TOKEN}`,
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

function DeleteIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Defs>
        <ClipPath id="clip0">
          <Rect width={16} height={16} fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0)">
        <Path
          d="M12.134 3.9375V11.1691C12.134 12.3268 11.1883 13.2654 10.0219 13.2654H5.97542C4.80897 13.2654 3.86328 12.3268 3.86328 11.1691V3.9375"
          stroke="#F94444"
          strokeWidth={0.944444}
          strokeLinecap="round"
        />
        <Path
          d="M8 6.73438V10.8386"
          stroke="#F94444"
          strokeWidth={0.944444}
          strokeLinecap="round"
        />
        <Path
          d="M6.11914 6.73438V10.8386"
          stroke="#F94444"
          strokeWidth={0.944444}
          strokeLinecap="round"
        />
        <Path
          d="M9.87891 6.73438V10.8386"
          stroke="#F94444"
          strokeWidth={0.944444}
          strokeLinecap="round"
        />
        <Path
          d="M6.11914 3.93584V2.9823C6.11914 2.47859 6.53065 2.07031 7.03802 2.07031H8.9597C9.46707 2.07031 9.87858 2.47859 9.87858 2.9823V3.93584"
          stroke="#F94444"
          strokeWidth={0.944444}
          strokeLinecap="round"
        />
        <Path
          d="M13.2626 3.9375H2.73633"
          stroke="#F94444"
          strokeWidth={0.944444}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
}

function RadioSelected() {
  return (
    <View style={styles.radioOuter}>
      <View style={styles.radioInner} />
    </View>
  );
}

function ProductCard({
  product,
  onDelete,
  onIncrement,
  onDecrement,
}: {
  product: Product;
  onDelete: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <View style={styles.productCard}>
      <Image
        source={require('./assets/images/shoes.png')}
        style={styles.productImage}
        resizeMode="contain"
      />
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{product.name}</Text>
          <Pressable onPress={onDelete} hitSlop={8}>
            <DeleteIcon />
          </Pressable>
        </View>
        <View style={styles.productSpacerSmall} />
        <Text style={styles.productPrice}>
          £{product.price.toFixed(2)}
        </Text>
        <View style={styles.productSpacerSmall} />
        <View style={styles.quantityContainer}>
          <Pressable
            style={styles.quantityButton}
            onPress={onDecrement}
            hitSlop={4}>
            <Text style={styles.quantityIcon}>−</Text>
          </Pressable>
          <View style={styles.quantityValue}>
            <Text style={styles.quantityText}>{product.quantity}</Text>
          </View>
          <Pressable
            style={styles.quantityButton}
            onPress={onIncrement}
            hitSlop={4}>
            <Text style={styles.quantityIcon}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function App(): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const showHowPaymentWorksRef = useRef(true);

  const totalAmount = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleIncrement = (id: string) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? {...p, quantity: p.quantity + 1} : p)),
    );
  };

  const handleDecrement = (id: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id && p.quantity > 1
          ? {...p, quantity: p.quantity - 1}
          : p,
      ),
    );
  };

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

    const result = await AtoaSdk.pay(options);
    showHowPaymentWorksRef.current = false;

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
    if (products.length === 0) {
      return;
    }
    setIsLoading(true);
    try {
      const paymentRequestId = await getPaymentRequestId(totalAmount);

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
      {/* AppBar */}
      <View style={styles.appBar}>
        <Pressable hitSlop={8}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.appBarTitle}>Demo E-commerce App</Text>
        <View style={styles.appBarSpacer} />
      </View>

      {/* Body */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Items count + delivery info */}
        <View style={styles.infoRow}>
          <Text style={styles.itemCount}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Text>
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryText}>
              Arrives by April 3rd to April 9th
            </Text>
          </View>
        </View>

        <View style={styles.spacerMedium} />

        {/* Product Cards */}
        {products.map((product, index) => (
          <View key={product.id}>
            <ProductCard
              product={product}
              onDelete={() => handleDelete(product.id)}
              onIncrement={() => handleIncrement(product.id)}
              onDecrement={() => handleDecrement(product.id)}
            />
            {index < products.length - 1 && (
              <View style={styles.spacerMedium} />
            )}
          </View>
        ))}

        <View style={styles.spacerLarge} />

        {/* Payment Method */}
        <View style={styles.paymentMethodRow}>
          <RadioSelected />
          <View style={styles.radioGap} />
          <Text style={styles.paymentMethodText}>
            Atoa - Instant Bank Pay
          </Text>
        </View>

        <View style={styles.spacerSmall} />

        {/* Atoa Logo */}
        <Image
          source={require('./assets/images/atoa.png')}
          style={styles.atoaLogo}
          resizeMode="contain"
        />

        {/* Extra spacing for bottom sheet */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Sheet - Pay Now */}
      <View style={styles.bottomSheet}>
        <View style={styles.bottomSheetLeft}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>£ {totalAmount.toFixed(2)}</Text>
        </View>
        <Pressable
          style={[
            styles.payButton,
            (isLoading || products.length === 0) && styles.payButtonDisabled,
          ]}
          onPress={handlePayNow}
          disabled={isLoading || products.length === 0}>
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
          )}
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

  // AppBar
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0,
  },
  backArrow: {
    fontSize: 28,
    color: '#494F57',
    fontWeight: '300',
    marginRight: 8,
  },
  appBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  appBarSpacer: {
    flex: 1,
  },

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#494F57',
  },
  deliveryBadge: {
    backgroundColor: '#FFF9DB',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deliveryText: {
    fontSize: 13,
    color: '#494F57',
  },

  // Spacing
  spacerMedium: {
    height: 16,
  },
  spacerSmall: {
    height: 12,
  },
  spacerLarge: {
    height: 32,
  },

  // Product Card
  productCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E9EB',
  },
  productImage: {
    width: 108,
    height: 90,
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 18,
  },
  productSpacerSmall: {
    height: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#494F57',
    lineHeight: 24,
  },

  // Quantity Controls
  quantityContainer: {
    flexDirection: 'row',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EEEFF0',
    width: 96,
    height: 36,
    overflow: 'hidden',
  },
  quantityButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityIcon: {
    fontSize: 18,
    color: '#3498DB',
    fontWeight: '400',
  },
  quantityValue: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#000000',
  },

  // Payment Method
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498DB',
  },
  radioGap: {
    width: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },

  // Atoa Logo
  atoaLogo: {
    width: '100%',
    height: 60,
    marginTop: 4,
  },

  // Bottom Padding
  bottomPadding: {
    height: 100,
  },

  // Bottom Sheet
  bottomSheet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -8},
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSheetLeft: {},
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },

  // Pay Button
  payButton: {
    backgroundColor: '#3498DB',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 164,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
