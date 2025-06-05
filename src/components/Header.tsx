
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigate('/')}
          >
            <h1 className="text-xl font-bold text-blue-600">RealEstate Invest</h1>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
            >
              매물 보기
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/mypage')}
              className="flex items-center gap-2"
            >
              <User size={16} />
              마이페이지
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
            >
              로그아웃
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
