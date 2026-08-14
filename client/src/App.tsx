import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { TimeEntries } from './pages/TimeEntries';
import { AdminDashboard } from './pages/AdminDashboard';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';

const MainContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState<'entries' | 'admin'>('entries');

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212', color: '#fff' }}>
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem 2rem', 
          background: '#1a1a1a', 
          borderBottom: '1px solid #27272a'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem' }}>FóconFlow</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>Olá, <strong>{user.name}</strong></span>
            <button 
              onClick={logout}
              style={{ padding: '0.4rem 0.8rem', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Sair
            </button>
          </div>
        </header>

        <main style={{ padding: '2rem', flex: 1 }}>
          {currentTab === 'entries' && <TimeEntries />}
          {currentTab === 'admin' && <AdminDashboard />}
        </main>

        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;