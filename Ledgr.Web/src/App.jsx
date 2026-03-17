import { useState, useEffect } from 'react';
import { loadTheme } from './theme';
import { parseToken } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';

export default function App() {
  useEffect(() => { loadTheme(); }, []);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [page, setPage] = useState('dashboard');
  const [showAdd, setShowAdd] = useState(false);

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

  const { isAdmin } = parseToken();

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-32 md:pb-0">
      {page === 'dashboard' && <Dashboard onLogout={handleLogout} showAdd={showAdd} onShowAddHandled={() => setShowAdd(false)} onNavigate={setPage} isAdmin={isAdmin} />}
      {page === 'admin' && <AdminPage onBack={() => setPage('dashboard')} onLogout={handleLogout} />}
      {page === 'profile' && <ProfilePage onBack={() => setPage('dashboard')} onLogout={handleLogout} onAdmin={() => setPage('admin')} />}
      <BottomNav page={page} onNavigate={setPage} onAdd={() => setShowAdd(true)} isAdmin={isAdmin} />
    </div>
  );
}
