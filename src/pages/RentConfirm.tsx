
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ArrowUp } from 'lucide-react';

const RentConfirm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConfirming, setIsConfirming] = useState(false);
  
  const { propertyName, monthlyRent, fundingProgress } = location.state || {};

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      toast({
        title: "임대 신청 완료",
        description: `${propertyName} 임대 신청이 완료되었습니다. ${fundingProgress === 100 ? '펀딩이 완료된 매물이므로 자동 월세 납부가 시작됩니다.' : '펀딩 완료 후 월세 납부가 시작됩니다.'}`,
      });
      setIsConfirming(false);
      navigate('/mypage');
    }, 2000);
  };

  if (!propertyName || !monthlyRent) {
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
            <CardTitle className="text-2xl text-center">임대 신청 확인</CardTitle>
            <CardDescription className="text-center">
              아래 내용을 확인하고 임대 신청을 진행해주세요
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{propertyName}</h3>
              <Badge className="bg-green-600">임대 신청</Badge>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">월 임대료</span>
                <span className="text-2xl font-bold text-green-600">{formatPrice(monthlyRent)}만원</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">펀딩 진행률</span>
                <span className={`text-xl font-bold ${fundingProgress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                  {fundingProgress}%
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">월세 납부 상태</span>
                <span className={`text-lg font-bold ${fundingProgress === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {fundingProgress === 100 ? '자동 납부 예정' : '펀딩 완료 후 시작'}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">⚠️ 임대 안내사항</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• 펀딩이 100% 완료되어야 임대가 시작됩니다</li>
                <li>• 펀딩 완료일부터 매월 자동으로 월세가 납부됩니다</li>
                <li>• 임대 기간은 최소 1년 이상입니다</li>
                <li>• 월세는 매월 같은 날짜에 자동 결제됩니다</li>
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
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleConfirm}
                disabled={isConfirming}
              >
                {isConfirming ? '처리중...' : '임대 신청 확인'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RentConfirm;
