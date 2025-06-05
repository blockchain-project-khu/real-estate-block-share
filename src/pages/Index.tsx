
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
          RealEstate Invest
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl">
          블록체인 기반 부동산 공동투자 플랫폼에 오신 것을 환영합니다
        </p>
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Button 
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
          >
            시작하기
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/home')}
            className="text-lg px-8 py-3"
          >
            매물 둘러보기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
