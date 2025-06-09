
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { ArrowUp } from 'lucide-react';
import { propertyApi } from '@/api';
import { PropertyWithMockData } from '@/api/types';
import { getPropertyInfo, getSharePrice, getPendingBuyers } from '@/utils/blockchain';

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fundingPercentage, setFundingPercentage] = useState([5]);
  const [property, setProperty] = useState<PropertyWithMockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 블록체인 데이터 상태
  const [blockchainInfo, setBlockchainInfo] = useState<{
    propertyInfo: any;
    sharePrice: number;
    pendingBuyers: number;
    isLoading: boolean;
  }>({
    propertyInfo: null,
    sharePrice: 0,
    pendingBuyers: 0,
    isLoading: true
  });

  const mockImages = [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"
  ];

  const propertyTypeMap: Record<string, string> = {
    'OFFICETEL': '오피스텔',
    'APARTMENT': '아파트',
    'VILLA': '빌라',
    'OFFICE': '오피스',
    'STUDIO': '원룸',
    'COMMERCIAL': '상가'
  };

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;
      
      try {
        const apiProperty = await propertyApi.getById(parseInt(id));
        const propertyWithMockData: PropertyWithMockData = {
          ...apiProperty,
          imageUrl: apiProperty.imageUrl || mockImages[apiProperty.id % mockImages.length],
          propertyType: propertyTypeMap[apiProperty.type] || apiProperty.type,
          fundingProgress: apiProperty.currentFundingPercent,
          totalArea: `${apiProperty.supplyArea}㎡`,
          floor: `${apiProperty.totalFloors}층`,
          buildingAge: "신축",
          facilities: ["엘리베이터", "주차장", "보안시설", "관리사무소"],
          expectedYield: 6.0
        };
        setProperty(propertyWithMockData);
      } catch (error) {
        console.error('Failed to load property:', error);
        toast({
          title: "매물 로딩 실패",
          description: "매물 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  // 블록체인 데이터 로드
  useEffect(() => {
    const loadBlockchainData = async () => {
      if (!id) return;
      
      try {
        console.log('블록체인 데이터 로딩 시작:', id);
        
        const [propertyInfo, sharePrice, pendingBuyers] = await Promise.all([
          getPropertyInfo(parseInt(id)),
          getSharePrice(parseInt(id)),
          getPendingBuyers(parseInt(id))
        ]);
        
        console.log('블록체인 데이터:', { propertyInfo, sharePrice, pendingBuyers });
        
        setBlockchainInfo({
          propertyInfo,
          sharePrice,
          pendingBuyers: Number(pendingBuyers),
          isLoading: false
        });
      } catch (error) {
        console.error('블록체인 데이터 로딩 실패:', error);
        setBlockchainInfo(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadBlockchainData();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const calculateInvestment = () => {
    if (!property) return { investmentAmount: 0, monthlyReturn: 0, percentage: 0 };
    
    const percentage = fundingPercentage[0];
    const investmentAmount = (parseInt(property.price) * percentage) / 100;
    const monthlyReturn = (property.monthlyRent * percentage) / 100;
    return { investmentAmount, monthlyReturn, percentage };
  };

  const handleInvestment = () => {
    if (!property) return;
    
    const { investmentAmount, monthlyReturn, percentage } = calculateInvestment();
    navigate(`/property/${id}/invest`, {
      state: {
        percentage,
        investmentAmount,
        monthlyReturn,
        propertyName: property.name,
        isEdit: false
      }
    });
  };

  const handleRentApplication = () => {
    if (!property) return;
    
    navigate(`/property/${id}/rent`, {
      state: {
        propertyName: property.name,
        monthlyRent: property.monthlyRent,
        fundingProgress: property.fundingProgress
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">매물 정보를 불러오는 중...</div>
        </main>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">매물을 찾을 수 없습니다.</div>
        </main>
      </div>
    );
  }

  const investment = calculateInvestment();
  const remainingShares = 20 - blockchainInfo.pendingBuyers;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
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
                  src={property.imageUrl} 
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600">
                  {property.propertyType}
                </Badge>
              </div>
              
              <CardHeader>
                <CardTitle className="text-2xl">{property.name}</CardTitle>
                <CardDescription className="text-lg">{property.address}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">매물 가격</span>
                    <p className="text-xl font-bold">{formatPrice(parseInt(property.price))}원</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">월 임대수익</span>
                    <p className="text-xl font-bold text-green-600">{formatPrice(property.monthlyRent)}원</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">공급면적</span>
                    <p className="text-lg font-semibold">{property.totalArea}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">총 층수</span>
                    <p className="text-lg font-semibold">{property.floor}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">매물 설명</h3>
                  <p className="text-gray-700">{property.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">부대시설</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.facilities?.map((facility, index) => (
                      <Badge key={index} variant="secondary">{facility}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">펀딩 현황</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>진행률</span>
                      <span className="font-semibold">{property.fundingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${property.fundingProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* 블록체인 정보 추가 */}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">블록체인 정보</h3>
                  {blockchainInfo.isLoading ? (
                    <div className="text-gray-500">블록체인 데이터 로딩 중...</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">지분 가격</span>
                        <p className="text-lg font-semibold">{blockchainInfo.sharePrice.toFixed(4)} ETH</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">남은 지분</span>
                        <p className="text-lg font-semibold">{remainingShares}/20개</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">판매된 지분</span>
                        <p className="text-lg font-semibold">{blockchainInfo.pendingBuyers}개</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">블록체인 상태</span>
                        <p className="text-lg font-semibold text-blue-600">활성</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 투자 및 임대 정보 */}
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
                    <span className="font-bold text-lg">{formatPrice(investment.investmentAmount)}원</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">월 예상 수익</span>
                    <span className="font-bold text-lg text-green-600">{formatPrice(investment.monthlyReturn)}원</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">예상 수익률</span>
                    <span className="font-bold text-lg">{property.expectedYield}%</span>
                  </div>

                  {/* 블록체인 투자 정보 */}
                  {!blockchainInfo.isLoading && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">구매 지분 수</span>
                        <span className="font-bold text-lg text-blue-600">{investment.percentage / 5}개</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">지분당 가격</span>
                        <span className="font-bold text-lg">{blockchainInfo.sharePrice.toFixed(4)} ETH</span>
                      </div>
                    </>
                  )}
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

            <Card>
              <CardHeader>
                <CardTitle>임대하기</CardTitle>
                <CardDescription>이 매물을 임대하여 거주하세요</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">월 임대료</span>
                    <span className="font-bold text-lg">{formatPrice(property.monthlyRent)}원</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">펀딩 진행률</span>
                    <span className={`font-bold text-lg ${property.fundingProgress === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                      {property.fundingProgress}%
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  onClick={handleRentApplication}
                >
                  임대 신청하기
                </Button>
                
                <div className="text-xs text-gray-500 text-center">
                  * 펀딩 완료 후 월세가 자동으로 납부됩니다.
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
