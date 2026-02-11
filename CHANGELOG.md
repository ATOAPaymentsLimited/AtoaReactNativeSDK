# Changelog

## 1.0.0

### Features

- Initial release of the Atoa React Native SDK
- Bank selection screen with grid and list views
- Personal and Business bank tabs
- Animated search with debounced filtering
- How to Make Payment tutorial screen
- Payment confirmation screen with merchant branding
- Verifying payment screen with status polling
- Bank app detection (Android + iOS native modules)
- Customer details for previously used bank pre-selection
- Sandbox and production environment support
- Imperative API: `AtoaSdk.pay()` — no provider wrapper required
- Payment status callbacks (`onPaymentStatusChange`, `onUserClose`, `onError`)
- Lottie animations for loading states and success indicators
- FigTree font integration
- Network connectivity monitoring with auto-retry
- Authorization link refresh (5-minute intervals, max 30 minutes)
