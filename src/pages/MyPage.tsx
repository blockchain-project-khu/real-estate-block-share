import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { ArrowDown, ArrowUp, Edit } from 'lucide-react';
import { fundingApi, propertyApi } from '@/api';
import { FundingResponse, PropertyResponse } from '@/api/types';

const MyPage = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [showCompletedRents, setShowCompletedRents] = useState(false);
  const [myFundings, setMyFundings] = useState<FundingResponse[]>([]);
  const [fundingProperties, setFundingProperties] = useState<Record<number, PropertyResponse>>({});
  const [myProperties, setMyProperties] = useState<PropertyResponse[]>([]);
  const [propertyFundings, setPropertyFundings] = useState<Record<number, FundingResponse[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('MyPage: 데이터 로딩 시작');
        
        // 내가 참여한 펀딩 목록 로드 (펀딩 현황용)
        console.log('MyPage: 내 펀딩 목록 조회 중...');
        const fundings = await fundingApi.getMyFundings();
        console.log('MyPage: 내 펀딩 목록 응답:', fundings);
        setMyFundings(fundings);
        
        // 펀딩에 대응하는 매물 정보 로드
        const fundingPropertyPromises = fundings.map(funding => {
          console.log('MyPage: 펀딩 매물 정보 조회 중, propertyId:', funding.propertyId, 'typeof:', typeof funding.propertyId);
          return propertyApi.getById(funding.propertyId);
        });
        const fundingPropertyResults = await Promise.all(fundingPropertyPromises);
        
        const fundingPropertyMap: Record<number, PropertyResponse> = {};
        fundingPropertyResults.forEach(property => {
          console.log('MyPage: 펀딩 매물 정보 로드됨:', property);
          fundingPropertyMap[property.id] = property;
        });
        setFundingProperties(fundingPropertyMap);

        // 내가 등록한 매물 목록 로드 (판매 현황용)
        console.log('MyPage: 내 매물 목록 조회 중...');
        const properties = await propertyApi.getMy();
        console.log('MyPage: 내 매물 목록 응답:', properties);
        setMyProperties(properties);
        
        // 각 매물에 대한 펀딩 현황 로드 (판매 현황용)
        console.log('MyPage: 각 매물별 펀딩 현황 조회 시작');
        const propertyFundingPromises = properties.map(property => {
          console.log('MyPage: 매물 펀딩 현황 조회 중, propertyId:', property.id, 'typeof:', typeof property.id);
          return fundingApi.getPropertyFundings(property.id);
        });
        const propertyFundingResults = await Promise.all(propertyFundingPromises);
        
        const propertyFundingMap: Record<number, FundingResponse[]> = {};
        properties.forEach((property, index) => {
          console.log('MyPage: 매물 펀딩 현황 로드됨, propertyId:', property.id, 'fundings:', propertyFundingResults[index]);
          propertyFundingMap[property.id] = propertyFundingResults[index];
        });
        setPropertyFundings(propertyFundingMap);
        
        console.log('MyPage: 데이터 로딩 완료');
        
      } catch (error) {
        console.error('MyPage: 데이터 로딩 실패:', error);
        toast({
          title: "데이터 로딩 실패",
          description: "데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('ko-KR').format(numPrice);
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const mockInvestments = [
    {
      id: 'invest1',
      propertyName: '강남구 신축 오피스텔',
      location: '서울 강남구 역삼동',
      investmentAmount: 2500,
      investmentRatio: 5,
      monthlyReturn: 12.5,
      totalReturn: 150,
      investmentDate: '2024-01-15',
      status: '수익 발생 중',
      totalFundingProgress: 100,
      isEarning: true
    },
    {
      id: 'invest2',
      propertyName: '홍대 상가 건물',
      location: '서울 마포구 홍익로',
      investmentAmount: 8000,
      investmentRatio: 10,
      monthlyReturn: 40,
      totalReturn: 200,
      investmentDate: '2024-02-20',
      status: '펀딩 진행 중',
      totalFundingProgress: 75,
      isEarning: false
    }
  ];

  const mockSales = [
    {
      id: 'sale1',
      propertyName: '판교 신축 아파트',
      location: '경기 성남시 분당구',
      totalPrice: 120000,
      currentFunding: 90,
      totalInvestors: 15,
      monthlyRent: 500,
      registrationDate: '2024-03-01',
      status: '펀딩 진행 중'
    },
    {
      id: 'sale2',
      propertyName: '여의도 프리미엄 오피스',
      location: '서울 영등포구 여의도동',
      totalPrice: 200000,
      currentFunding: 100,
      totalInvestors: 20,
      monthlyRent: 800,
      registrationDate: '2024-02-15',
      status: '펀딩 완료'
    }
  ];

  const mockRentApplications = [
    {
      id: 'rent1',
      propertyName: '강남구 신축 오피스텔',
      location: '서울 강남구 역삼동',
      monthlyRent: 250,
      applicationDate: '2024-01-10',
      fundingProgress: 100,
      status: '임대 중',
      paymentHistory: [
        { date: '2024-02-01', amount: 250, status: '완료' },
        { date: '2024-03-01', amount: 250, status: '완료' },
        { date: '2024-04-01', amount: 250, status: '완료' },
        { date: '2024-05-01', amount: 250, status: '완료' },
        { date: '2024-06-01', amount: 250, status: '예정' }
      ]
    },
    {
      id: 'rent2',
      propertyName: '송파구 투룸 원룸',
      location: '서울 송파구 잠실동',
      monthlyRent: 180,
      applicationDate: '2024-03-15',
      fundingProgress: 75,
      status: '펀딩 대기',
      paymentHistory: []
    }
  ];

  const completedRents = mockRentApplications.filter(rent => rent.fundingProgress === 100);
  const pendingRents = mockRentApplications.filter(rent => rent.fundingProgress < 100);

  const handleEditInvestment = (investment: any) => {
    navigate(`/property/${investment.id}/invest`, {
      state: {
        percentage: investment.investmentRatio,
        investmentAmount: investment.investmentAmount,
        monthlyReturn: investment.monthlyReturn,
        propertyName: investment.propertyName,
        isEdit: true
      }
    });
  };

  const handleRentPayment = (rentId: string) => {
    toast({
      title: "월세 납부 완료",
      description: "월세가 성공적으로 납부되었습니다.",
    });
  };

  const handleStatusChange = (saleId: string, newStatus: string) => {
    toast({
      title: "매물 상태 변경 완료",
      description: `매물 상태가 "${newStatus}"로 변경되었습니다.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">데이터를 불러오는 중...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">나의 투자 현황을 확인하세요</p>
        </div>

        <Tabs defaultValue="investments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="investments">펀딩 현황</TabsTrigger>
            <TabsTrigger value="sales">판매 현황</TabsTrigger>
            <TabsTrigger value="rents">월세 납부</TabsTrigger>
          </TabsList>

          {/* 펀딩 현황 - 내가 참여한 펀딩 목록 (/fundings/me) */}
          <TabsContent value="investments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>나의 펀딩 현황</CardTitle>
                <CardDescription>투자한 매물들의 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myFundings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    참여한 펀딩이 없습니다.
                  </div>
                ) : (
                  myFundings.map((funding) => {
                    const property = fundingProperties[funding.propertyId];
                    if (!property) return null;
                    
                    return (
                      <Collapsible key={funding.fundingId}>
                        <CollapsibleTrigger 
                          className="w-full"
                          onClick={() => toggleItem(funding.fundingId.toString())}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="text-left">
                                  <h3 className="font-semibold">{property.name}</h3>
                                  <p className="text-sm text-gray-600">{property.address}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge className={funding.status === 'APPROVED' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                      {funding.status === 'APPROVED' ? '승인됨' : funding.status === 'REQUESTED' ? '대기 중' : funding.status}
                                    </Badge>
                                    <Badge variant="outline">
                                      펀딩 {funding.amount}%
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <div>
                                    <p className="font-bold">{formatPrice((parseInt(property.price) * funding.amount) / 100)}원</p>
                                    <p className="text-sm text-gray-600">{funding.amount}% 투자</p>
                                  </div>
                                  {openItems[funding.fundingId.toString()] ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <Card className="mt-2 bg-gray-50">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div>
                                  <span className="text-gray-600">펀딩 ID</span>
                                  <p className="font-semibold">{funding.fundingId}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">월 수익 예상</span>
                                  <p className="font-semibold text-green-600">
                                    {formatPrice((property.monthlyRent * funding.amount) / 100)}원
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-600">매물 상태</span>
                                  <p className="font-semibold">{property.status}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">펀딩 상태</span>
                                  <p className={`font-semibold ${funding.status === 'APPROVED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {funding.status === 'APPROVED' ? '승인됨' : funding.status === 'REQUESTED' ? '대기 중' : funding.status}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mb-4">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm text-gray-600">전체 펀딩 진행률</span>
                                  <span className="text-sm font-semibold">{property.currentFundingPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${property.currentFundingPercent === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                                    style={{ width: `${property.currentFundingPercent}%` }}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 판매 현황 - 내가 등록한 매물별 펀딩 현황 (/fundings/property/{propertyId}) */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>나의 판매 현황</CardTitle>
                <CardDescription>등록한 매물들의 펀딩 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myProperties.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    등록한 매물이 없습니다.
                  </div>
                ) : (
                  myProperties.map((property) => {
                    const fundings = propertyFundings[property.id] || [];
                    
                    return (
                      <Collapsible key={property.id}>
                        <CollapsibleTrigger 
                          className="w-full"
                          onClick={() => toggleItem(`property-${property.id}`)}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div className="text-left">
                                  <h3 className="font-semibold">{property.name}</h3>
                                  <p className="text-sm text-gray-600">{property.address}</p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge className={property.currentFundingPercent === 100 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                      {property.currentFundingPercent === 100 ? '펀딩 완료' : '펀딩 진행 중'}
                                    </Badge>
                                    <Badge variant="outline">
                                      {fundings.length}명 참여
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                  <div>
                                    <p className="font-bold">{property.currentFundingPercent}% 펀딩</p>
                                    <p className="text-sm text-gray-600">{formatPrice(property.price)}원</p>
                                  </div>
                                  {openItems[`property-${property.id}`] ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <Card className="mt-2 bg-gray-50">
                            <CardContent className="p-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div>
                                  <span className="text-gray-600">매물 타입</span>
                                  <p className="font-semibold">{property.type}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">매물 상태</span>
                                  <p className="font-semibold">{property.status}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">월 임대료</span>
                                  <p className="font-semibold text-green-600">{formatPrice(property.monthlyRent)}원</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">펀딩 진행률</span>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                    <div 
                                      className={`h-2 rounded-full ${property.currentFundingPercent === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                                      style={{ width: `${property.currentFundingPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {fundings.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="font-semibold mb-3">펀딩 참여자 목록</h4>
                                  <div className="space-y-2">
                                    {fundings.map((funding) => (
                                      <div key={funding.fundingId} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                        <div>
                                          <span className="font-medium">사용자 #{funding.userId}</span>
                                          <p className="text-sm text-gray-600">펀딩 ID: {funding.fundingId}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="font-bold">{funding.amount}%</span>
                                          <Badge className={funding.status === 'APPROVED' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                            {funding.status === 'APPROVED' ? '승인' : funding.status === 'REQUESTED' ? '대기' : funding.status}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {fundings.length === 0 && (
                                <div className="text-sm text-gray-600 mt-4 text-center py-4">
                                  아직 펀딩 참여자가 없습니다.
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 월세 납부 - 기존 목업 데이터 유지 */}
          <TabsContent value="rents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>월세 납부 현황</CardTitle>
                <CardDescription>임대한 매물의 월세 납부 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Button 
                    variant={!showCompletedRents ? "default" : "outline"}
                    onClick={() => setShowCompletedRents(false)}
                  >
                    펀딩 대기 중 ({pendingRents.length})
                  </Button>
                  <Button 
                    variant={showCompletedRents ? "default" : "outline"}
                    onClick={() => setShowCompletedRents(true)}
                  >
                    월세 납부 중 ({completedRents.length})
                  </Button>
                </div>

                {!showCompletedRents ? (
                  // 펀딩 대기 중인 임대 신청
                  <div className="space-y-4">
                    {pendingRents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        펀딩 대기 중인 임대 신청이 없습니다.
                      </div>
                    ) : (
                      pendingRents.map((rent) => (
                        <Card key={rent.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold">{rent.propertyName}</h3>
                                <p className="text-sm text-gray-600">{rent.location}</p>
                                <p className="text-sm text-gray-600">신청일: {rent.applicationDate}</p>
                                <Badge className="bg-yellow-100 text-yellow-800 mt-1">
                                  펀딩 {rent.fundingProgress}% - 대기 중
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">{formatPrice(rent.monthlyRent)}만원</p>
                                <p className="text-sm text-gray-500">월 임대료</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                ) : (
                  // 펀딩 완료된 임대 (월세 납부 중)
                  <div className="space-y-4">
                    {completedRents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        월세 납부 중인 임대가 없습니다.
                      </div>
                    ) : (
                      completedRents.map((rent) => (
                        <Collapsible key={rent.id}>
                          <CollapsibleTrigger 
                            className="w-full"
                            onClick={() => toggleItem(rent.id)}
                          >
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                  <div className="text-left">
                                    <h3 className="font-semibold">{rent.propertyName}</h3>
                                    <p className="text-sm text-gray-600">{rent.location}</p>
                                    <Badge className="bg-green-100 text-green-800 mt-1">
                                      임대 중 - 자동 납부
                                    </Badge>
                                  </div>
                                  <div className="text-right flex items-center gap-4">
                                    <div>
                                      <p className="font-bold text-lg">{formatPrice(rent.monthlyRent)}만원</p>
                                      <p className="text-sm text-gray-600">월 임대료</p>
                                    </div>
                                    {openItems[rent.id] ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </CollapsibleTrigger>
                          
                          <CollapsibleContent>
                            <Card className="mt-2 bg-gray-50">
                              <CardContent className="p-4">
                                <h4 className="font-semibold mb-3">월세 납부 내역</h4>
                                <div className="space-y-2">
                                  {rent.paymentHistory.map((payment, index) => (
                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                                      <div>
                                        <span className="font-medium">{payment.date}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold">{formatPrice(payment.amount)}만원</span>
                                        <Badge className={payment.status === '완료' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                          {payment.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {rent.paymentHistory.some(p => p.status === '예정') && (
                                  <div className="mt-4 pt-4 border-t">
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleRentPayment(rent.id)}
                                    >
                                      다음 월세 미리 납부
                                    </Button>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </CollapsibleContent>
                        </Collapsible>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyPage;
