import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { parseToken } from '../api';
import ChangePassword from '../components/ChangePassword';

export default function ProfilePage({ onBack, onLogout }) {
  const { t, i18n } = useTranslation();
  const { name } = parseToken();
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-indigo-500">Ledgr</span>
          <span className="text-xs text-[#555] uppercase tracking-wide">Profile</span>
        </div>
        <div className="flex gap-2">
          <button onClick={onBack} className="border border-[#333] text-[#aaa] rounded-lg px-3 py-2 cursor-pointer text-sm bg-transparent hover:border-[#555] hover:text-white transition-colors">
            ← Dashboard
          </button>
          <button onClick={onLogout} className="border border-[#333] text-[#aaa] rounded-lg px-3 py-2 cursor-pointer text-sm bg-transparent hover:border-[#555] hover:text-white transition-colors">
            {t('logout')}
          </button>
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
          <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-4">Security</p>
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full px-4 py-3 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors text-sm text-left"
          >
            {t('changePassword')} →
          </button>
        </div>

      </div>

      {showChangePassword && <ChangePassword onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}
