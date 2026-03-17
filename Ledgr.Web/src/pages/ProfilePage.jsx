import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseToken } from '../api';
import ChangePassword from '../components/ChangePassword';
import { THEME_COLORS, applyTheme } from '../theme';

export default function ProfilePage({ onBack, onLogout, onAdmin }) {
  const { t, i18n } = useTranslation();
  const { name, isAdmin } = parseToken();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [accentColor, setAccentColor] = useState(localStorage.getItem('theme-color') ?? '#6366f1');

  function handleColorChange(color) {
    setAccentColor(color);
    applyTheme(color);
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#1e1e1e]" style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>Ledgr</span>
          <span className="text-xs text-[#555] uppercase tracking-wide">Profile</span>
        </div>
      </header>

      <div className="px-4 py-8 max-w-lg mx-auto flex flex-col gap-6">

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-4">Account</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold">
              {name?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-lg">{name}</p>
              <p className="text-xs text-[#555]">Member</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-4">Language</p>
          <div className="flex flex-col gap-2">
            {[
              { code: 'en', label: 'English' },
              { code: 'es', label: 'Español' },
              { code: 'fr', label: 'Français' },
            ].map(lng => (
              <button
                key={lng.code}
                onClick={() => i18n.changeLanguage(lng.code)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors text-sm ${i18n.language === lng.code ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-[#2a2a2a] bg-[#111] text-[#aaa] hover:border-[#444] hover:text-white'}`}
              >
                <span>{lng.label}</span>
                {i18n.language === lng.code && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-4">Accent color</p>
          <div className="flex gap-4 flex-wrap justify-center">
            {THEME_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => handleColorChange(c.value)}
                title={c.name}
                className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 border-2"
                style={{
                  background: c.value,
                  borderColor: accentColor === c.value ? '#fff' : 'transparent',
                  boxShadow: accentColor === c.value ? `0 0 0 1px ${c.value}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
          <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-4">Security</p>
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full px-4 py-3 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors text-sm text-left"
          >
            {t('changePassword')} →
          </button>
        </div>

        {isAdmin === 'True' && (
          <button
            onClick={onAdmin}
            className="w-full px-4 py-3 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] text-[#aaa] cursor-pointer hover:border-[#444] hover:text-white transition-colors text-sm font-medium text-left"
          >
            {t('admin')} →
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full px-4 py-3 rounded-xl border border-red-900 text-red-400 bg-transparent cursor-pointer hover:bg-red-900/20 transition-colors text-sm font-medium"
        >
          {t('logout')}
        </button>

      </div>

      {showChangePassword && <ChangePassword onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}
