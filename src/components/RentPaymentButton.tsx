
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { rentApi } from '@/api';
import { distributeRent } from '@/utils/blockchain';
import { useWallet } from '@/hooks/useWallet';

interface RentPaymentButtonProps {
  propertyId: number;
  propertyName: string;
  monthlyRent: number;
  onPaymentSuccess: () => void;
}

const RentPaymentButton: React.FC<RentPaymentButtonProps> = ({
  propertyId,
  propertyName,
  monthlyRent,
  onPaymentSuccess
}) => {
  const [isPayingRent, setIsPayingRent] = useState(false);
  const { wallet } = useWallet();

  const handlePayRent = async () => {
    if (!wallet.isConnected) {
      toast({
        title: "지갑 연결 필요",
        description: "월세 납부를 위해 지갑을 먼저 연결해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsPayingRent(true);
    
    try {
      console.log(`월세 납부 시작: 매물 ID ${propertyId}`);
      console.log('지갑 상태:', wallet);
      
      // 1. 블록체인 트랜잭션 실행 (월세 배분) - 카이아 결제창이 여기서 표시되어야 함
      console.log('블록체인 월세 배분 트랜잭션 시작...');
      const tx = await distributeRent(propertyId);
      console.log('블록체인 월세 배분 완료:', tx);
      
      // 2. 백엔드 API 호출
      console.log('백엔드 월세 납부 API 호출 시작...');
      const paymentResponse = await rentApi.payRent(propertyId);
      console.log('백엔드 월세 납부 완료:', paymentResponse);
      
      toast({
        title: "월세 납부 완료",
        description: `${propertyName}의 월세 ${monthlyRent.toLocaleString()}원이 성공적으로 납부되었습니다.`,
      });
      
      onPaymentSuccess();
    } catch (error) {
      console.error('월세 납부 실패:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        propertyId,
        walletConnected: wallet.isConnected,
        walletAddress: wallet.address
      });
      
      toast({
        title: "월세 납부 실패",
        description: error instanceof Error ? error.message : "월세 납부 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsPayingRent(false);
    }
  };

  return (
    <Button 
      onClick={handlePayRent}
      disabled={isPayingRent || !wallet.isConnected}
      className="bg-green-600 hover:bg-green-700"
    >
      {isPayingRent ? '납부 중...' : '월세 납부'}
    </Button>
  );
};

export default RentPaymentButton;
