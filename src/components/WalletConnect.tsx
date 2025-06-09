
import React from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import { WalletType } from '../types/wallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Wallet, X } from 'lucide-react';

export const WalletConnect: React.FC = () => {
  const { wallet, connect, disconnect } = useWalletContext();

  const handleConnect = async (type: WalletType) => {
    try {
      await connect(type);
      toast({
        title: "지갑 연결 성공",
        description: `${type === 'metamask' ? 'MetaMask' : 'Kaia Wallet'}이 성공적으로 연결되었습니다.`,
      });
    } catch (error) {
      toast({
        title: "지갑 연결 실패",
        description: "지갑 연결 중 오류가 발생했습니다.",
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

  if (wallet.isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet size={20} />
            연결된 지갑
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">지갑 주소</p>
            <p className="font-mono text-sm break-all bg-muted p-2 rounded">
              {wallet.address}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">지갑 유형</p>
            <p className="text-sm">
              {wallet.type === 'metamask' ? 'MetaMask' : 'Kaia Wallet'}
            </p>
          </div>
          {wallet.chainId && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">네트워크 ID</p>
              <p className="text-sm">{wallet.chainId}</p>
            </div>
          )}
          <Button 
            onClick={handleDisconnect}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <X size={16} />
            연결 해제
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
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
        <Button
          onClick={() => handleConnect('metamask')}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          MetaMask 연결
        </Button>
        <Button
          onClick={() => handleConnect('kaia')}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          Kaia Wallet 연결
        </Button>
        {wallet.error && (
          <p className="text-sm text-destructive mt-2">{wallet.error}</p>
        )}
      </CardContent>
    </Card>
  );
};
