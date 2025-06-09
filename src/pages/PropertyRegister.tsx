import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ArrowUp } from 'lucide-react';
import { propertyApi } from '@/api';

const PropertyRegister = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    price: '',
    monthlyRent: '',
    supplyArea: '',
    totalFloors: '',
    imageUrl: '',
    propertyType: ''
  });

  const propertyTypes = [
    { value: 'OFFICETEL', label: '오피스텔' },
    { value: 'APARTMENT', label: '아파트' },
    { value: 'COMMERCIAL', label: '상가' },
    { value: 'OFFICE', label: '오피스' },
    { value: 'ONE_ROOM', label: '원룸' },
    { value: 'PENSION', label: '펜션' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.address || !formData.price || !formData.propertyType) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const requestData = {
        ...formData,
        monthlyRent: parseFloat(formData.monthlyRent) || 0,
        supplyArea: parseFloat(formData.supplyArea) || 0,
        imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop'
      };

      await propertyApi.create(requestData);
      toast({
        title: "매물 등록 완료",
        description: `${formData.name} 매물이 성공적으로 등록되었습니다.`,
      });
      navigate('/home');
    } catch (error) {
      console.error('Property registration error:', error);
      toast({
        title: "매물 등록 실패",
        description: "매물 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/home')}
          className="mb-4 flex items-center gap-2"
        >
          <ArrowUp className="rotate-[-90deg]" size={16} />
          매물 목록으로 돌아가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">매물 등록</CardTitle>
            <CardDescription>새로운 매물을 등록하여 투자자들과 함께 운영하세요</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">매물명 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="예: 강남구 신축 오피스텔"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">위치 *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="예: 서울 강남구 역삼동"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">매물 유형 *</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="매물 유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">매물 가격 (원) *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="300000000"
                    type="number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">월 임대료 (원)</Label>
                  <Input
                    id="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                    placeholder="1000000"
                    type="number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplyArea">공급면적 (㎡)</Label>
                  <Input
                    id="supplyArea"
                    value={formData.supplyArea}
                    onChange={(e) => handleInputChange('supplyArea', e.target.value)}
                    placeholder="28.5"
                    type="number"
                    step="0.1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalFloors">총 층수</Label>
                  <Input
                    id="totalFloors"
                    value={formData.totalFloors}
                    onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                    placeholder="15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">이미지 URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">매물 설명</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="매물에 대한 상세한 설명을 입력해주세요..."
                  className="w-full min-h-24 p-3 border rounded-md"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/home')}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '등록 중...' : '매물 등록'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PropertyRegister;
