import React from 'react';
import { useNavigate } from 'react-router-dom';
import MediaQueryImage from '../../components/MediaQueryImage';
import '../../App.css'
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