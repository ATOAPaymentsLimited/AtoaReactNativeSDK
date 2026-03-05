export interface BankMedia {
  source: string;
  type: string;
}

export interface BankInstitution {
  id: string;
  name: string;
  fullName: string;
  media: BankMedia[];
  features: string[];
  orderBy: number;
  transactionAmountLimit: number;
  businessBank: boolean;
  popularBank: boolean;
  enabled: boolean;
}

export function getBankIcon(bank: BankInstitution): string | undefined {
  return bank.media.find((m) => m.type === 'icon')?.source;
}

export function getBankLogo(bank: BankInstitution): string | undefined {
  return bank.media.find((m) => m.type === 'logo')?.source;
}
