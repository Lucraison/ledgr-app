import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { login, register } from '../api';

export default function Login({ onLogin }) {
  const { t, i18n } = useTranslation(); // i18n used for regLanguage
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [regLanguage, setRegLanguage] = useState(i18n.language?.slice(0, 2) ?? 'en');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = isRegister ? await register(username, password, regLanguage) : await login(username, password);
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
      <div className="bg-[#1a1a1a] p-8 rounded-xl w-full max-w-md border border-[#2a2a2a]">
        <h1 className="text-3xl font-bold text-white m-0 mb-1">Ledgr</h1>
        <p className="text-[#888] mt-1 mb-6">{t('personalFinance')}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
            type="text" placeholder={t('username')} value={username}
            onChange={e => setUsername(e.target.value)} required
          />
          <input
            className="px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
            type="password" placeholder={t('password')} value={password}
            onChange={e => setPassword(e.target.value)} required
            minLength={isRegister ? 6 : undefined}
          />
          {isRegister && (
            <div>
              <label className="text-xs text-[#555] uppercase tracking-wide block mb-1">Language preference</label>
              <div className="flex gap-2">
                {[
                  { code: 'en', flag: '🇬🇧', label: 'English' },
                  { code: 'es', flag: '🇪🇸', label: 'Español' },
                  { code: 'fr', flag: '🇫🇷', label: 'Français' },
                ].map(lng => (
                  <button
                    key={lng.code}
                    type="button"
                    onClick={() => { setRegLanguage(lng.code); i18n.changeLanguage(lng.code); }}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${regLanguage === lng.code ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-[#333] bg-[#111] text-[#aaa] hover:border-[#555] hover:text-white'}`}
                  >
                    <span className="text-xl">{lng.flag}</span>
                    <span>{lng.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {error && <p className="text-red-400 text-sm m-0">{error}</p>}
          <button
            className="py-2.5 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer text-sm hover:bg-indigo-600 transition-colors disabled:opacity-70"
            type="submit" disabled={loading}
          >
            {loading ? '...' : isRegister ? t('register') : t('login')}
          </button>
        </form>
        <button
          className="mt-4 bg-transparent border-none text-indigo-400 cursor-pointer text-sm hover:text-indigo-300"
          onClick={() => setIsRegister(v => !v)}
        >
          {isRegister ? t('haveAccount') : t('noAccount')}
        </button>
      </div>
    </div>
  );
}
