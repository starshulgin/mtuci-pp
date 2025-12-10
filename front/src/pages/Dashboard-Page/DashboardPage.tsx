import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { roomAPI, Room, RoomSearchParams } from '../../services/api';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<RoomSearchParams>({});
  const [showFilters, setShowFilters] = useState(false);

  // Загрузка всех кабинетов при монтировании
  useEffect(() => {
    loadAllRooms();
  }, []);

  const loadAllRooms = async () => {
    try {
      setIsLoading(true);
      const fetchedRooms = await roomAPI.getAllRooms();
      setRooms(fetchedRooms);
      setFilteredRooms(fetchedRooms);
    } catch (error) {
      console.error('Error loading rooms:', error);
      // В демо-режиме используем моковые данные
      const demoRooms = await getDemoRooms();
      setRooms(demoRooms);
      setFilteredRooms(demoRooms);
    } finally {
      setIsLoading(false);
    }
  };

  const getDemoRooms = async (): Promise<Room[]> => {
    // Демо данные на случай если бэкенд недоступен
    return [
      {
        id: '1',
        number: '101',
        type: 'lecture',
        typeDisplay: 'Лекционная',
        capacity: 50,
        building: 'Главный корпус',
        floor: 1,
        status: 'available',
        statusDisplay: 'Свободно',
        equipment: ['Проектор', 'Доска', 'Микрофон']
      },
      {
        id: '2',
        number: '102',
        type: 'lab',
        typeDisplay: 'Лаборатория',
        capacity: 30,
        building: 'Главный корпус',
        floor: 1,
        status: 'occupied',
        statusDisplay: 'Занято',
        equipment: ['Компьютеры', 'Микроскопы']
      },
      // ... добавьте больше демо кабинетов
    ];
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim() && !Object.keys(searchFilters).length) {
      await loadAllRooms();
      return;
    }

    try {
      setIsSearching(true);
      
      const searchParams: RoomSearchParams = {
        query: searchQuery.trim() || undefined,
        ...searchFilters
      };

      const searchResults = await roomAPI.searchRooms(searchParams);
      setFilteredRooms(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      // Локальная фильтрация при ошибке API
      const filtered = rooms.filter(room => {
        const query = searchQuery.toLowerCase();
        return (
          room.number.toLowerCase().includes(query) ||
          room.typeDisplay.toLowerCase().includes(query) ||
          room.building.toLowerCase().includes(query)
        );
      });
      setFilteredRooms(filtered);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchFilters, rooms]);

  // Автоматический поиск при изменении фильтров
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim() || Object.keys(searchFilters).length) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, searchFilters, handleSearch]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchFilters({});
    loadAllRooms();
  };

  const handleFilterChange = (filterName: keyof RoomSearchParams, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterName]: value || undefined
    }));
  };

  const handleBookRoom = async (roomId: string) => {
    if (!user) return;

    try {
      // Пример данных для бронирования
      const bookingData = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        purpose: 'Занятие',
        group: user.userType === 'student' ? user.studentId : undefined
      };

      await roomAPI.bookRoom(roomId, bookingData);
      alert('Кабинет успешно забронирован!');
      // Обновляем список кабинетов
      await handleSearch();
    } catch (error: any) {
      alert(error.message || 'Ошибка при бронировании');
    }
  };

  const formatUserType = (type: string) => {
    const types: Record<string, string> = {
      'student': 'Студент',
      'staff': 'Преподаватель',
      'admin': 'Администратор'
    };
    return types[type] || type;
  };

  if (authLoading || isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="dashboard-page">
      {/* Сайдбар остается без изменений */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-logo">MTUCI</h2>
          <p className="sidebar-subtitle">Личный кабинет</p>
        </div>

        <div className="user-profile">
          <div className="avatar">
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <div className="user-info">
            <h3>{user.firstName} {user.lastName}</h3>
            <p className="user-type">{formatUserType(user.userType)}</p>
            <p className="user-email">{user.email}</p>
            {user.studentId && (
              <p className="student-id">ID: {user.studentId}</p>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon">🔍</span>
            Поиск кабинетов
          </button>
          <button className="nav-item" onClick={() => navigate('/schedule')}>
            <span className="nav-icon">📅</span>
            Моё расписание
          </button>
          <button className="nav-item" onClick={() => navigate('/my-bookings')}>
            <span className="nav-icon">📋</span>
            Мои бронирования
          </button>
          <button className="nav-item" onClick={() => navigate('/settings')}>
            <span className="nav-icon">⚙️</span>
            Настройки
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            Выйти
          </button>
        </div>
      </aside>

      {/* Основной контент с поиском */}
      <main className="main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>Поиск кабинетов</h1>
            <p>Найдите нужный кабинет по номеру, типу или корпусу</p>
          </div>
          
          <div className="search-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Введите номер кабинета, тип или корпус..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
              />
              {searchQuery && (
                <button className="clear-search" onClick={clearSearch}>
                  ✕
                </button>
              )}
            </div>
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Скрыть фильтры' : 'Фильтры'}
            </button>
            <button 
              className="search-btn"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Поиск...' : 'Найти'}
            </button>
          </div>

          {/* Фильтры поиска */}
          {showFilters && (
            <div className="filters-container">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Корпус:</label>
                  <select 
                    className="filter-select"
                    onChange={(e) => handleFilterChange('building', e.target.value)}
                    value={searchFilters.building || ''}
                  >
                    <option value="">Все корпуса</option>
                    <option value="Главный корпус">Главный корпус</option>
                    <option value="Новый корпус">Новый корпус</option>
                    <option value="Лабораторный корпус">Лабораторный корпус</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Этаж:</label>
                  <select 
                    className="filter-select"
                    onChange={(e) => handleFilterChange('floor', parseInt(e.target.value))}
                    value={searchFilters.floor || ''}
                  >
                    <option value="">Все этажи</option>
                    {[1, 2, 3, 4, 5].map(floor => (
                      <option key={floor} value={floor}>{floor} этаж</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Тип:</label>
                  <select 
                    className="filter-select"
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    value={searchFilters.type || ''}
                  >
                    <option value="">Все типы</option>
                    <option value="lecture">Лекционная</option>
                    <option value="lab">Лаборатория</option>
                    <option value="practice">Практическая</option>
                    <option value="computer">Компьютерный класс</option>
                    <option value="conference">Конференц-зал</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Статус:</label>
                  <select 
                    className="filter-select"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    value={searchFilters.status || ''}
                  >
                    <option value="">Все статусы</option>
                    <option value="available">Свободно</option>
                    <option value="occupied">Занято</option>
                    <option value="maintenance">На обслуживании</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Вместимость:</label>
                  <div className="capacity-range">
                    <input
                      type="number"
                      placeholder="От"
                      className="capacity-input"
                      onChange={(e) => handleFilterChange('minCapacity', parseInt(e.target.value))}
                      value={searchFilters.minCapacity || ''}
                    />
                    <span className="range-separator">-</span>
                    <input
                      type="number"
                      placeholder="До"
                      className="capacity-input"
                      onChange={(e) => handleFilterChange('maxCapacity', parseInt(e.target.value))}
                      value={searchFilters.maxCapacity || ''}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="content-body">
          {/* Статистика */}
          <div className="stats-container">
            <div className="stat-card">
              <span className="stat-icon">🏢</span>
              <div>
                <h3>{rooms.length}</h3>
                <p>Всего кабинетов</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div>
                <h3>{rooms.filter(r => r.status === 'available').length}</h3>
                <p>Свободно сейчас</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏛️</span>
              <div>
                <h3>{Array.from(new Set(rooms.map(r => r.building))).length}</h3>
                <p>Корпуса</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div>
                <h3>{filteredRooms.length}</h3>
                <p>Найдено</p>
              </div>
            </div>
          </div>

          {/* Результаты поиска */}
          <div className="results-container">
            <div className="results-header">
              <h2>Результаты поиска</h2>
              <span className="results-count">
                Найдено: {filteredRooms.length} кабинетов
              </span>
            </div>
            
            {isSearching ? (
              <div className="searching-indicator">
                <div className="search-spinner"></div>
                <p>Идет поиск...</p>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="no-results">
                <span className="no-results-icon">🔍</span>
                <h3>Кабинеты не найдены</h3>
                <p>Попробуйте изменить параметры поиска</p>
              </div>
            ) : (
              <div className="rooms-grid">
                {filteredRooms.map(room => (
                  <div key={room.id} className="room-card">
                    <div className="room-header">
                      <span className={`room-status ${room.status}`}>
                        {room.statusDisplay}
                      </span>
                      <span className="room-number">{room.number}</span>
                    </div>
                    
                    <div className="room-info">
                      <div className="info-item">
                        <span className="info-label">Тип:</span>
                        <span className="info-value">{room.typeDisplay}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Вместимость:</span>
                        <span className="info-value">{room.capacity} чел.</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Корпус:</span>
                        <span className="info-value">{room.building}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Этаж:</span>
                        <span className="info-value">{room.floor}</span>
                      </div>
                      {room.equipment && room.equipment.length > 0 && (
                        <div className="info-item">
                          <span className="info-label">Оборудование:</span>
                          <span className="info-value equipment-list">
                            {room.equipment.slice(0, 2).join(', ')}
                            {room.equipment.length > 2 && '...'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="room-actions">
                      <button 
                        className="details-btn"
                        onClick={() => navigate(`/rooms/${room.id}`)}
                      >
                        Подробнее
                      </button>
                      {room.status === 'available' && (
                        <button 
                          className="reserve-btn"
                          onClick={() => handleBookRoom(room.id)}
                          disabled={user.userType === 'student' && !user.studentId}
                        >
                          Забронировать
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;