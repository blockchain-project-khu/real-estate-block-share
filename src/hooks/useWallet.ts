
import { useState, useEffect } from 'react';
import { WalletState } from '@/types/wallet';
import { getAccount, isKaiaWallet, isMetamask, disconnectWallet } from '@/utils/wallet';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    walletType: null,
  });

  // 지갑 연결 상태 복원
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    const savedType = localStorage.getItem('walletType') as 'kaia' | 'metamask' | null;
    
    if (savedAddress && savedType) {
      setWallet({
        isConnected: true,
        address: savedAddress,
        walletType: savedType,
      });
    }
  }, []);

  const connectWallet = async (type: 'kaia' | 'metamask') => {
    try {
      if (type === 'kaia' && !isKaiaWallet()) {
        throw new Error('Kaia Wallet이 설치되어 있지 않습니다.');
      }
      if (type === 'metamask' && !isMetamask()) {
        throw new Error('MetaMask가 설치되어 있지 않습니다.');
      }

      const address = await getAccount();
      if (address) {
        const newWalletState = {
          isConnected: true,
          address,
          walletType: type,
        };
        
        setWallet(newWalletState);
        
        // 로컬 스토리지에 저장
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', type);
        localStorage.setItem('walletConnected', 'true');
        
        return address;
      } else {
        throw new Error('지갑 연결에 실패했습니다.');
      }
    } catch (error) {
      console.error('지갑 연결 오류:', error);
      throw error;
    }
  };

  const disconnect = () => {
    disconnectWallet();
    setWallet({
      isConnected: false,
      address: null,
      walletType: null,
    });
  };

  return {
    wallet,
    connectWallet,
    disconnect,
  };
};
