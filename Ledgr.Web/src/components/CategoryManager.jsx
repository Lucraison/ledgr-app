import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createCategory, updateCategory, deleteCategory } from '../api';
import ConfirmModal from './ConfirmModal';

export default function CategoryManager({ categories, onClose, onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  function startEdit(cat) { setEditing(cat); setName(cat.name); setColor(cat.color); setError(''); }
  function reset() { setEditing(null); setName(''); setColor('#6366f1'); setError(''); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) await updateCategory(editing.id, { name, color });
      else await createCategory({ name, color });
      reset();
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id) {
    setConfirm({ message: t('deleteCategory'), onConfirm: async () => { setConfirm(null); await deleteCategory(id); onSave(); } });
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] shrink-0">
          <h2 className="text-lg font-semibold text-white m-0">{t('categoriesTitle')}</h2>
          <button className="bg-transparent border-none text-[#555] cursor-pointer hover:text-white text-2xl leading-none p-1" onClick={onClose}>×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3">
          {categories.length === 0 && <p className="text-[#555] text-sm text-center py-4">{t('noCategories')}</p>}
          {categories.map(cat => (
            <div key={cat.id} className={`flex items-center justify-between rounded-lg px-3 py-3 border mb-2 transition-colors ${editing?.id === cat.id ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-[#111] border-[#2a2a2a]'}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                <span className="text-sm text-white truncate">{cat.name}</span>
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                <button className="px-3 py-1.5 rounded-md text-xs text-[#aaa] bg-transparent border border-[#333] cursor-pointer hover:border-[#555] hover:text-white transition-colors" onClick={() => editing?.id === cat.id ? reset() : startEdit(cat)}>
                  {editing?.id === cat.id ? t('cancel') : t('edit')}
                </button>
                <button className="px-3 py-1.5 rounded-md text-xs text-red-400 bg-transparent border border-red-900 cursor-pointer hover:bg-red-900/20 transition-colors" onClick={() => handleDelete(cat.id)}>
                  {t('delete')}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-[#2a2a2a] shrink-0">
          <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-3">
            {editing ? `${t('editCategory')}: ${editing.name}` : t('newCategory')}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2.5 items-center">
              <input className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500" placeholder={t('name')} value={name} onChange={e => setName(e.target.value)} required />
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-11 h-10 rounded-lg border border-[#333] bg-[#111] cursor-pointer p-1 shrink-0" />
            </div>
            {error && <p className="text-red-400 text-xs m-0">{error}</p>}
            <div className="flex gap-2.5">
              <button type="button" onClick={reset} className="flex-1 py-2.5 rounded-lg border border-[#333] bg-transparent text-[#aaa] cursor-pointer text-sm hover:border-[#555] hover:text-white transition-colors">
                {editing ? t('cancel') : t('clear')}
              </button>
              <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer text-sm hover:bg-indigo-600 transition-colors disabled:opacity-70">
                {saving ? '...' : editing ? t('save') : t('add')}
              </button>
            </div>
          </form>
        </div>
      </div>
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
