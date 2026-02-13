import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import type { BankInstitution } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { FetchingBankLoader } from '../shared/FetchingBankLoader';
import { ErrorWidget } from '../shared/ErrorWidget';
import { InfoWidget } from '../shared/InfoWidget';
import { AnimatedSearchField } from './AnimatedSearchField';
import { BankTabBar } from './BankTabBar';
import { BankGridItem } from './BankGridItem';
import { BankListItem } from './BankListItem';

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
    personalBanks,
    businessBanks,
    selectBank,
    search,
    fetchBanks,
    getPaymentDetails,
  } = useBankInstitutions();

  const [tabIndex, setTabIndex] = useState(0);
  const { width, height } = useWindowDimensions();

  const isLoading = state.isLoading || state.isLoadingDetails || state.hasLastPaymentDetails;
  const hasError = state.bankFetchingError || state.paymentDetailsError;
  const currentBanks = tabIndex === 0 ? personalBanks : businessBanks;
  const isSearching = state.searchTerm.length > 0;
  const searchResults = isSearching
    ? state.bankList
    : currentBanks;

  // Top banks (popular, first 8 for grid)
  const popularBanks = currentBanks
    .filter((b) => b.popularBank)
    .slice(0, 8);

  const handleBankPress = useCallback(
    (bank: BankInstitution) => {
      if (!bank.enabled) {
        return;
      }
      dispatch({ type: 'SET_SELECTED_BANK', payload: bank });
      selectBank(bank);
    },
    [dispatch, selectBank]
  );

  const handleRetry = useCallback(async () => {
    dispatch({ type: 'SET_BANK_FETCHING_ERROR', payload: null });
    dispatch({ type: 'SET_PAYMENT_DETAILS_ERROR', payload: null });
    await getPaymentDetails();
    await fetchBanks();
  }, [dispatch, getPaymentDetails, fetchBanks]);

  const gridItemWidth = (width - Spacing.large * 2 - Spacing.large * 3) / 4;
  const gridItemStyle = useMemo(
    () => ({ width: gridItemWidth, marginBottom: Spacing.large }),
    [gridItemWidth]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader
          title="Select your bank"
          onBack={onBack}
          showHelp={!!onHelp}
          onHelp={onHelp}
        />
        <View style={{ height: height * 0.6 }}>
          <FetchingBankLoader />
        </View>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader
          title="Select your bank"
          onBack={onBack}
          showHelp={!!onHelp}
          onHelp={onHelp}
        />
        <View style={{ height: height * 0.6 }}>
          <ErrorWidget
            message={
              state.bankFetchingError?.message ||
              state.paymentDetailsError?.message
            }
            onRetry={handleRetry}
          />
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

  return (
    <View style={styles.container}>
      <BottomSheetHeader
        title="Select your bank"
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
            <BankTabBar selectedIndex={tabIndex} onTabChange={setTabIndex} />
          </View>
          <View style={styles.spacer} />
          <View style={styles.infoBannerContainer}>
            <InfoWidget
              message="Ensure the selected bank's app is installed on your phone"
              variant="warning"
            />
          </View>
          <View style={styles.spacer} />
        </>
      )}

      {isSearching ? (
        <>
          <View style={styles.resultsHeaderContainer}>
            <Text style={styles.resultsLabel}>RESULTS</Text>
          </View>
          <BottomSheetFlatList
            data={searchResults}
            keyExtractor={(item: BankInstitution) => item.id}
            renderItem={renderListItem}
            contentContainerStyle={[styles.listContent, styles.searchListContent]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No results</Text>
                <Text style={styles.emptySubtitle}>
                  No results for "{state.searchTerm}" in banks. Try using
                  different keywords.
                </Text>
              </View>
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
                  <Text style={styles.allBanksLabel}>ALL BANKS</Text>
                  {state.bankList.map((bank) => (
                    <BankListItem
                      key={bank.id}
                      bank={bank}
                      isSelected={state.selectedBank?.id === bank.id}
                      onPress={handleBankPress}
                    />
                  ))}
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
  tabBarContainer: {
    paddingHorizontal: Spacing.large,
  },
  gridContent: {
    paddingHorizontal: Spacing.large,
  },
  gridRow: {
    justifyContent: 'space-between',
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
    paddingHorizontal: Spacing.large,
    borderTopWidth: 1,
    borderTopColor: Colors.grey200,
    marginTop: Spacing.large,
    paddingTop: Spacing.large,
  },
  allBanksLabel: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.grey500,
    letterSpacing: 1,
    marginBottom: Spacing.small,
  },
  resultsHeaderContainer: {
    paddingHorizontal: Spacing.large,
    marginBottom: Spacing.small,
  },
  resultsLabel: {
    fontFamily: 'Figtree',
    fontSize: 12,
    fontWeight: '700',
    color: Colors.grey500,
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.large,
  },
  emptyTitle: {
    fontFamily: 'Figtree',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: Spacing.small,
  },
  emptySubtitle: {
    fontFamily: 'Figtree',
    fontSize: 14,
    fontWeight: '400',
    color: Colors.grey500,
    textAlign: 'center',
    lineHeight: 20,
  },
});
