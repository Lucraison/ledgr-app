import { Home, User, ShieldCheck, Plus } from 'lucide-react';

const NavBtn = ({ onClick, active, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 py-3 cursor-pointer bg-transparent border-none transition-colors flex-1 ${active ? 'text-white' : 'text-[#444] hover:text-[#888]'}`}
  >
    {icon(active)}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default function BottomNav({ page, onNavigate, onAdd, isAdmin }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#1e1e1e] flex items-center z-40"
      style={{ background: '#111', paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '60px' }}
    >
      <NavBtn onClick={() => onNavigate('dashboard')} active={page === 'dashboard'} label="Home"
        icon={a => <Home size={22} strokeWidth={a ? 2.5 : 1.8} />} />

      {/* FAB */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg cursor-pointer border-none transition-transform active:scale-95 -mt-4"
          style={{ background: 'var(--accent)' }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      <NavBtn onClick={() => onNavigate('profile')} active={page === 'profile'} label="Profile"
        icon={a => <User size={22} strokeWidth={a ? 2.5 : 1.8} />} />
    </nav>
  );
}
