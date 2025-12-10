import { useState, useEffect, useCallback } from 'react';
import type { LoginData, User } from '../services/api';
import { authAPI, userAPI } from '../services/api';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Функция для определения типа пользователя по username
const detectUserType = (username: string): 'student' | 'staff' | 'admin' => {
  // Логика определения типа пользователя
  // Например, если username содержит определенные паттерны
  
  if (username.includes('admin') || username.includes('administrator')) {
    return 'admin';
  }
  
  if (username.includes('staff') || username.includes('teacher')) {
    return 'staff';
  }
  
  // По умолчанию считаем студентом
  return 'student';
};

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('userData');

      if (token && savedUser) {
        const userData = JSON.parse(savedUser) as User;
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (loginData: LoginData) => {
    try {
      setIsLoading(true);
      
      // Определяем тип пользователя, если не указан явно
      const userType = loginData.userType || detectUserType(loginData.username);
      
      // Демо данные
      const demoUser: User = {
        id: '1',
        username: loginData.username,
        email: `${loginData.username}@mtuci.edu`, // Изменен домен
        firstName: 'John',
        lastName: 'Doe',
        userType: userType,
        studentId: userType === 'student' ? 'BSIT112134513514' : undefined,
        program: userType === 'student' ? 'Information Technology' : undefined,
        department: userType === 'staff' ? 'Computer Science Department' : undefined,
        position: userType === 'staff' ? 'Professor' : undefined
      };
      
      const demoResponse = {
        token: 'demo-token-' + Date.now(),
        user: demoUser
      };
      
      localStorage.setItem('authToken', demoResponse.token);
      localStorage.setItem('userData', JSON.stringify(demoResponse.user));
      setUser(demoResponse.user);
      
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Если используете реальный API
      // await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
    }
  }, []);

  const updateUser = useCallback(async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
  };
};