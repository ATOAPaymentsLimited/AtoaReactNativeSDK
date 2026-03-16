export const Strings = {
  bankSelection: {
    title: 'Select your bank',
    searchPlaceholders: [
      'Search your personal bank',
      'Search your business bank',
    ],
    resultsLabel: 'RESULTS',
    allBanksLabel: 'ALL BANKS',
    noResults: 'No results',
    noResultsMessage: (term: string) =>
      `No results for "${term}" in banks. Try using different keywords.`,
    bankAppInfo: "Ensure the selected bank's app is installed on your phone.",
    personalBanksTab: 'Personal Banks',
    businessBanksTab: 'Business Banks',
    fetchError: 'We couldn\u2019t fetch banks!',
    fetchErrorMessage:
      'Something went wrong while fetching bank list. Please check your internet connection and try again.',
    paymentProcessingError: 'Error processing payment',
    bankLimitWarning:
      'Some banks listed below might not handle the payments of ',
    cardPaymentOptions: 'Card payment options',
  },

  confirmation: {
    title: 'Review',
    infoMessage:
      "We'll send you to your bank's app or website to confirm this payment.",
    payingTo: 'Paying to',
    from: 'From',
    change: 'Change',
    appWarningPrefix:
      'For a smoother payment, we recommend downloading the ',
    appWarningSuffix: ' app',
    appWarningAlt:
      ' Or, continue using internet banking if that works better for you.',
    linkExpired: 'Link expired,  ',
    refresh: 'Refresh',
    linkExpiredSuffix: ' to try again',
    goToBank: (bankName: string) => `Go to ${bankName}  \u2192`,
    defaultBankName: 'Bank',
    termsPrefix: " By continuing, you trust this merchant and accept Atoa's ",
    termsLink: 'terms',
  },

  bankDown: {
    badge: 'Downtime',
    message:
      ' bank is currently down for maintenance. Please select a different bank and try again.',
    selectAnother: 'Select another bank',
  },

  howToPay: {
    title: 'How to pay with bank app?',
    step1Prefix: 'Your ',
    step1Bold: 'Bank app',
    step1Suffix: ' will open on selection automatically if it\u2019s installed.',
    step2Prefix: 'You can ',
    step2Bold: 'login securely',
    step2Suffix:
      ' and approve your payment. Your details stay confidential.',
    step3Prefix: 'Once the payment\u2019s ',
    step3Bold: 'confirmed',
    step3Suffix: ', we\u2019ll redirect you to the success page.',
    trustBadge: 'Trusted by thousands of businesses in the UK',
    continueButton: 'I understand, continue  \u2192',
    poweredBy: 'Powered by ',
  },

  verifyingPayment: {
    title: 'Payment in progress',
    verifyingStatus: 'Verifying payment status\nwith your bank.',
    notePrefix: 'Note:',
    noteMessage:
      ' Do not press back or close this screen until the transaction is complete.',
    paymentSuccessful: 'Payment Successful',
  },

  error: {
    defaultTitle: 'Oops! Something went wrong',
    retry: 'Retry',
  },

  requestExpired: {
    title: 'Request expired',
    message:
      'This payment request has been expired, please go back and retry the payment again.',
  },

  connectivity: {
    title: 'Oops! No internet connection',
    message:
      'Server is not reachable. Please check your internet connection and try again',
  },

  cardConfirmation: {

    notEnabledTitle: 'Card payment is not available',
    notEnabledMessage:
      'Card payments are not enabled for this merchant. Please use a bank transfer instead.',
    payByCard: 'Pay by card',

  },

  api: {
    maintenanceMessage:
      "Sorry, we're currently down for maintenance. Please check back later.",
    unknownError: 'Unknown Error',
    serverNotReachable:
      'Server is not reachable. Please verify your internet connection and try again',
    cardCheckoutUnavailable:
      'Card checkout is not available. Please try again.',
  },

  paymentPaid: {
    title: 'This payment is already paid',
    paidOn: (time: string) => `Paid on ${time}`,
    referenceNo: (id: string) => `Reference No. ${id}`,
  },
};
