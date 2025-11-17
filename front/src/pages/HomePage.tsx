// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MediaQueryImage from '../components/MediaQueryImage';
import '../App.css';
import Tabs from '../components/Tabs';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <img src="/images/mtuci.jpg" alt="mtuci" />
        </div>
        <nav className="nav">
          <Tabs />
        </nav>
        <div className="login">
          <button 
            onClick={handleLoginClick}
            className="link-login"
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: 'inherit',
              fontFamily: 'inherit'
            }}
          >
            Login
          </button>
        </div>
      </header>

      <main>
        <MediaQueryImage /> 
      </main>
    </>
  );
};

export default HomePage;