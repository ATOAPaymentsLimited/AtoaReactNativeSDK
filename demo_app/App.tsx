import React, {useState, useRef, useEffect, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import {
  AtoaSdk,
  isCompleted,
  isFailed,
  isPending,
  TransactionType,
  type AtoaPayOptions,
} from '@atoapayments/atoa-react-native-sdk';
import NetInfo from '@react-native-community/netinfo';
import Svg, {Path, G, ClipPath, Rect, Defs} from 'react-native-svg';
import {SafeAreaView} from 'react-native-safe-area-context';

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

type ConnectivityStatus = 'wifi' | 'cellular' | 'offline' | 'waiting' | 'other';

function useConnectivity(): {
  status: ConnectivityStatus;
  isOffline: boolean;
  checkConnection: () => Promise<void>;
} {
  const [status, setStatus] = useState<ConnectivityStatus>('waiting');

  const resolveStatus = useCallback(async (): Promise<ConnectivityStatus> => {
    const state = await NetInfo.fetch();
    if (state.isConnected === null) {
      return 'waiting';
    }
    if (!state.isConnected) {
      return 'offline';
    }
    if (state.type === 'cellular') {
      return 'cellular';
    }
    if (state.type === 'wifi') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const response = await fetch('https://api.atoa.me/api/', {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response.status === 200 ? 'wifi' : 'offline';
      } catch {
        return 'offline';
      }
    }
    if (
      state.type === 'vpn' ||
      state.type === 'other' ||
      state.type === 'ethernet' ||
      state.type === 'bluetooth'
    ) {
      return 'other';
    }
    return 'offline';
  }, []);

  const checkConnection = useCallback(async () => {
    const newStatus = await resolveStatus();
    setStatus(newStatus);
  }, [resolveStatus]);

  useEffect(() => {
    checkConnection();
    const unsubscribe = NetInfo.addEventListener(async state => {
      let newStatus: ConnectivityStatus;
      if (state.isConnected === null) {
        newStatus = 'waiting';
      } else if (!state.isConnected) {
        newStatus = 'offline';
      } else if (state.type === 'cellular') {
        newStatus = 'cellular';
      } else if (state.type === 'wifi') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000);
          const response = await fetch('https://api.atoa.me/api/', {
            method: 'GET',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          newStatus = response.status === 200 ? 'wifi' : 'offline';
        } catch {
          newStatus = 'offline';
        }
      } else if (
        state.type === 'vpn' ||
        state.type === 'other' ||
        state.type === 'ethernet' ||
        state.type === 'bluetooth'
      ) {
        newStatus = 'other';
      } else {
        newStatus = 'offline';
      }
      setStatus(newStatus);
    });
    return () => unsubscribe();
  }, [checkConnection]);

  const isOffline = status === 'offline';

  return {status, isOffline, checkConnection};
}

function WifiOffIcon() {
  return (
    <Svg width={24} height={20} viewBox="0 0 47 38" fill="none">
      <Path
        d="M42.7501 16.3178C40.2547 13.898 37.3627 12.0044 34.074 10.6367C30.784 9.27035 27.2593 8.58716 23.5001 8.58716C22.8195 8.58716 22.1636 8.61042 21.5323 8.65693C20.8997 8.70469 20.2593 8.77571 19.6112 8.86999L14.6529 4.06191C16.0788 3.6848 17.5293 3.40198 19.0045 3.21342C20.4784 3.02487 21.9769 2.93059 23.5001 2.93059C28.1019 2.93059 32.3959 3.76337 36.382 5.42891C40.3681 7.09446 43.8519 9.37279 46.8334 12.2639L42.7501 16.3178ZM34.9723 23.7656L25.1529 14.2437C27.7779 14.4951 30.233 15.1393 32.5184 16.1764C34.8025 17.2134 36.8195 18.5804 38.5695 20.2774L34.9723 23.7656ZM38.5695 38.0013L20.2917 20.1831C18.7686 20.5288 17.3511 21.0473 16.0392 21.7387C14.7261 22.43 13.551 23.2942 12.514 24.3313L8.43064 20.2774C9.46767 19.2718 10.5857 18.3919 11.7848 17.6377C12.9839 16.8835 14.264 16.2235 15.6251 15.6579L11.2501 11.4154C9.92138 12.0754 8.68212 12.8057 7.5323 13.6064C6.38119 14.4084 5.28712 15.3122 4.25008 16.3178L0.166748 12.2639C1.20379 11.2583 2.28166 10.3545 3.40036 9.55255C4.51777 8.75183 5.70841 7.99008 6.9723 7.2673L2.88897 3.3077L5.61119 0.667969L41.389 35.3616L38.5695 38.0013ZM23.5001 34.9845L16.6459 28.2909C17.5209 27.4424 18.5417 26.7743 19.7084 26.2866C20.8751 25.8001 22.139 25.5569 23.5001 25.5569C24.8612 25.5569 26.1251 25.8001 27.2917 26.2866C28.4584 26.7743 29.4792 27.4424 30.3542 28.2909L23.5001 34.9845Z"
        fill="#1A1A1A"
      />
    </Svg>
  );
}

