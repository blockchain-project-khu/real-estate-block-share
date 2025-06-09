
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  walletType: 'kaia' | 'metamask' | null;
}

declare global {
  interface Window {
    klaytn?: any;
    ethereum?: any;
  }
}
