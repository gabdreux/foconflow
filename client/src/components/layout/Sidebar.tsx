import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: 'entries' | 'admin';
  setCurrentTab: (tab: 'entries' | 'admin') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <aside style={{ width: '250px', background: '#18181b', padding: '1.5rem', borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>
        FóconFlow Menu
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button 
          onClick={() => setCurrentTab('entries')}
          style={{ textAlign: 'left', background: currentTab === 'entries' ? '#27272a' : 'transparent', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer' }}
        >
          ⏱️ Apontamentos
        </button>
        
        {isAdmin && (
          <button 
            onClick={() => setCurrentTab('admin')}
            style={{ textAlign: 'left', background: currentTab === 'admin' ? '#27272a' : 'transparent', color: '#fff', border: 'none', padding: '0.7rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            📊 Visão do Gestor (DRE)
          </button>
        )}
      </nav>
    </aside>
  );
};