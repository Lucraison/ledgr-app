import { useState } from 'react';
import { createTransaction, updateTransaction } from '../api';

export default function TransactionForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    type: initial?.type ?? 'expense',
    description: initial?.description ?? '',
    date: initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: initial?.notes ?? '',
    categoryId: initial?.categoryId ?? '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, amount: parseFloat(form.amount), categoryId: form.categoryId || null };
      if (initial?.id) await updateTransaction(initial.id, payload);
      else await createTransaction(payload);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm w-full outline-none focus:border-indigo-500";

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-white mb-4 mt-0">
          {initial?.id ? 'Edit Transaction' : 'Add Transaction'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div className="flex gap-2.5">
            <input className={inputClass} type="number" step="0.01" min="0" placeholder="Amount *" value={form.amount} onChange={e => set('amount', e.target.value)} required />
            <select className={inputClass} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <input className={inputClass} placeholder="Description *" value={form.description} onChange={e => set('description', e.target.value)} required />
          <input className={inputClass} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          <select className={inputClass} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
            <option value="">No category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea className={`${inputClass} resize-y min-h-[70px]`} placeholder="Notes" value={form.notes} onChange={e => set('notes', e.target.value)} />
          {error && <p className="text-red-400 text-xs m-0">{error}</p>}
          <div className="flex gap-3 justify-end mt-2">
            <button type="button" className="px-4 py-2 rounded-lg border border-[#333] bg-transparent text-[#aaa] cursor-pointer hover:border-[#555] hover:text-white transition-colors" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer hover:bg-indigo-600 transition-colors disabled:opacity-70">
              {saving ? '...' : initial?.id ? 'Save Changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
