import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './UserAccount.css';

const UserAccount: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!user) return null;

  const getDisplayName = () => {
    return `${user.lastName}, ${user.firstName}`;
  };

  const getInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <div className="user-account">
      <button 
        className="user-account-trigger"
        onClick={toggleDropdown}
      >
        <div className="user-avatar">
          {getInitials()}
        </div>
        <span className="user-name">{getDisplayName()}</span>
        <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isDropdownOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar large">
                {getInitials()}
              </div>
              <div className="user-details">
                <h3>{getDisplayName()}</h3>
                <p className="user-id">
                  {user.userType === 'student' ? user.studentId : user.id}
                </p>
                <p className="user-program">
                  {user.program || user.userType.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="dropdown-content">
            <div className="college-info">
              <h4>Carmean Community College</h4>
              <p>Registrar</p>
            </div>
          </div>

          <div className="dropdown-actions">
            <button 
              className="sign-out-btn"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccount;