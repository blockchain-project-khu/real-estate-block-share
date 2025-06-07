
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
  const [paymentStatusData, setPaymentStatusData] = useState<PropertyPaymentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('MyPage: 데이터 로딩 시작');
        
        // 내가 참여한 펀딩 목록 로드 (펀딩 현황용)
        console.log('MyPage: 내 펀딩 목록 조회 중...');
        const fundings = await fundingApi.getMyFundings();
        console.log('MyPage: 내 펀딩 목록 응답:', fundings);
        setMyFundings(fundings || []);
        
        // 펀딩에 대응하는 매물 정보 로드
        if (fundings && fundings.length > 0) {
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
        setSalesProperties(salesProps || []);

        // 월세 납부 현황 데이터 로드
        console.log('MyPage: 월세 납부 현황 데이터 로딩 시작');
        const paymentStatus = await rentApi.getPropertyPaymentStatus();
        console.log('MyPage: 월세 납부 현황 응답:', paymentStatus);
        // paymentStatus가 undefined일 수 있으므로 안전하게 처리
        setPaymentStatusData(Array.isArray(paymentStatus) ? paymentStatus : []);
        
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
        setPaymentStatusData([]);
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
            <TabsTrigger value="rents">월세 수취 현황</TabsTrigger>
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

          {/* 월세 수취 현황 - API 연동 */}
          <TabsContent value="rents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>월세 수취 현황</CardTitle>
                <CardDescription>내 매물의 월세 수취 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentStatusData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    월세 수취 현황이 없습니다.
                  </div>
                ) : (
                  paymentStatusData.map((propertyStatus) => (
                    <Collapsible key={propertyStatus.propertyId}>
                      <CollapsibleTrigger 
                        className="w-full"
                        onClick={() => toggleItem(`property-${propertyStatus.propertyId}`)}
                      >
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div className="text-left">
                                <h3 className="font-semibold">{propertyStatus.propertyName}</h3>
                                <p className="text-sm text-gray-600">총 {propertyStatus.paymentCount}회 수취</p>
                                <Badge className="bg-green-100 text-green-800 mt-1">
                                  월세 수취 중
                                </Badge>
                              </div>
                              <div className="text-right flex items-center gap-4">
                                <div>
                                  <p className="font-bold text-lg">{formatPrice(propertyStatus.totalReceived)}원</p>
                                  <p className="text-sm text-gray-600">총 수취 금액</p>
                                </div>
                                {openItems[`property-${propertyStatus.propertyId}`] ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <Card className="mt-2 bg-gray-50">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">월세 수취 내역</h4>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>결제일</TableHead>
                                  <TableHead>금액</TableHead>
                                  <TableHead>상태</TableHead>
                                  <TableHead>결제 ID</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {propertyStatus.payments.map((payment) => (
                                  <TableRow key={payment.paymentId}>
                                    <TableCell>{payment.paidAt}</TableCell>
                                    <TableCell className="font-bold">{formatPrice(payment.amount)}원</TableCell>
                                    <TableCell>
                                      <Badge className="bg-green-100 text-green-800">
                                        {payment.status === 'PAID' ? '수취 완료' : payment.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">{payment.paymentId}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );

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
};

export default MyPage;
