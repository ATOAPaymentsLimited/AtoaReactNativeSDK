import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import type { BankInstitution } from '../../types/bank';
import { AtoaException, LINK_PAID_MESSAGE, REQUEST_EXPIRED_MESSAGE } from '../../types/error';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Strings } from '../../constants/strings';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { FetchingBankLoader } from '../shared/FetchingBankLoader';
import { ErrorWidget } from '../shared/ErrorWidget';
import { RequestExpiredView } from '../shared/RequestExpiredView';
import { InfoWidget } from '../shared/InfoWidget';
import { PaymentPaidWidget } from '../confirmation/PaymentPaidWidget';
import { AnimatedSearchField } from './AnimatedSearchField';
import { BankTabBar } from './BankTabBar';
import { BankGridItem } from './BankGridItem';
import { BankListItem } from './BankListItem';
import { BankDownBottomSheet } from './BankDownBottomSheet';
import { BankLimitCard } from './BankLimitCard';

interface BankSelectionScreenProps {
  onBack?: () => void;
  onHelp?: () => void;
}

export function BankSelectionScreen({
  onBack,
  onHelp,
}: BankSelectionScreenProps) {
  const {
    state,
    dispatch,
    selectBank,
    search,
    getPaymentDetailsAndBanks,
    popularPersonalBanks,
    popularBusinessBanks,
    allBanksEnabled,
    allBanksDisabledByAmount,
    paymentAmount,
  } = useBankInstitutions();

  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [bankDownBank, setBankDownBank] = useState<BankInstitution | null>(null);
  const { width } = useWindowDimensions();

  const isLoading = state.isLoading || state.isLoadingDetails || state.hasLastPaymentDetails;
  const hasError = state.bankFetchingError || state.paymentDetailsError;
  const isSearching = state.searchTerm.length > 0;

  // Popular banks for current tab (already filtered by amount limit), first 8
  const popularBanks = (selectedTabIndex === 0 ? popularPersonalBanks : popularBusinessBanks).slice(0, 8);

  const handleBankPress = useCallback(
    async (bank: BankInstitution) => {
      if (!bank.enabled) {
        setBankDownBank(bank);
        return;
      }
      dispatch({ type: 'SET_SELECTED_BANK', payload: bank });
      const result = await selectBank(bank);
      if (result === 'bank_down') {
        setBankDownBank(bank);
      }
    },
    [dispatch, selectBank]
  );

  const handleRetry = useCallback(async () => {
    dispatch({ type: 'CLEAR_FETCH_ERRORS' });
    await getPaymentDetailsAndBanks();
  }, [dispatch, getPaymentDetailsAndBanks]);

  const gridItemWidth = (width - Spacing.large * 2 - Spacing.large * 3) / 4;
  const gridItemStyle = useMemo(
    () => ({ width: gridItemWidth, marginBottom: Spacing.large }),
    [gridItemWidth]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader
          title={Strings.bankSelection.title}
          onBack={onBack}
          showHelp={!!onHelp}
          onHelp={onHelp}
        />
        <View style={styles.loaderContainer}>
          <FetchingBankLoader />
        </View>
      </View>
    );
  }

  if (hasError) {
    const isBankFetchError = !!state.bankFetchingError;
    const paymentDetailsErr = state.paymentDetailsError;
    const isAlreadyPaid =
      paymentDetailsErr instanceof AtoaException &&
      paymentDetailsErr.message?.trim() === LINK_PAID_MESSAGE;
    const isRequestExpired =
      paymentDetailsErr instanceof AtoaException &&
      paymentDetailsErr.message?.trim() === REQUEST_EXPIRED_MESSAGE;

    if (isAlreadyPaid) {
      const err = paymentDetailsErr as AtoaException;
      return (
        <View style={styles.container}>
          <BottomSheetHeader
            title={Strings.bankSelection.title}
            onBack={onBack}
            showHelp={!!onHelp}
            onHelp={onHelp}
          />
          <View style={styles.loaderContainer}>
            <PaymentPaidWidget
              amount={err.amount}
              time={err.time}
              referenceId={err.referenceId}
            />
          </View>
        </View>
      );
    }

    if (isRequestExpired) {
      return (
        <View style={styles.container}>
          <BottomSheetHeader
            title={Strings.bankSelection.title}
            onBack={onBack}
            showHelp={!!onHelp}
            onHelp={onHelp}
          />
          <RequestExpiredView />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <BottomSheetHeader
          title={Strings.bankSelection.title}
          onBack={onBack}
          showHelp={!!onHelp}
          onHelp={onHelp}
        />
        <View style={styles.loaderContainer}>
          {isBankFetchError ? (
            <ErrorWidget
              title={Strings.bankSelection.fetchError}
              message={Strings.bankSelection.fetchErrorMessage}
              onRetry={handleRetry}
            />
          ) : (
            <ErrorWidget
              title={Strings.bankSelection.paymentProcessingError}
              message={ paymentDetailsErr?.message }
            />
          )}
        </View>
      </View>
    );
  }

  const renderGridItem = ({ item }: { item: BankInstitution }) => (
    <View style={gridItemStyle}>
      <BankGridItem
        bank={item}
        isSelected={state.selectedBank?.id === item.id}
        onPress={handleBankPress}
      />
    </View>
  );

  const renderListItem = ({ item }: { item: BankInstitution }) => (
    <BankListItem
      bank={item}
      isSelected={state.selectedBank?.id === item.id}
      onPress={handleBankPress}
    />
  );

  // Amount-limited section (shared between search and normal views)
  const renderAmountLimitedSection = (disabledBanks: BankInstitution[]) => {
    if (disabledBanks.length === 0 || paymentAmount == null) {
      return null;
    }
    return (
      <View style={styles.amountLimitedContainer}>
        <View style={styles.spacerSmall} />
        <BankLimitCard amount={paymentAmount} />
        <View style={styles.spacerMedium} />
        {disabledBanks.map((bank) => (
          <BankListItem
            key={bank.id}
            bank={bank}
            isSelected={false}
            onPress={handleBankPress}
            forceDisabled
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BottomSheetHeader
        title={Strings.bankSelection.title}
        onBack={onBack}
        showHelp={!!onHelp}
        onHelp={onHelp}
      />

      <AnimatedSearchField
        value={state.searchTerm}
        onChangeText={(text) => search(text)}
      />

      <View style={styles.spacer} />

      {!isSearching && (
        <>
          <View style={styles.tabBarContainer}>
            <BankTabBar selectedIndex={selectedTabIndex} onTabChange={setSelectedTabIndex} />
          </View>
          <View style={styles.spacer} />
        </>
      )}

      <View style={styles.infoBannerContainer}>
        <InfoWidget
          message={Strings.bankSelection.bankAppInfo}
          variant="info"
        />
      </View>

      {!isSearching && <View style={styles.spacerLarge} />}

      {isSearching ? (
        <>
          <View style={styles.resultsHeaderContainer}>
            <Text style={styles.sectionLabel}>{Strings.bankSelection.resultsLabel}</Text>
          </View>
          <BottomSheetFlatList
            data={allBanksEnabled}
            keyExtractor={(item: BankInstitution) => item.id}
            renderItem={renderListItem}
            contentContainerStyle={[styles.listContent, styles.searchListContent]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={renderAmountLimitedSection(allBanksDisabledByAmount)}
            ListEmptyComponent={
              allBanksDisabledByAmount.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyTitle}>{Strings.bankSelection.noResults}</Text>
                  <Text style={styles.emptySubtitle}>
                    {Strings.bankSelection.noResultsMessage(state.searchTerm)}
                  </Text>
                </View>
              ) : null
            }
          />
        </>
      ) : (
        <BottomSheetFlatList
          data={[{ type: 'grid' as const }, { type: 'list' as const }]}
          keyExtractor={(item: { type: string }) => item.type}
          renderItem={({ item }: { item: { type: string } }) => {
            if (item.type === 'grid' && popularBanks.length > 0) {
              return (
                <FlatList
                  data={popularBanks}
                  keyExtractor={(bank) => bank.id}
                  renderItem={renderGridItem}
                  numColumns={4}
                  scrollEnabled={false}
                  contentContainerStyle={styles.gridContent}
                  columnWrapperStyle={styles.gridRow}
                />
              );
            }
            if (item.type === 'list') {
              return (
                <View style={styles.allBanksContainer}>
                  <Text style={styles.sectionLabel}>{Strings.bankSelection.allBanksLabel}</Text>
                  {allBanksEnabled.map((bank) => (
                    <BankListItem
                      key={bank.id}
                      bank={bank}
                      isSelected={state.selectedBank?.id === bank.id}
                      onPress={handleBankPress}
                    />
                  ))}
                  {renderAmountLimitedSection(allBanksDisabledByAmount)}
                </View>
              );
            }
            return null;
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {bankDownBank != null && (
        <BankDownBottomSheet
          bank={bankDownBank}
          onClose={() => setBankDownBank(null)}
        />
      )}

      {state.isLoadingAuth && (
        <View style={styles.loadingOverlay}>
          <FetchingBankLoader />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  spacer: {
    height: Spacing.large,
  },
  spacerSmall: {
    height: Spacing.small,
  },
  spacerMedium: {
    height: Spacing.medium,
  },
  spacerLarge: {
    height: Spacing.xtraLarge,
  },
  tabBarContainer: {
    paddingHorizontal: Spacing.large,
  },
  gridContent: {
    paddingHorizontal: Spacing.large,
  },
  gridRow: {
    gap: Spacing.large,
  },
  listContent: {
    paddingHorizontal: Spacing.large,
    paddingBottom: 32,
  },
  searchListContent: {
    flexGrow: 1,
  },
  infoBannerContainer: {
    paddingHorizontal: Spacing.large,
  },
  allBanksContainer: {
    marginTop: Spacing.large,
    paddingTop: Spacing.medium,
  },
  sectionLabel: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.grey500,
    letterSpacing: 1.2,
    marginBottom: Spacing.small,
  },
  amountLimitedContainer: {},
  resultsHeaderContainer: {
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.large,
    gap: Spacing.medium,
  },
  emptyTitle: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    lineHeight: 23.2,
  },
  emptySubtitle: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 21,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
