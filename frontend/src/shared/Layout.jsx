import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import HorrorBg from './HorrorBg';
import HUD from './HUD';
import AudioManager from '../services/audio';

export default function Layout() {
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Safely start Tone context on any initial interaction
      AudioManager.init();

      // Check if target is a button or interactive container
      const target = e.target;
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.tagName === 'INPUT' || 
        target.closest('button') || 
        target.closest('a') ||
        target.closest('.map-card') ||
        target.closest('.nav-item') ||
        target.closest('.hud-avatar') ||
        target.closest('.btn-secondary') ||
        target.closest('.btn-primary') ||
        target.closest('.btn-ghost') ||
        target.closest('.lb-row') ||
        target.closest('.friend-row') ||
        target.closest('.room-card');

      if (isInteractive) {
        AudioManager.playClick();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      overflow: 'hidden', position: 'relative',
      background: '#020107',
    }}>
      {/* Atmospheric horror background */}
      <HorrorBg />

      {/* Top HUD — always visible */}
      <HUD />

      {/* Page content */}
      <div style={{
        position: 'absolute', inset: 0,
        zIndex: 10,
        paddingTop: 72, // below HUD
      }}>
        <Outlet />
      </div>
    </div>
  );
}
