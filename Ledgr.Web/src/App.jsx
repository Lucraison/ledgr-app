import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState('dashboard');

  function handleLogin() {
    setToken(localStorage.getItem('token'));
    setPage('dashboard');
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setPage('dashboard');
  }

  if (!token) return <Login onLogin={handleLogin} />;
  if (page === 'admin') return <AdminPage onBack={() => setPage('dashboard')} onLogout={handleLogout} />;
  if (page === 'profile') return <ProfilePage onBack={() => setPage('dashboard')} onLogout={handleLogout} />;
  return <Dashboard onLogout={handleLogout} onAdmin={() => setPage('admin')} onProfile={() => setPage('profile')} />;
}
