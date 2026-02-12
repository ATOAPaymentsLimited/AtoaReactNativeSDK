import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { useBankInstitutions } from '../../hooks/useBankInstitutions';
import type { BankInstitution } from '../../types/bank';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { BottomSheetHeader } from '../shared/BottomSheetHeader';
import { FetchingBankLoader } from '../shared/FetchingBankLoader';
import { ErrorWidget } from '../shared/ErrorWidget';
import { AnimatedSearchField } from './AnimatedSearchField';
import { BankTabBar } from './BankTabBar';
import { BankGridItem } from './BankGridItem';
import { BankListItem } from './BankListItem';

interface BankSelectionScreenProps {
  onBack?: () => void;
  onClose: () => void;
}

export function BankSelectionScreen({
  onBack,
  onClose,
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
  const { width } = useWindowDimensions();

  const isLoading = state.isLoading || state.isLoadingDetails;
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
  const remainingBanks = currentBanks.filter(
    (b) => !popularBanks.find((p) => p.id === b.id)
  );

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
          onClose={onClose}
          onBack={onBack}
        />
        <FetchingBankLoader />
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.container}>
        <BottomSheetHeader
          title="Select your bank"
          onClose={onClose}
          onBack={onBack}
        />
        <ErrorWidget
          message={
            state.bankFetchingError?.message ||
            state.paymentDetailsError?.message
          }
          onRetry={handleRetry}
        />
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
        onClose={onClose}
        onBack={onBack}
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
        </>
      )}

      {isSearching ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={[{ type: 'grid' as const }, { type: 'list' as const }]}
          keyExtractor={(item) => item.type}
          renderItem={({ item }) => {
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
                  {remainingBanks.map((bank) => (
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
    paddingBottom: Spacing.huge,
  },
  allBanksContainer: {
    paddingHorizontal: Spacing.large,
    borderTopWidth: 1,
    borderTopColor: Colors.grey200,
    marginTop: Spacing.large,
    paddingTop: Spacing.large,
  },
});
