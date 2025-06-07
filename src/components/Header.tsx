
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { User, Plus } from 'lucide-react';
import { authApi } from '@/api';
import { toast } from '@/hooks/use-toast';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
      navigate('/intro');
    } catch (error) {
      toast({
        title: "로그아웃 실패",
        description: "오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => navigate('/home')}
          >
            <h1 className="text-xl font-bold text-blue-600">RealEstate Invest</h1>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/home')}
            >
              매물 보기
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/property/register')}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              매물 등록
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
              onClick={handleLogout}
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
