
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ArrowUp } from 'lucide-react';
import { fundingApi } from '@/api';
import { useWallet } from '@/hooks/useWallet';
import { buyShares, calculateShareCount } from '@/utils/blockchain';

const InvestmentConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConfirming, setIsConfirming] = useState(false);
  const { wallet } = useWallet();
  
  const { percentage: initialPercentage, investmentAmount: initialInvestmentAmount, monthlyReturn: initialMonthlyReturn, propertyName, isEdit = false } = location.state || {};
  
  const [editablePercentage, setEditablePercentage] = useState(initialPercentage || 5);
  
  const currentPercentage = isEdit ? editablePercentage : initialPercentage;
  
  const propertyBasePrice = 50000;
  const monthlyRentTotal = 250;
  
  const calculatedInvestmentAmount = (propertyBasePrice * currentPercentage) / 100;
  const calculatedMonthlyReturn = (monthlyRentTotal * currentPercentage) / 100;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handlePercentageChange = (value: string) => {
    const numValue = parseInt(value);
    if (numValue >= 5 && numValue <= 100 && numValue % 5 === 0) {
      setEditablePercentage(numValue);
    }
  };

  const handleConfirm = async () => {
    if (!id) return;
    
    // 지갑 연결 확인
    if (!wallet.isConnected) {
      toast({
        title: "지갑 연결 필요",
        description: "투자하려면 먼저 지갑을 연결해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setIsConfirming(true);
    
    try {
      if (!isEdit) {
        // 블록체인 트랜잭션 실행
        const shareCount = calculateShareCount(currentPercentage);
        console.log(`투자 시작: ${currentPercentage}% (${shareCount}개 지분)`);
        
        const tx = await buyShares(parseInt(id), shareCount);
        console.log('블록체인 트랜잭션 완료:', tx);
        
        // 백엔드에 데이터 저장
        const fundingId = await fundingApi.create(parseInt(id), currentPercentage);
        
        toast({
          title: "투자 신청 완료",
          description: `${currentPercentage}% (${formatPrice(calculatedInvestmentAmount)}만원) 투자가 완료되었습니다.`,
        });
        
        console.log('Created funding ID:', fundingId);
      } else {
        toast({
          title: "투자 비율 수정 완료",
          description: `${currentPercentage}% (${formatPrice(calculatedInvestmentAmount)}만원) 수정이 완료되었습니다.`,
        });
      }
      
      navigate('/mypage');
    } catch (error) {
      console.error('투자 처리 실패:', error);
      toast({
        title: isEdit ? "투자 비율 수정 실패" : "투자 신청 실패",
        description: error instanceof Error ? error.message : "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  if ((!initialPercentage || !initialInvestmentAmount) && !isEdit) {
    navigate(-1);
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowUp className="rotate-[-90deg]" size={16} />
          이전으로 돌아가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isEdit ? '투자 비율 수정' : '투자 확인'}
            </CardTitle>
            <CardDescription className="text-center">
              {isEdit ? '투자 비율을 수정하고 확인해주세요' : '아래 내용을 확인하고 투자를 진행해주세요'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 지갑 연결 상태 확인 */}
            {!wallet.isConnected && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 font-medium">⚠️ 지갑 연결이 필요합니다</p>
                <p className="text-red-600 text-sm mt-1">투자하려면 마이페이지에서 지갑을 먼저 연결해주세요.</p>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{propertyName || '강남구 신축 오피스텔'}</h3>
              <Badge className="bg-blue-600">오피스텔</Badge>
            </div>
            
            <Separator />
            
            {isEdit && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="percentage">투자 비율 수정</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      id="percentage"
                      type="number"
                      min="5"
                      max="100"
                      step="5"
                      value={editablePercentage}
                      onChange={(e) => handlePercentageChange(e.target.value)}
                      className="w-24"
                    />
                    <span className="text-lg font-semibold">%</span>
                    <span className="text-sm text-gray-600">(5% 단위로 설정 가능)</span>
                  </div>
                </div>
                <Separator />
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">투자 비율</span>
                <span className="text-2xl font-bold text-blue-600">{currentPercentage}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">지분 개수</span>
                <span className="text-xl font-bold">{calculateShareCount(currentPercentage)}개</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">투자 금액</span>
                <span className="text-xl font-bold">{formatPrice(calculatedInvestmentAmount)}만원</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">월 예상 수익</span>
                <span className="text-xl font-bold text-green-600">{formatPrice(calculatedMonthlyReturn)}만원</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">⚠️ 주의사항</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 펀딩이 100% 완료되어야 수익이 발생합니다</li>
                <li>• 실제 수익률은 시장 상황에 따라 변동될 수 있습니다</li>
                <li>• {isEdit ? '수정 후에는' : '투자 후에는'} 펀딩 완료 전까지만 변경 가능합니다</li>
                <li>• 블록체인 트랜잭션이 처리되므로 가스비가 발생할 수 있습니다</li>
              </ul>
            </div>
            
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={isConfirming}
              >
                취소
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleConfirm}
                disabled={isConfirming || (!wallet.isConnected && !isEdit)}
              >
                {isConfirming ? '처리중...' : (isEdit ? '수정 확인' : '투자 확인')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default InvestmentConfirm;
