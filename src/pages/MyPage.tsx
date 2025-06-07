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
import { FundingResponse, PropertyResponse, PropertyPaymentStatus } from '@/api/types';

const MyPage = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [myFundings, setMyFundings] = useState<FundingResponse[]>([]);
  const [fundingProperties, setFundingProperties] = useState<Record<number, PropertyResponse>>({});
  const [salesProperties, setSalesProperties] = useState<PropertyResponse[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PropertyPaymentStatus[]>([]);
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

        // 월세 납부 현황 조회 (매물별)
        console.log('MyPage: 월세 납부 현황 조회 중...');
        const paymentStatusData = await rentApi.getPropertyPaymentStatus();
        console.log('MyPage: 월세 납부 현황 응답:', paymentStatusData);
        setPaymentStatus(paymentStatusData || []);
        
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
        setPaymentStatus([]);
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

  const handlePayRent = (propertyId: number, propertyName: string) => {
    console.log(`월세 납부 요청 - 매물 ID: ${propertyId}, 매물명: ${propertyName}`);
    // TODO: 월세 납부 API 연동 예정
    toast({
      title: "월세 납부",
      description: `${propertyName}의 월세 납부 기능은 준비 중입니다.`,
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
            <TabsTrigger value="payments">월세 납부 현황</TabsTrigger>
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

          {/* 월세 납부 현황 - 매물별 월세 납부 현황 (/rent-payment/sendBy-property) */}
          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>월세 납부 현황</CardTitle>
                <CardDescription>매물별 월세 납부 현황을 확인하고 월세를 납부하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentStatus.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    월세 납부 내역이 없습니다.
                  </div>
                ) : (
                  paymentStatus.map((propertyPayment) => (
                    <Card key={propertyPayment.propertyId} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-left">
                            <h3 className="font-semibold text-lg">{propertyPayment.propertyName}</h3>
                            <div className="flex gap-2 mt-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                매물 ID: {propertyPayment.propertyId}
                              </Badge>
                              {propertyPayment.paymentCount > 0 ? (
                                <>
                                  <Badge className="bg-green-100 text-green-800">
                                    총 {propertyPayment.paymentCount}회 납부
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    총 납부액: {formatPrice(propertyPayment.totalReceived)}원
                                  </Badge>
                                </>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                  아직 납부 내역 없음
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <Button 
                              onClick={() => handlePayRent(propertyPayment.propertyId, propertyPayment.propertyName)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              월세 납부하기
                            </Button>
                          </div>
                        </div>
                        
                        {propertyPayment.payments && propertyPayment.payments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h4 className="font-medium text-sm text-gray-700 mb-3">납부 내역</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">납부일</TableHead>
                                  <TableHead className="text-xs">금액</TableHead>
                                  <TableHead className="text-xs">상태</TableHead>
                                  <TableHead className="text-xs">납부 ID</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {propertyPayment.payments.map((payment) => (
                                  <TableRow key={payment.paymentId}>
                                    <TableCell className="text-xs">{payment.paidAt}</TableCell>
                                    <TableCell className="text-xs font-semibold text-green-600">
                                      {formatPrice(payment.amount)}원
                                    </TableCell>
                                    <TableCell className="text-xs">
                                      <Badge variant="outline" className={payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>
                                        {payment.status === 'PAID' ? '납부완료' : payment.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-500">#{payment.paymentId}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                        
                        {(!propertyPayment.payments || propertyPayment.payments.length === 0) && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="text-center py-4 text-gray-500 text-sm">
                              아직 이 매물에 대한 월세 납부 내역이 없습니다.
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
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
