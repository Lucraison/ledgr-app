import { useEffect, useState } from 'react';
import { getUsers, deleteUser, resetPassword } from '../api';

export default function AdminPage({ onBack, onLogout }) {
  const [users, setUsers] = useState([]);
  const [resetingId, setResetingId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const data = await getUsers();
    setUsers(data);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this user? This will remove all their data.')) return;
    await deleteUser(id);
    load();
  }

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await resetPassword(resetingId, newPassword);
      setSuccess('Password reset successfully.');
      setResetingId(null);
      setNewPassword('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-indigo-500">Ledgr</span>
          <span className="text-xs text-[#555] uppercase tracking-wide">Admin</span>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="border border-[#333] text-[#aaa] rounded-lg px-4 py-1.5 cursor-pointer text-sm bg-transparent hover:border-[#555] hover:text-white transition-colors">
            ← Dashboard
          </button>
          <button onClick={onLogout} className="border border-[#333] text-[#aaa] rounded-lg px-4 py-1.5 cursor-pointer text-sm bg-transparent hover:border-[#555] hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="px-8 py-8">
        <h2 className="text-xl font-semibold mb-6">Users</h2>

        {success && <p className="text-green-400 text-sm mb-4">{success}</p>}

        <div className="flex flex-col gap-3">
          {users.map(u => (
            <div key={u.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">{u.username}</span>
                  {u.isAdmin && <span className="text-sm bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full">admin</span>}
                </div>
                {!u.isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setResetingId(u.id); setNewPassword(''); setError(''); setSuccess(''); }}
                      className="px-5 py-2 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors"
                    >
                      Reset password
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-5 py-2 rounded-lg border border-red-900 text-red-400 bg-transparent cursor-pointer hover:bg-red-900/20 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {resetingId === u.id && (
                <form onSubmit={handleReset} className="mt-3 flex gap-2 items-center">
                  <input
                    className="flex-1 px-3 py-2 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
                    type="text" placeholder="New temporary password *"
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6}
                  />
                  <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-500 text-white text-sm font-semibold cursor-pointer hover:bg-indigo-600 transition-colors">
                    Set
                  </button>
                  <button type="button" onClick={() => setResetingId(null)} className="px-4 py-2 rounded-lg border border-[#333] text-[#aaa] text-sm bg-transparent cursor-pointer hover:text-white transition-colors">
                    Cancel
                  </button>
                </form>
              )}
              {resetingId === u.id && error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
