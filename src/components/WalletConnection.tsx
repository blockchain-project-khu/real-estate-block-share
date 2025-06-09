
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { toast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

const WalletConnection = () => {
  const { wallet, connectWallet, disconnect } = useWallet();

  const handleConnect = async (type: 'kaia' | 'metamask') => {
    try {
      await connectWallet(type);
      toast({
        title: "지갑 연결 성공",
        description: `${type === 'kaia' ? 'Kaia Wallet' : 'MetaMask'}이 성공적으로 연결되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "지갑 연결 실패",
        description: error instanceof Error ? error.message : "지갑 연결에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: "지갑 연결 해제",
      description: "지갑 연결이 해제되었습니다.",
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet size={20} />
          지갑 연결
        </CardTitle>
        <CardDescription>
          블록체인 기능을 사용하려면 지갑을 연결해주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {wallet.isConnected ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">연결된 지갑</p>
                  <p className="text-sm text-green-600">{formatAddress(wallet.address!)}</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {wallet.walletType === 'kaia' ? 'Kaia Wallet' : 'MetaMask'}
                </Badge>
              </div>
            </div>
            <Button 
              onClick={handleDisconnect}
              variant="outline"
              className="w-full"
            >
              지갑 연결 해제
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              onClick={() => handleConnect('metamask')}
              className="w-full"
              variant="outline"
            >
              MetaMask 연결
            </Button>
            <Button 
              onClick={() => handleConnect('kaia')}
              className="w-full"
              variant="outline"
            >
              Kaia Wallet 연결
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletConnection;
