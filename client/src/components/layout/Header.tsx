import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <div className="logo-container">
        <h2>Fócon<span>Flow</span></h2>
      </div>

      {user && (
        <div className="user-info">
          <span className="role-badge">{user.role}</span>
          <div className="user-details">
            <UserIcon size={18} />
            <span>{user.name}</span>
          </div>
          <button onClick={logout} className="btn-logout" title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
};