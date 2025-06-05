
import React, { useState } from 'react';
import Header from '@/components/Header';
import PropertyCard from '@/components/PropertyCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFundingCompleted, setShowFundingCompleted] = useState(false);

  const mockProperties = [
    {
      id: 1,
      title: "강남구 신축 오피스텔",
      location: "서울 강남구 역삼동",
      price: 50000,
      monthlyRent: 250,
      fundingProgress: 75,
      imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
      propertyType: "오피스텔"
    },
    {
      id: 2,
      title: "홍대 상가 건물",
      location: "서울 마포구 홍익로",
      price: 80000,
      monthlyRent: 400,
      fundingProgress: 100,
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      propertyType: "상가"
    },
    {
      id: 3,
      title: "판교 신축 아파트",
      location: "경기 성남시 분당구",
      price: 120000,
      monthlyRent: 500,
      fundingProgress: 90,
      imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      propertyType: "아파트"
    },
    {
      id: 4,
      title: "여의도 프리미엄 오피스",
      location: "서울 영등포구 여의도동",
      price: 200000,
      monthlyRent: 800,
      fundingProgress: 30,
      imageUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
      propertyType: "오피스"
    },
    {
      id: 5,
      title: "송파구 투룸 원룸",
      location: "서울 송파구 잠실동",
      price: 35000,
      monthlyRent: 180,
      fundingProgress: 60,
      imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
      propertyType: "원룸"
    },
    {
      id: 6,
      title: "부산 해운대 펜션",
      location: "부산 해운대구 중동",
      price: 95000,
      monthlyRent: 350,
      fundingProgress: 100,
      imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      propertyType: "펜션"
    }
  ];

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFundingFilter = showFundingCompleted ? property.fundingProgress === 100 : true;
    
    return matchesSearch && matchesFundingFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">부동산 투자 매물</h1>
          <p className="text-gray-600">블록체인 기반으로 안전하게 공동투자하세요</p>
        </div>
        
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="매물명 또는 지역으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="price-low">가격 낮은순</SelectItem>
                  <SelectItem value="price-high">가격 높은순</SelectItem>
                  <SelectItem value="funding">펀딩률 높은순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="funding-completed" 
              checked={showFundingCompleted}
              onCheckedChange={(checked) => setShowFundingCompleted(checked === true)}
            />
            <label 
              htmlFor="funding-completed" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              펀딩 완료된 매물만 보기
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
