
import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { WalletType, WalletState } from '../types/wallet';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    type: null,
    isConnected: false,
    chainId: null,
    error: null,
  });

  const connect = useCallback(async (type: WalletType) => {
    try {
      let provider;
      if (type === 'metamask' && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else if (type === 'kaia' && window.klaytn) {
        provider = new ethers.providers.Web3Provider(window.klaytn);
        await window.klaytn.enable();
      } else {
        throw new Error(`${type === 'metamask' ? 'MetaMask' : 'Kaia Wallet'}이 설치되어 있지 않습니다.`);
      }

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setWallet({
        address,
        type,
        isConnected: true,
        chainId: network.chainId,
        error: null,
      });
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: error.message,
      }));
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      type: null,
      isConnected: false,
      chainId: null,
      error: null,
    });
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    try {
      if (wallet.type === 'metamask' && window.ethereum) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(chainId) }],
        });
      } else if (wallet.type === 'kaia' && window.klaytn) {
        await window.klaytn.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(chainId) }],
        });
      }
    } catch (error: any) {
      setWallet(prev => ({
        ...prev,
        error: error.message,
      }));
    }
  }, [wallet.type]);

  return { wallet, connect, disconnect, switchNetwork };
};
