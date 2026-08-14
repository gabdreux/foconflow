import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  return (
    <aside className="desktop-sidebar" style={{ width: '240px', background: '#18181b', padding: '1.5rem 1rem', borderRight: '1px solid #27272a' }}>
      <div style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
        <h2 style={{ fontSize: '1rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
          FóconFlow Menu
        </h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <NavLink
          to="/entries"
          style={({ isActive }) => ({
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            color: isActive ? '#ffffff' : '#a1a1aa',
            background: isActive ? '#27272a' : 'transparent',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: isActive ? 600 : 400,
            border: 'none',
            outline: 'none'
          })}
        >
          <span>⏱️</span> Apontamentos
        </NavLink>

        <NavLink
          to="/admin"
          style={({ isActive }) => ({
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            color: isActive ? '#ffffff' : '#a1a1aa',
            background: isActive ? '#27272a' : 'transparent',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontWeight: isActive ? 600 : 400,
            border: 'none',
            outline: 'none'
          })}
        >
          <span>📊</span> Visão do Gestor (DRE)
        </NavLink>
      </nav>
    </aside>
  );
};