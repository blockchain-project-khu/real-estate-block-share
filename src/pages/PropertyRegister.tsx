
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

const PropertyRegister = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    monthlyRent: '',
    propertyType: '',
    description: '',
    totalArea: '',
    floor: '',
    imageUrl: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 입력 검증
    if (!formData.title || !formData.location || !formData.price || !formData.monthlyRent || !formData.propertyType) {
      toast({
        title: "입력 오류",
        description: "필수 항목을 모두 입력해주세요.",
      });
      setIsSubmitting(false);
      return;
    }

    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      toast({
        title: "매물 등록 완료",
        description: `${formData.title} 매물이 성공적으로 등록되었습니다.`,
      });
      setIsSubmitting(false);
      navigate('/home');
    }, 2000);
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
                  <Label htmlFor="title">매물명 *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="예: 강남구 신축 오피스텔"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">위치 *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="예: 서울 강남구 역삼동"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">매물 가격 (만원) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyRent">월 임대료 (만원) *</Label>
                  <Input
                    id="monthlyRent"
                    type="number"
                    value={formData.monthlyRent}
                    onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                    placeholder="250"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propertyType">매물 유형 *</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="매물 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="오피스텔">오피스텔</SelectItem>
                      <SelectItem value="아파트">아파트</SelectItem>
                      <SelectItem value="상가">상가</SelectItem>
                      <SelectItem value="오피스">오피스</SelectItem>
                      <SelectItem value="원룸">원룸</SelectItem>
                      <SelectItem value="펜션">펜션</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalArea">전용면적</Label>
                  <Input
                    id="totalArea"
                    value={formData.totalArea}
                    onChange={(e) => handleInputChange('totalArea', e.target.value)}
                    placeholder="84.2㎡"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="floor">층수</Label>
                  <Input
                    id="floor"
                    value={formData.floor}
                    onChange={(e) => handleInputChange('floor', e.target.value)}
                    placeholder="15층 중 12층"
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
