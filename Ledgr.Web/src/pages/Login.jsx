import { useState } from 'react';
import { login, register } from '../api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isRegister ? await register(username, password) : await login(username, password);
      localStorage.setItem('token', res.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="bg-[#1a1a1a] p-8 rounded-xl w-full max-w-sm border border-[#2a2a2a]">
        <h1 className="text-3xl font-bold text-white m-0">Ledgr</h1>
        <p className="text-[#888] mt-1 mb-6">Personal finance tracker</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
            type="text" placeholder="Username" value={username}
            onChange={e => setUsername(e.target.value)} required
          />
          <input
            className="px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
            type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} required
            minLength={isRegister ? 6 : undefined}
          />
          {error && <p className="text-red-400 text-sm m-0">{error}</p>}
          <button
            className="py-2.5 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer text-sm hover:bg-indigo-600 transition-colors disabled:opacity-70"
            type="submit" disabled={loading}
          >
            {loading ? '...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <button
          className="mt-4 bg-transparent border-none text-indigo-400 cursor-pointer text-sm hover:text-indigo-300"
          onClick={() => setIsRegister(v => !v)}
        >
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </button>
      </div>
    </div>
  );
}
