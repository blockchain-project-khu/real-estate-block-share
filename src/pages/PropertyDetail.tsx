
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ArrowUp } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fundingPercentage, setFundingPercentage] = useState([5]);

  const mockProperty = {
    id: 1,
    title: "강남구 신축 오피스텔",
    location: "서울 강남구 역삼동 123-45",
    price: 50000,
    monthlyRent: 250,
    fundingProgress: 75,
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
    propertyType: "오피스텔",
    description: "강남 중심가에 위치한 신축 오피스텔입니다. 교통이 편리하고 상권이 발달되어 있어 임대 수요가 높습니다.",
    totalArea: "84.2㎡",
    floor: "15층 중 12층",
    buildingAge: "신축",
    facilities: ["엘리베이터", "주차장", "보안시설", "관리사무소"],
    expectedYield: 6.0
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const calculateInvestment = () => {
    const percentage = fundingPercentage[0];
    const investmentAmount = (mockProperty.price * percentage) / 100;
    const monthlyReturn = (mockProperty.monthlyRent * percentage) / 100;
    return { investmentAmount, monthlyReturn, percentage };
  };

  const handleInvestment = () => {
    const { investmentAmount, monthlyReturn, percentage } = calculateInvestment();
    toast({
      title: "투자 신청 완료",
      description: `${percentage}% (${formatPrice(investmentAmount)}만원) 투자가 신청되었습니다.`,
    });
  };

  const investment = calculateInvestment();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowUp className="rotate-[-90deg]" size={16} />
          매물 목록으로 돌아가기
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 매물 정보 */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img 
                  src={mockProperty.imageUrl} 
                  alt={mockProperty.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600">
                  {mockProperty.propertyType}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl">{mockProperty.title}</CardTitle>
                <CardDescription className="text-lg">{mockProperty.location}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">매물 가격</span>
                    <p className="text-xl font-bold">{formatPrice(mockProperty.price)}만원</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">월 임대수익</span>
                    <p className="text-xl font-bold text-green-600">{formatPrice(mockProperty.monthlyRent)}만원</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">전용면적</span>
                    <p className="text-lg font-semibold">{mockProperty.totalArea}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">층수</span>
                    <p className="text-lg font-semibold">{mockProperty.floor}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">매물 설명</h3>
                  <p className="text-gray-700">{mockProperty.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">부대시설</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockProperty.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary">{facility}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">펀딩 현황</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>진행률</span>
                      <span className="font-semibold">{mockProperty.fundingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${mockProperty.fundingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 투자 정보 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>투자하기</CardTitle>
                <CardDescription>5% ~ 100%까지 투자 가능합니다</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">투자 비율</span>
                    <span className="text-sm font-bold text-blue-600">{fundingPercentage[0]}%</span>
                  </div>
                  <Slider
                    value={fundingPercentage}
                    onValueChange={setFundingPercentage}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">투자 금액</span>
                    <span className="font-bold text-lg">{formatPrice(investment.investmentAmount)}만원</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">월 예상 수익</span>
                    <span className="font-bold text-lg text-green-600">{formatPrice(investment.monthlyReturn)}만원</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">예상 수익률</span>
                    <span className="font-bold text-lg">{mockProperty.expectedYield}%</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  onClick={handleInvestment}
                >
                  {investment.percentage}% 투자하기
                </Button>
                
                <div className="text-xs text-gray-500 text-center">
                  * 실제 수익률은 시장 상황에 따라 변동될 수 있습니다.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