function OfflineBanner({
  onRetry,
  isRetrying,
}: {
  onRetry: () => void;
  isRetrying: boolean;
}) {
  return (
    <View style={styles.offlineBanner}>
      <WifiOffIcon />
      <View style={styles.offlineBannerGap} />
      <Text style={styles.offlineBannerText} numberOfLines={1}>
        No internet connection
      </Text>
      <View style={styles.offlineBannerSpacer} />
      {isRetrying ? (
        <ActivityIndicator color="#3498DB" size="small" />
      ) : (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={styles.offlineBannerRetry}>Retry</Text>
        </Pressable>
      )}
    </View>
  );
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

function RadioUnselected() {
  return (
    <View style={styles.radioOuter}>
      <View style={styles.radioInnerTransparent} />
    </View>
  );
}

function PayByBankRow({selected, onPress}: {selected: boolean; onPress: () => void}) {
  return (
    <Pressable
      style={[styles.payByBankCard, selected ? styles.cardSelected : styles.cardUnselected]}
      onPress={onPress}>
      <View style={styles.payByBankLeft}>
        {selected ? <RadioSelected /> : <RadioUnselected />}
        <View style={styles.payByBankTextContainer}>
          <Text style={styles.payByBankTitle}>Pay by bank app</Text>
        </View>
      </View>
      <View style={styles.bankLogosRow}>
        <Image
          source={require('./assets/images/bank_logos.png')}
          style={styles.bankLogosImage}
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}

function PayByCardRow({selected, onPress}: {selected: boolean; onPress: () => void}) {
  return (
    <Pressable
      style={[styles.payByBankCard, selected ? styles.cardSelected : styles.cardUnselected]}
      onPress={onPress}>
      <View style={styles.payByBankLeft}>
        {selected ? <RadioSelected /> : <RadioUnselected />}
        <View style={styles.payByBankTextContainer}>
          <Text style={styles.payByBankTitle}>Pay by Card</Text>
        </View>
      </View>
      <View style={styles.bankLogosRow}>
        <Image
          source={require('./assets/images/mastercard.png')}
          style={styles.cardLogoSmall}
          resizeMode="contain"
        />
        <Image
          source={require('./assets/images/visa.png')}
          style={styles.cardLogoSmall}
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}

function ProductCard({
  product,
 
}: {
  product: Product;
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
          <Pressable hitSlop={8}>
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
            hitSlop={4}>
            <Text style={styles.quantityIcon}>−</Text>
          </Pressable>
          <View style={styles.quantityValue}>
            <Text style={styles.quantityText}>{product.quantity}</Text>
          </View>
          <Pressable
            style={styles.quantityButton}
            hitSlop={4}>
            <Text style={styles.quantityIcon}>+</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function App(): React.JSX.Element {
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);
  const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.OPEN_BANKING);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [snackbar, setSnackbar] = useState<{message: string; color: string} | null>(null);
  const snackbarOpacity = useRef(new Animated.Value(0)).current;
  const snackbarTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showHowPaymentWorksRef = useRef(true);
  const {isOffline, checkConnection} = useConnectivity();

  const showSnackbar = useCallback((message: string, color = '#323232') => {
    if (snackbarTimer.current) {
      clearTimeout(snackbarTimer.current);
    }
    setSnackbar({message, color});
    Animated.timing(snackbarOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    snackbarTimer.current = setTimeout(() => {
      Animated.timing(snackbarOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setSnackbar(null));
    }, 3000);
  }, [snackbarOpacity]);

  const totalAmount = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0,
  );
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);


  const showPaymentSheet = async (paymentId: string) => {
    const options: AtoaPayOptions = {
      paymentId,
      env: 'production',
      showHowPaymentWorks: showHowPaymentWorksRef.current,
      transactionType,
      showCardPaymentOption: true,
      customerDetails: {
        phoneCountryCode: '44',
        phoneNumber: '8788899999',
        email: 'aaa@gmail.com',
      },
      onUserClose: ({paymentRequestId, redirectUrlParams, signature, signatureHash}) => {
        console.log(
          `User closed payment for paymentRequestId: ${paymentRequestId}`,
          {redirectUrlParams, signature, signatureHash},
        );
      },
      onPaymentStatusChange: ({status, redirectUrlParams, signature, signatureHash}) => {
        console.log(`Payment Status Changed to ${status}`, {redirectUrlParams, signature, signatureHash});
      },
      onError: error => {
        console.error(`Error in Atoa SDK: ${error.message}`);
      },
    };

    setIsSheetOpen(true);
    const result = await AtoaSdk.pay(options);
    setIsSheetOpen(false);
    showHowPaymentWorksRef.current = false;

    if (result) {
      if (isCompleted(result)) {
        showSnackbar('Payment Successful', '#00802B');
      } else if (isPending(result)) {
        showSnackbar('Payment Pending', '#CC8800');
      } else if (isFailed(result)) {
        showSnackbar('Payment Failed', '#BC5A34');
      }
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await Promise.all([
      checkConnection(),
      new Promise<void>(resolve => setTimeout(() => resolve(), 500)),
    ]);
    setIsRetrying(false);
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
        showSnackbar('Oops, An Error Occurred');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Payment error:', error);
      showSnackbar('Oops, An Error Occurred');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* AppBar */}
      <View style={styles.appBar}>

        <Text style={styles.appBarTitle}>Demo E-commerce App</Text>
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
            />
            {index < products.length - 1 && (
              <View style={styles.spacerMedium} />
            )}
          </View>
        ))}

        <View style={styles.spacerLarge} />

        {/* Payment Methods */}
        <PayByBankRow
          selected={transactionType === TransactionType.OPEN_BANKING}
          onPress={() => setTransactionType(TransactionType.OPEN_BANKING)}
        />
        <View style={styles.spacerMedium} />
        <PayByCardRow
          selected={transactionType === TransactionType.CARD}
          onPress={() => setTransactionType(TransactionType.CARD)}
        />

        {/* Extra spacing for bottom sheet */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Offline Banner */}
      {isOffline && (
        <OfflineBanner onRetry={handleRetry} isRetrying={isRetrying} />
      )}

      {/* Bottom Sheet - Pay Now */}
      {!isSheetOpen && (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetLeft}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              £ {totalAmount.toFixed(2)}
            </Text>
          </View>
          <Pressable
            style={[
              styles.payButton,
              (isLoading || products.length === 0 || isOffline) &&
                styles.payButtonDisabled,
            ]}
            onPress={handlePayNow}
            disabled={isLoading || products.length === 0 || isOffline}
            testID="Pay Now Button">
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.payButtonText}>Pay Now</Text>
            )}
          </Pressable>
        </View>
      )}
      {/* Snackbar */}
      {snackbar && (
        <Animated.View style={[styles.snackbar, {opacity: snackbarOpacity, backgroundColor: snackbar.color}]}>
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </Animated.View>
      )}
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
    fontSize: 36,
    lineHeight: 36,
    color: '#494F57',
    fontWeight: '300',
    marginRight: 8,
  },
  appBarTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
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

  // Radio Button
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1A1A1A',
  },
  radioInnerTransparent: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },

  // Payment method cards
  cardSelected: {
    borderColor: '#000000',
  },
  cardUnselected: {
    borderColor: '#E8E9EB',
  },
  payByBankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  payByBankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  payByBankTextContainer: {
    marginLeft: 12,
  },
  payByBankTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    lineHeight: 20,
  },
  payByBankSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 16,
    marginTop: 2,
  },
  bankLogosRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogosImage: {
     width: 120,
     height: 40,
  },
  cardLogoSmall: {
    width: 50,
    height: 36,
    marginLeft: 4,
  },

  // Bottom Padding
  bottomPadding: {
    height: 32,
  },

  // Offline Banner
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  offlineBannerGap: {
    width: 12,
  },
  offlineBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  offlineBannerSpacer: {
    width: 8,
  },
  offlineBannerRetry: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498DB',
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

  // Snackbar
  snackbar: {
    position: 'absolute',
    bottom: 100,
    left: 24,
    right: 24,
    backgroundColor: '#323232',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  snackbarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default App;
