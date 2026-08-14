import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentTab: 'entries' | 'admin';
  setCurrentTab: (tab: 'entries' | 'admin') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-around', 
      background: '#18181b', 
      padding: '1rem', 
      borderTop: '1px solid #27272a',
      color: '#fff'
    }}>
      <button 
        onClick={() => setCurrentTab('entries')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: currentTab === 'entries' ? '#60a5fa' : '#fff', 
          cursor: 'pointer',
          fontWeight: currentTab === 'entries' ? 'bold' : 'normal'
        }}
      >
        ⏱️ Apontamentos
      </button>

      {isAdmin && (
        <button 
          onClick={() => setCurrentTab('admin')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: currentTab === 'admin' ? '#60a5fa' : '#fff', 
            cursor: 'pointer',
            fontWeight: currentTab === 'admin' ? 'bold' : 'normal'
          }}
        >
          📊 DRE (Gestor)
        </button>
      )}
    </nav>
  );
};