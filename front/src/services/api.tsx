import axios from 'axios';

// Безопасное получение переменной окружения
const getApiBaseUrl = (): string => {
  // Для Create React App
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Для Vite или других сборщиков
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Значение по умолчанию
  return 'http://localhost:3001/api';
};

const VITE_API_URL = getApiBaseUrl();

// Создаем экземпляр axios с настройками
const api = axios.create({
  baseURL: VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Типы для TypeScript
export interface LoginData {
  username: string;
  password: string;
  userType?: 'student' | 'staff' | 'admin'; // Сделать необязательным
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'student' | 'staff' | 'admin';
  studentId?: string;
  program?: string;
  department?: string; // Добавьте это поле
  position?: string;   // Добавьте это поле
  avatar?: string;
  phoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API методы
export const authAPI = {
  login: async (loginData: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', loginData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await api.post('/auth/logout');
    }
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  verifyToken: async (): Promise<User> => {
    const response = await api.get<User>('/auth/verify');
    return response.data;
  },
};

export const userAPI = {
  getUserProfile: async (userId: string): Promise<User> => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, userData);
    return response.data;
  },
};


export interface Room {
  id: string;
  number: string;
  name?: string;
  type: 'lecture' | 'lab' | 'practice' | 'computer' | 'conference' | 'other';
  typeDisplay: string; // Для отображения на русском
  capacity: number;
  building: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance';
  statusDisplay: string; // Для отображения на русском
  equipment?: string[];
  description?: string;
  schedule?: RoomSchedule[];
}

export interface RoomSchedule {
  id: string;
  roomId: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher?: string;
  group?: string;
}

export interface RoomSearchParams {
  query?: string;
  building?: string;
  floor?: number;
  type?: string;
  status?: string;
  minCapacity?: number;
  maxCapacity?: number;
}

// API функции для работы с кабинетами
export const roomAPI = {
  // Поиск кабинетов
  searchRooms: async (params: RoomSearchParams): Promise<Room[]> => {
    try {
      const response = await fetch('/api/rooms/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching rooms:', error);
      throw error;
    }
  },

  // Получить все кабинеты
  getAllRooms: async (): Promise<Room[]> => {
    try {
      const response = await fetch('/api/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
  },

  // Получить кабинет по ID
  getRoomById: async (id: string): Promise<Room> => {
    try {
      const response = await fetch(`/api/rooms/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch room');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },

  // Получить расписание кабинета
  getRoomSchedule: async (roomId: string, date?: string): Promise<RoomSchedule[]> => {
    try {
      const url = date 
        ? `/api/rooms/${roomId}/schedule?date=${date}`
        : `/api/rooms/${roomId}/schedule`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch schedule');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  },

  // Забронировать кабинет
  bookRoom: async (roomId: string, bookingData: {
    startTime: string;
    endTime: string;
    purpose: string;
    group?: string;
  }): Promise<void> => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to book room');
      }
    } catch (error) {
      console.error('Error booking room:', error);
      throw error;
    }
  }
};

export default api;