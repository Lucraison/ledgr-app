import { useState } from 'react';
import { changePassword } from '../api';

export default function ChangePassword({ onClose }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await changePassword({ currentPassword: current, newPassword: next });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-8 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white m-0">Change Password</h2>
          <button className="bg-transparent border-none text-[#555] cursor-pointer hover:text-white text-2xl leading-none" onClick={onClose}>×</button>
        </div>

        {success ? (
          <div className="text-center">
            <p className="text-green-400 mb-4">Password changed successfully!</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer hover:bg-indigo-600 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              className="px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
              type="password" placeholder="Current password" value={current}
              onChange={e => setCurrent(e.target.value)} required
            />
            <input
              className="px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
              type="password" placeholder="New password" value={next}
              onChange={e => setNext(e.target.value)} required minLength={6}
            />
            {error && <p className="text-red-400 text-xs m-0">{error}</p>}
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={onClose} className="w-28 py-2.5 rounded-lg border border-[#555] bg-transparent text-white cursor-pointer text-sm hover:bg-[#2a2a2a] transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer text-sm hover:bg-indigo-600 transition-colors disabled:opacity-70">
                {saving ? '...' : 'Change'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
