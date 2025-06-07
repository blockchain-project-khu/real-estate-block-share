import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ArrowDown, ArrowUp, Edit } from 'lucide-react';
import { fundingApi, propertyApi, rentApi } from '@/api';
import { FundingResponse, PropertyResponse, RentResponse } from '@/api/types';

const MyPage = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [myFundings, setMyFundings] = useState<FundingResponse[]>([]);
  const [fundingProperties, setFundingProperties] = useState<Record<number, PropertyResponse>>({});
  const [salesProperties, setSalesProperties] = useState<PropertyResponse[]>([]);
  const [myRents, setMyRents] = useState<RentResponse[]>([]);
  const [rentProperties, setRentProperties] = useState<Record<number, PropertyResponse>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('MyPage: 데이터 로딩 시작');
        
        // 내가 참여한 펀딩 목록 로드 (펀딩 현황용)
        console.log('MyPage: 내 펀딩 목록 조회 중...');
        const fundings = await fundingApi.getMyFundings();
        console.log('MyPage: 내 펀딩 목록 응답:', fundings);
        setMyFundings(Array.isArray(fundings) ? fundings : []);
        
        // 펀딩에 대응하는 매물 정보 로드
        if (fundings && Array.isArray(fundings) && fundings.length > 0) {
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
        }

        // 판매 현황: 내가 판매 중인 매물 목록 로드
        console.log('MyPage: 판매 현황 데이터 로딩 시작');
        const salesProps = await propertyApi.getSales();
        console.log('MyPage: 판매 매물 목록 응답:', salesProps);
        setSalesProperties(Array.isArray(salesProps) ? salesProps : []);

        // 내가 임대한 매물 목록 로드 (임대료 납부 현황용)
        console.log('MyPage: 내 임대 목록 조회 중...');
        const myRentList = await rentApi.getMyRents();
        console.log('MyPage: 내 임대 목록 응답:', myRentList);
        setMyRents(Array.isArray(myRentList) ? myRentList : []);

        // 임대에 대응하는 매물 정보 로드
        if (myRentList && Array.isArray(myRentList) && myRentList.length > 0) {
          const rentPropertyPromises = myRentList.map(rent => {
            console.log('MyPage: 임대 매물 정보 조회 중, propertyId:', rent.propertyId);
            return propertyApi.getById(rent.propertyId);
          });
          const rentPropertyResults = await Promise.all(rentPropertyPromises);
          
          const rentPropertyMap: Record<number, PropertyResponse> = {};
          rentPropertyResults.forEach(property => {
            console.log('MyPage: 임대 매물 정보 로드됨:', property);
            rentPropertyMap[property.id] = property;
          });
          setRentProperties(rentPropertyMap);
        }
        
        console.log('MyPage: 데이터 로딩 완료');
        
      } catch (error) {
        console.error('MyPage: 데이터 로딩 실패:', error);
        toast({
          title: "데이터 로딩 실패",
          description: "데이터를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
        // 에러 발생 시에도 빈 배열로 초기화
        setMyFundings([]);
        setSalesProperties([]);
        setMyRents([]);
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

  const handlePayRent = async (rent: RentResponse) => {
    try {
      console.log('월세 납부 시작:', rent);
      const response = await rentApi.payRent({
        rentId: rent.rentId,
        amount: rent.monthlyRent
      });
      
      console.log('월세 납부 응답:', response);
      
      toast({
        title: "월세 납부 완료",
        description: `${formatPrice(rent.monthlyRent)}원이 납부되었습니다.`,
      });

      // 데이터 새로고침
      window.location.reload();
    } catch (error) {
      console.error('월세 납부 실패:', error);
      toast({
        title: "월세 납부 실패",
        description: "월세 납부에 실패했습니다.",
        variant: "destructive",
      });
    }
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
            <TabsTrigger value="rents">임대료 납부 현황</TabsTrigger>
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

          {/* 판매 현황 - 내가 판매 중인 매물 목록 (/property/sales) */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>나의 판매 현황</CardTitle>
                <CardDescription>판매 중인 매물들의 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {salesProperties.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    판매 중인 매물이 없습니다.
                  </div>
                ) : (
                  salesProperties.map((property) => (
                    <Card key={property.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="text-left">
                            <h3 className="font-semibold">{property.name}</h3>
                            <p className="text-sm text-gray-600">{property.address}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge className={property.currentFundingPercent === 100 ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                                {property.currentFundingPercent === 100 ? '펀딩 완료' : '펀딩 진행 중'}
                              </Badge>
                              <Badge variant="outline" className="bg-gray-100">
                                {property.type}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">{formatPrice(property.price)}원</p>
                            <p className="text-sm text-gray-600">매물 가격</p>
                            <p className="text-sm text-green-600 font-semibold mt-1">
                              월 임대료: {formatPrice(property.monthlyRent)}원
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">펀딩 진행률</span>
                            <span className="text-sm font-semibold">{property.currentFundingPercent}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${property.currentFundingPercent === 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                              style={{ width: `${property.currentFundingPercent}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-gray-200">
                          <div>
                            <span className="text-gray-600">공급면적</span>
                            <p className="font-semibold">{property.supplyArea}㎡</p>
                          </div>
                          <div>
                            <span className="text-gray-600">층수</span>
                            <p className="font-semibold">{property.totalFloors}층</p>
                          </div>
                          <div>
                            <span className="text-gray-600">상태</span>
                            <p className="font-semibold">{property.status}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 임대료 납부 현황 - 내가 임대한 매물의 월세 납부 현황 */}
          <TabsContent value="rents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>임대료 납부 현황</CardTitle>
                <CardDescription>내가 임대한 매물의 월세 납부 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {myRents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    임대한 매물이 없습니다.
                  </div>
                ) : (
                  myRents.map((rent) => {
                    const property = rentProperties[rent.propertyId];
                    if (!property) return null;
                    
                    return (
                      <Card key={rent.rentId} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="text-left">
                              <h3 className="font-semibold">{property.name}</h3>
                              <p className="text-sm text-gray-600">{property.address}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge className={rent.status === 'ACTIVE' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                                  {rent.status === 'ACTIVE' ? '임대 중' : rent.status}
                                </Badge>
                                <Badge variant="outline" className="bg-blue-100">
                                  {property.currentFundingPercent === 100 ? '펀딩 완료' : `펀딩 ${property.currentFundingPercent}%`}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{formatPrice(rent.monthlyRent)}원</p>
                              <p className="text-sm text-gray-600">월 임대료</p>
                              <p className="text-sm text-gray-600 mt-1">
                                매월 {rent.paymentDay}일 납부
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">임대 시작일</span>
                              <p className="font-semibold">{rent.startDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">임대 종료일</span>
                              <p className="font-semibold">{rent.endDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">보증금</span>
                              <p className="font-semibold">{formatPrice(rent.deposit)}원</p>
                            </div>
                            <div>
                              <span className="text-gray-600">임대인</span>
                              <p className="font-semibold">{rent.propertyOwnerName}</p>
                            </div>
                          </div>

                          {property.currentFundingPercent === 100 && rent.status === 'ACTIVE' && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <Button 
                                onClick={() => handlePayRent(rent)}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                월세 납부하기 ({formatPrice(rent.monthlyRent)}원)
                              </Button>
                            </div>
                          )}
                          
                          {property.currentFundingPercent < 100 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                <p className="text-sm text-yellow-800">
                                  펀딩이 100% 완료되어야 월세 납부가 가능합니다. (현재 {property.currentFundingPercent}%)
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
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
