import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getUsers, deleteUser, resetPassword } from '../api';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminPage({ onBack, onLogout }) {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [resetingId, setResetingId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState(null);

  async function load() { setUsers(await getUsers()); }
  useEffect(() => { load(); }, []);

  function handleDelete(id) {
    setConfirm({ message: t('deleteUser'), onConfirm: async () => { setConfirm(null); await deleteUser(id); load(); } });
  }

  async function handleReset(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await resetPassword(resetingId, newPassword);
      setSuccess(t('passwordResetSuccess'));
      setResetingId(null); setNewPassword('');
    } catch (err) { setError(err.message); }
  }

  const admins = users.filter(u => u.isAdmin);
  const regular = users.filter(u => !u.isAdmin && u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>Ledgr</span>
          <span className="text-xs text-[#555] uppercase tracking-wide">{t('adminTitle')}</span>
        </div>
      </header>

      <div className="px-4 sm:px-8 py-8 flex flex-col gap-8">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#555] mb-3">{t('administrators')}</h2>
          <div className="flex flex-col gap-2">
            {admins.map(u => (
              <div key={u.id} className="bg-[#1a1a1a] border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
                <span className="font-semibold">{u.username}</span>
                <span className="text-sm bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">{t('adminTitle').toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#555]">{t('users')}</h2>
            <span className="text-xs text-[#555]">{regular.length} result{regular.length !== 1 ? 's' : ''}</span>
          </div>
          <input
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500 mb-3"
            placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
          />
          {success && <p className="text-green-400 text-sm mb-3">{success}</p>}
          <div className="flex flex-col gap-2">
            {regular.length === 0 && <p className="text-[#555] text-sm text-center py-4">No users found.</p>}
            {regular.map(u => (
              <div key={u.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="text-base font-semibold">{u.username}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setResetingId(u.id); setNewPassword(''); setError(''); setSuccess(''); }} className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors text-sm">
                      {t('resetPassword')}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-red-900 text-red-400 bg-transparent cursor-pointer hover:bg-red-900/20 transition-colors text-sm">
                      {t('delete')}
                    </button>
                  </div>
                </div>
                {resetingId === u.id && (
                  <form onSubmit={handleReset} className="mt-3 flex flex-col sm:flex-row gap-2">
                    <input className="flex-1 px-3 py-2 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500" type="text" placeholder={t('newTempPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
                    <div className="flex gap-2">
                      <button type="submit" className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold cursor-pointer hover:bg-indigo-600 transition-colors">{t('set')}</button>
                      <button type="button" onClick={() => setResetingId(null)} className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-[#333] text-[#aaa] text-sm bg-transparent cursor-pointer hover:text-white transition-colors">{t('cancel')}</button>
                    </div>
                  </form>
                )}
                {resetingId === u.id && error && <p className="text-red-400 text-xs mt-2">{error}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
