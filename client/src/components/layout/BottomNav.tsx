import React from 'react';
import { NavLink } from 'react-router-dom';

export const BottomNav: React.FC = () => {
  return (
    <nav 
      className="mobile-bottom-nav"
      style={{ 
        justifyContent: 'space-around', 
        padding: '0.8rem', 
        background: '#1a1a1a', 
        borderTop: '1px solid #27272a' 
      }}
    >
      <NavLink
        to="/entries"
        style={({ isActive }) => ({
          color: isActive ? '#10b981' : '#a1a1aa',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: isActive ? 'bold' : 'normal',
        })}
      >
        ⏱️ Apontamentos
      </NavLink>

      <NavLink
        to="/admin"
        style={({ isActive }) => ({
          color: isActive ? '#10b981' : '#a1a1aa',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: isActive ? 'bold' : 'normal',
        })}
      >
        📊 DRE (Gestor)
      </NavLink>
    </nav>
  );
};