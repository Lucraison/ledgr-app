import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Picker({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-white text-sm cursor-pointer hover:border-[#555] transition-colors"
      >
        {selected?.label ?? value}
        <ChevronDown size={14} className={`text-[#555] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-10 left-0 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden min-w-[100px]">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full px-4 py-2.5 text-sm text-left cursor-pointer border-none transition-colors ${o.value === value ? 'text-white font-semibold' : 'text-[#aaa] hover:bg-[#222] hover:text-white'}`}
              style={{ background: o.value === value ? 'var(--accent)22' : 'transparent' }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
