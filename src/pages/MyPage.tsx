import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import WalletConnection from '@/components/WalletConnection';
import RentPaymentButton from '@/components/RentPaymentButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { ArrowDown, ArrowUp, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { fundingApi, propertyApi, rentApi } from '@/api';
import { FundingResponse, PropertyResponse, FundingIncomeResponse, RentPayment } from '@/api/types';

const MyPage = () => {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [openPaymentHistory, setOpenPaymentHistory] = useState<Record<string, boolean>>({});
  const [myFundings, setMyFundings] = useState<FundingResponse[]>([]);
  const [fundingProperties, setFundingProperties] = useState<Record<number, PropertyResponse>>({});
  const [salesProperties, setSalesProperties] = useState<PropertyResponse[]>([]);
  const [fundingIncome, setFundingIncome] = useState<FundingIncomeResponse[]>([]);
  const [myRentPayments, setMyRentPayments] = useState<RentPayment[]>([]);
  const [myRentContracts, setMyRentContracts] = useState<PropertyResponse[]>([]);
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

        // 월세 수취 현황 조회 (펀딩 수익)
        console.log('MyPage: 월세 수취 현황 조회 중...');
        const fundingIncomeData = await rentApi.getFundingIncome();
        console.log('MyPage: 월세 수취 현황 API 응답:', fundingIncomeData);
        if (fundingIncomeData.isSuccess && Array.isArray(fundingIncomeData.response)) {
          setFundingIncome(fundingIncomeData.response);
        } else {
          console.log('MyPage: 월세 수취 현황 응답이 비정상적이거나 빈 배열');
          setFundingIncome([]);
        }

        // 내 임대 계약 조회
        console.log('MyPage: 내 임대 계약 조회 중...');
        const myContracts = await rentApi.getMyRents();
        console.log('MyPage: 내 임대 계약 응답:', myContracts);
        setMyRentContracts(Array.isArray(myContracts) ? myContracts : []);

        // SOLD 상태인 계약에 대해서만 월세 납부 현황 조회
        const soldContracts = myContracts.filter(contract => contract.status === 'SOLD');
        if (soldContracts.length > 0) {
          console.log('MyPage: 월세 납부 현황 조회 중...');
          const myPaymentsData = await rentApi.getMyRentPayments();
          console.log('MyPage: 월세 납부 현황 API 응답:', myPaymentsData);
          if (myPaymentsData.isSuccess && Array.isArray(myPaymentsData.response)) {
            setMyRentPayments(myPaymentsData.response);
          } else {
            console.log('MyPage: 월세 납부 현황 응답이 비정상적이거나 빈 배열');
            setMyRentPayments([]);
          }
        } else {
          setMyRentPayments([]);
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
        setFundingIncome([]);
        setMyRentPayments([]);
        setMyRentContracts([]);
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

  const togglePaymentHistory = (propertyId: string) => {
    setOpenPaymentHistory(prev => ({ ...prev, [propertyId]: !prev[propertyId] }));
  };

  // 납부일 체크 함수 - 매월 5일~10일로 수정
  const canPayRent = (payments: RentPayment[]) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // 현재 날짜가 납부 가능 기간(5일~10일)이 아니면 납부 불가
    if (currentDay < 5 || currentDay > 10) {
      return {
        canPay: false,
        reason: `매월 5일부터 10일까지만 납부 가능합니다.`
      };
    }

    // 이번 달에 이미 납부했는지 확인
    const currentMonthPayment = payments.find(payment => {
      const paymentDate = new Date(payment.paidAt);
      return paymentDate.getMonth() === currentMonth && 
             paymentDate.getFullYear() === currentYear;
    });

    if (currentMonthPayment) {
      return {
        canPay: false,
        reason: '이번 달 월세를 이미 납부하셨습니다.'
      };
    }

    return {
      canPay: true,
      reason: ''
    };
  };

  // 월세 납부 성공 후 콜백 함수
  const handlePaymentSuccess = async () => {
    try {
      // 납부 현황 새로고침
      const myPaymentsData = await rentApi.getMyRentPayments();
      if (myPaymentsData.isSuccess && Array.isArray(myPaymentsData.response)) {
        setMyRentPayments(myPaymentsData.response);
      }
    } catch (error) {
      console.error('납부 현황 새로고침 실패:', error);
    }
  };

  // 월세 납부 내역을 매물별로 그룹화
  const groupPaymentsByProperty = (payments: RentPayment[]) => {
    const grouped = payments.reduce((acc, payment) => {
      if (!acc[payment.propertyId]) {
        acc[payment.propertyId] = [];
      }
      acc[payment.propertyId].push(payment);
      return acc;
    }, {} as Record<number, RentPayment[]>);
    
    return grouped;
  };

  const groupedPayments = groupPaymentsByProperty(myRentPayments);

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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1">
            <WalletConnection />
          </div>
          <div className="lg:col-span-3">
            <Tabs defaultValue="investments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="investments">펀딩 현황</TabsTrigger>
                <TabsTrigger value="sales">판매 현황</TabsTrigger>
                <TabsTrigger value="rent">월세 현황</TabsTrigger>
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

              {/* 월세 현황 - 월세 납부 현황과 월세 수취 현황 */}
              <TabsContent value="rent" className="space-y-4">
                <Tabs defaultValue="payment" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="payment">월세 납부 현황</TabsTrigger>
                    <TabsTrigger value="receive">월세 수취 현황</TabsTrigger>
                  </TabsList>

                  {/* 월세 납부 현황 */}
                  <TabsContent value="payment" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>월세 납부 현황</CardTitle>
                        <CardDescription>내가 임대 신청한 매물별 월세 납부 내역을 확인하세요</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {myRentContracts.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            임대 계약이 없습니다.
                          </div>
                        ) : (
                          myRentContracts.map((contract) => {
                            const contractPayments = groupedPayments[contract.id] || [];
                            const paymentCheck = canPayRent(contractPayments);
                            const isSold = contract.status === 'SOLD';
                            
                            return (
                              <Card key={`payment-${contract.id}`} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-center mb-4">
                                    <div className="text-left">
                                      <h3 className="font-semibold text-lg">{contract.name}</h3>
                                      <p className="text-sm text-gray-600">{contract.address}</p>
                                      <div className="flex gap-2 mt-2">
                                        <Badge className={isSold ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                          {isSold ? '계약 완료' : '계약 대기'}
                                        </Badge>
                                        {isSold && contractPayments.length > 0 && (
                                          <Badge variant="outline" className="bg-green-50 text-green-700">
                                            총 납부 내역: {contractPayments.length}건
                                          </Badge>
                                        )}
                                        {isSold && contractPayments.length > 0 && (
                                          <Badge variant="outline" className="bg-green-50 text-green-700">
                                            총 납부액: {formatPrice(contractPayments.reduce((sum, p) => sum + p.amount, 0))}원
                                          </Badge>
                                        )}
                                      </div>
                                      {isSold && !paymentCheck.canPay && (
                                        <p className="text-sm text-red-600 mt-2">{paymentCheck.reason}</p>
                                      )}
                                      {!isSold && (
                                        <p className="text-sm text-yellow-600 mt-2">펀딩 완료 후 월세 납부가 가능합니다.</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      {isSold && paymentCheck.canPay ? (
                                        <RentPaymentButton
                                          propertyId={contract.id}
                                          propertyName={contract.name}
                                          monthlyRent={contract.monthlyRent}
                                          onPaymentSuccess={handlePaymentSuccess}
                                        />
                                      ) : (
                                        <Button 
                                          disabled={true}
                                          className="bg-gray-400 cursor-not-allowed"
                                        >
                                          월세 납부하기
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {isSold && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      {contractPayments.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                          아직 납부 내역이 없습니다
                                        </div>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => togglePaymentHistory(contract.id.toString())}
                                            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
                                          >
                                            <span>납부 내역</span>
                                            {openPaymentHistory[contract.id.toString()] ? 
                                              <ChevronUp size={16} /> : 
                                              <ChevronDown size={16} />
                                            }
                                          </button>
                                          
                                          {openPaymentHistory[contract.id.toString()] && (
                                            <Table>
                                              <TableHeader>
                                                <TableRow>
                                                  <TableHead className="text-xs">납부일</TableHead>
                                                  <TableHead className="text-xs">금액</TableHead>
                                                  <TableHead className="text-xs">상태</TableHead>
                                                  <TableHead className="text-xs">임대 ID</TableHead>
                                                </TableRow>
                                              </TableHeader>
                                              <TableBody>
                                                {contractPayments.map((payment) => (
                                                  <TableRow key={payment.paymentId}>
                                                    <TableCell className="text-xs">{payment.paidAt}</TableCell>
                                                    <TableCell className="text-xs font-semibold text-green-600">
                                                      {formatPrice(payment.amount)}원
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                      <Badge variant="outline" className="bg-green-100 text-green-800">
                                                        {payment.status}
                                                      </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-gray-500">#{payment.rentId}</TableCell>
                                                  </TableRow>
                                                ))}
                                              </TableBody>
                                            </Table>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                  
                                  {!isSold && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <div className="text-center py-4 text-gray-500">
                                        아직 납부 내역이 없습니다
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

                  {/* 월세 수취 현황 */}
                  <TabsContent value="receive" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>월세 수취 현황</CardTitle>
                        <CardDescription>내가 펀딩한 매물별 월세 수취 내역을 확인하세요</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {fundingIncome.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            펀딩 수익 내역이 없습니다.
                          </div>
                        ) : (
                          fundingIncome.map((income) => (
                            <Card key={`receive-${income.propertyId}`} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-center mb-4">
                                  <div className="text-left">
                                    <h3 className="font-semibold text-lg">매물 ID: {income.propertyId}</h3>
                                    <div className="flex gap-2 mt-2">
                                      <Badge className="bg-green-100 text-green-800">
                                        펀딩 비율: {income.fundingPercentage}%
                                      </Badge>
                                      <Badge variant="outline" className="bg-green-50 text-green-700">
                                        총 수취액: {formatPrice(income.totalIncome)}원
                                      </Badge>
                                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        수취 건수: {income.payments.length}건
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                                
                                {income.payments && income.payments.length > 0 && (
                                  <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="font-medium text-sm text-gray-700 mb-3">수취 내역</h4>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="text-xs">수취일</TableHead>
                                          <TableHead className="text-xs">금액</TableHead>
                                          <TableHead className="text-xs">상태</TableHead>
                                          <TableHead className="text-xs">임대 ID</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {income.payments.map((payment) => (
                                          <TableRow key={payment.paymentId}>
                                            <TableCell className="text-xs">{payment.paidAt}</TableCell>
                                            <TableCell className="text-xs font-semibold text-green-600">
                                              {formatPrice(payment.amount)}원
                                            </TableCell>
                                            <TableCell className="text-xs">
                                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                                {payment.status}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-500">#{payment.rentId}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyPage;
