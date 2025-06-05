
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  id: number;
  title: string;
  location: string;
  price: number;
  monthlyRent: number;
  fundingProgress: number;
  imageUrl: string;
  propertyType: string;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  location,
  price,
  monthlyRent,
  fundingProgress,
  imageUrl,
  propertyType
}) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 left-2 bg-blue-600">
          {propertyType}
        </Badge>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription className="text-gray-600">{location}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">매물 가격</span>
          <span className="font-semibold">{formatPrice(price)}만원</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">월 임대수익</span>
          <span className="font-semibold text-green-600">{formatPrice(monthlyRent)}만원</span>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">펀딩 진행률</span>
            <span className="font-semibold">{fundingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${fundingProgress}%` }}
            />
          </div>
        </div>
        
        <Button 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate(`/property/${id}`)}
        >
          자세히 보기
        </Button>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
