
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { ArrowDown, ArrowUp } from 'lucide-react';

const MyPage = () => {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
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
      status: '수익 발생 중'
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
      status: '수익 발생 중'
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
    }
  ];

  const mockRents = [
    {
      id: 'rent1',
      propertyName: '송파구 투룸 원룸',
      location: '서울 송파구 잠실동',
      monthlyRent: 80,
      dueDate: '2024-06-10',
      status: '납부 예정'
    }
  ];

  const handleRentPayment = (rentId: string) => {
    toast({
      title: "월세 납부 완료",
      description: "월세가 성공적으로 납부되었습니다.",
    });
  };

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

          {/* 펀딩 현황 */}
          <TabsContent value="investments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>나의 펀딩 현황</CardTitle>
                <CardDescription>투자한 매물들의 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockInvestments.map((investment) => (
                  <Collapsible key={investment.id}>
                    <CollapsibleTrigger 
                      className="w-full"
                      onClick={() => toggleItem(investment.id)}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="text-left">
                              <h3 className="font-semibold">{investment.propertyName}</h3>
                              <p className="text-sm text-gray-600">{investment.location}</p>
                              <Badge className="mt-1 bg-green-100 text-green-800">
                                {investment.status}
                              </Badge>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div>
                                <p className="font-bold">{formatPrice(investment.investmentAmount)}만원</p>
                                <p className="text-sm text-gray-600">{investment.investmentRatio}% 투자</p>
                              </div>
                              {openItems[investment.id] ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <Card className="mt-2 bg-gray-50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">투자일</span>
                              <p className="font-semibold">{investment.investmentDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">월 수익</span>
                              <p className="font-semibold text-green-600">{formatPrice(investment.monthlyReturn)}만원</p>
                            </div>
                            <div>
                              <span className="text-gray-600">누적 수익</span>
                              <p className="font-semibold text-blue-600">{formatPrice(investment.totalReturn)}만원</p>
                            </div>
                            <div>
                              <span className="text-gray-600">투자 비율</span>
                              <p className="font-semibold">{investment.investmentRatio}%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 판매 현황 */}
          <TabsContent value="sales" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>나의 판매 현황</CardTitle>
                <CardDescription>등록한 매물들의 펀딩 현황을 확인하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockSales.map((sale) => (
                  <Collapsible key={sale.id}>
                    <CollapsibleTrigger 
                      className="w-full"
                      onClick={() => toggleItem(sale.id)}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="text-left">
                              <h3 className="font-semibold">{sale.propertyName}</h3>
                              <p className="text-sm text-gray-600">{sale.location}</p>
                              <Badge className="mt-1 bg-blue-100 text-blue-800">
                                {sale.status}
                              </Badge>
                            </div>
                            <div className="text-right flex items-center gap-4">
                              <div>
                                <p className="font-bold">{sale.currentFunding}% 펀딩</p>
                                <p className="text-sm text-gray-600">{formatPrice(sale.totalPrice)}만원</p>
                              </div>
                              {openItems[sale.id] ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <Card className="mt-2 bg-gray-50">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">등록일</span>
                              <p className="font-semibold">{sale.registrationDate}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">총 투자자</span>
                              <p className="font-semibold">{sale.totalInvestors}명</p>
                            </div>
                            <div>
                              <span className="text-gray-600">월 임대료</span>
                              <p className="font-semibold text-green-600">{formatPrice(sale.monthlyRent)}만원</p>
                            </div>
                            <div>
                              <span className="text-gray-600">펀딩 진행률</span>
                              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${sale.currentFunding}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 월세 납부 */}
          <TabsContent value="rents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>월세 납부</CardTitle>
                <CardDescription>임대 중인 매물의 월세를 납부하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRents.map((rent) => (
                  <Card key={rent.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{rent.propertyName}</h3>
                          <p className="text-sm text-gray-600">{rent.location}</p>
                          <p className="text-sm text-gray-600">납부 예정일: {rent.dueDate}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-bold text-lg">{formatPrice(rent.monthlyRent)}만원</p>
                          <Button 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleRentPayment(rent.id)}
                          >
                            월세 납부
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default MyPage;
