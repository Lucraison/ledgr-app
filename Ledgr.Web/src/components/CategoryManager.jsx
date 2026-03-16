import { useState } from 'react';
import { createCategory, updateCategory, deleteCategory } from '../api';

export default function CategoryManager({ categories, onClose, onSave }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function startEdit(cat) {
    setEditing(cat);
    setName(cat.name);
    setColor(cat.color);
    setError('');
  }

  function reset() {
    setEditing(null);
    setName('');
    setColor('#6366f1');
    setError('');
  }

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

  async function handleDelete(id) {
    if (!confirm('Delete this category?')) return;
    await deleteCategory(id);
    onSave();
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 sm:p-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white m-0">Categories</h2>
          <button className="bg-transparent border-none text-[#555] cursor-pointer hover:text-white text-2xl leading-none p-1" onClick={onClose}>×</button>
        </div>

        <div className="flex flex-col gap-2 mb-4 max-h-52 overflow-y-auto">
          {categories.length === 0 && <p className="text-[#555] text-sm text-center py-2">No categories yet.</p>}
          {categories.map(cat => (
            <div key={cat.id} className={`flex items-center justify-between rounded-lg px-3 py-2.5 border transition-colors ${editing?.id === cat.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-[#111] border-[#2a2a2a]'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
                <span className="text-sm text-white truncate">{cat.name}</span>
              </div>
              <div className="flex gap-1 shrink-0 ml-2">
                <button className="p-2 text-[#555] hover:text-white bg-transparent border-none cursor-pointer" onClick={() => editing?.id === cat.id ? reset() : startEdit(cat)}>✏️</button>
                <button className="p-2 text-[#555] hover:text-red-400 bg-transparent border-none cursor-pointer" onClick={() => handleDelete(cat.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 border-t border-[#2a2a2a] pt-4">
          <p className="text-xs text-[#555] uppercase tracking-wide font-semibold m-0">{editing ? 'Edit category' : 'New category'}</p>
          <div className="flex gap-2.5 items-center">
            <input
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm outline-none focus:border-indigo-500"
              placeholder="Name *" value={name} onChange={e => setName(e.target.value)} required
            />
            <input
              type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-11 h-10 rounded-lg border border-[#333] bg-[#111] cursor-pointer p-1 shrink-0"
            />
          </div>
          {error && <p className="text-red-400 text-xs m-0">{error}</p>}
          <div className="flex gap-2.5">
            <button type="button" onClick={reset} className="flex-1 py-2.5 rounded-lg border border-[#555] bg-transparent text-white cursor-pointer text-sm hover:bg-[#2a2a2a] transition-colors">
              {editing ? 'Cancel' : 'Clear'}
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer text-sm hover:bg-indigo-600 transition-colors disabled:opacity-70">
              {saving ? '...' : editing ? 'Save' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
