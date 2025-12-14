

import { useState, useEffect, useContext, createContext } from 'react';
import { login, register, refreshAccessToken } from '../services/authService';


const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ email: string; username: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    
    const storedUser = localStorage.getItem('user');
    const storedTokens = localStorage.getItem('tokens');

    if (storedUser && storedTokens) {
      const { accessToken, refreshToken } = JSON.parse(storedTokens);
      setUser(JSON.parse(storedUser));
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
    }
  }, []);

  
  const handleLogin = async (email: string, password: string) => {
    const data = await login(email, password);
    setUser({ email, username: data.username });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('user', JSON.stringify({ email, username: data.username }));
    localStorage.setItem('tokens', JSON.stringify({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
  };

  
  const handleRegister = async (email: string, username: string, password: string) => {
    const data = await register(email, username, password);
    setUser({ email, username });
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    localStorage.setItem('user', JSON.stringify({ email, username }));
    localStorage.setItem('tokens', JSON.stringify({ accessToken: data.accessToken, refreshToken: data.refreshToken }));
  };

  
  const handleRefresh = async () => {
    if (!refreshToken) return;

    const data = await refreshAccessToken(refreshToken);
    setAccessToken(data.accessToken);
    localStorage.setItem('tokens', JSON.stringify({ accessToken: data.accessToken, refreshToken }));
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, handleLogin, handleRegister, handleRefresh }}>
      {children}
    </AuthContext.Provider>
  );
};
