
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PropertyCard from '@/components/PropertyCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { propertyApi } from '@/api';
import { PropertyResponse } from '@/api/types';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [showFundingCompleted, setShowFundingCompleted] = useState(false);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const mockImages = [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop"
  ];

  const propertyTypes = ["오피스텔", "아파트", "상가", "오피스", "원룸", "펜션"];

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const apiProperties = await propertyApi.getAll();
        const propertiesWithMockData = apiProperties.map((property, index) => ({
          ...property,
          imageUrl: mockImages[index % mockImages.length],
          propertyType: propertyTypes[index % propertyTypes.length],
          monthlyRent: Math.floor(parseInt(property.price) * 0.005), // 가격의 0.5%를 월세로 설정
          fundingProgress: Math.floor(Math.random() * 100) + 1 // 1-100% 랜덤 펀딩률
        }));
        setProperties(propertiesWithMockData);
      } catch (error) {
        console.error('Failed to load properties:', error);
        toast({
          title: "매물 로딩 실패",
          description: "매물 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFundingFilter = showFundingCompleted ? property.fundingProgress === 100 : true;
    
    return matchesSearch && matchesFundingFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">매물 목록을 불러오는 중...</div>
        </main>
      </div>
    );
  }

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
            <PropertyCard 
              key={property.id} 
              id={property.id}
              title={property.name}
              location={property.address}
              price={parseInt(property.price)}
              monthlyRent={property.monthlyRent}
              fundingProgress={property.fundingProgress}
              imageUrl={property.imageUrl}
              propertyType={property.propertyType}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
