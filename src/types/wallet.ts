
export type WalletType = 'metamask' | 'kaia' | null;

export interface WalletState {
  address: string | null;
  type: WalletType;
  isConnected: boolean;
  chainId: number | null;
  error: string | null;
}

export interface WalletContextType {
  wallet: WalletState;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

// Window 객체에 지갑 관련 속성 추가
declare global {
  interface Window {
    ethereum?: any;
    klaytn?: any;
  }
}
