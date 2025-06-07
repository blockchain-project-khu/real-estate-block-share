
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/api';

const Login = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({
        username: loginData.username,
        password: loginData.password
      });

      if (response.isSuccess) {
        // userId 저장
        localStorage.setItem('userId', response.response.userId.toString());
        
        toast({
          title: "로그인 성공",
          description: response.message,
        });
        navigate('/home');
      } else {
        toast({
          title: "로그인 실패",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "로그인 실패",
        description: "서버 연결에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "회원가입 실패",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        username: signupData.username,
        password: signupData.password
      });

      toast({
        title: "회원가입 성공",
        description: "계정이 생성되었습니다! 로그인해주세요.",
      });
      
      // 회원가입 성공 후 로그인 탭으로 전환
      setSignupData({ username: '', password: '', confirmPassword: '' });
      setActiveTab('login');
    } catch (error) {
      toast({
        title: "회원가입 실패",
        description: "서버 연결에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay pattern for blockchain aesthetic */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/20"></div>
      
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-2xl border border-white/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">RealEstate Invest</CardTitle>
          <CardDescription className="text-gray-600">블록체인 기반 부동산 공동투자 플랫폼</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="사용자명"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="비밀번호"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? '로그인 중...' : '로그인'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="사용자명"
                    value={signupData.username}
                    onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="비밀번호"
                    value={signupData.password}
                    onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                    required
                  />
                  <Input
                    type="password"
                    placeholder="비밀번호 확인"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? '가입 중...' : '회원가입'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({
        username: loginData.username,
        password: loginData.password
      });

      if (response.isSuccess) {
        localStorage.setItem('userId', response.response.userId.toString());
        
        toast({
          title: "로그인 성공",
          description: response.message,
        });
        navigate('/home');
      } else {
        toast({
          title: "로그인 실패",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "로그인 실패",
        description: "서버 연결에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "회원가입 실패",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        username: signupData.username,
        password: signupData.password
      });

      toast({
        title: "회원가입 성공",
        description: "계정이 생성되었습니다! 로그인해주세요.",
      });
      
      setSignupData({ username: '', password: '', confirmPassword: '' });
      setActiveTab('login');
    } catch (error) {
      toast({
        title: "회원가입 실패",
        description: "서버 연결에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
};

export default Login;
