import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createTransaction, updateTransaction } from '../api';

export default function TransactionForm({ initial, categories, onSave, onCancel }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    amount: initial?.amount ?? '',
    type: initial?.type ?? 'expense',
    description: initial?.description ?? '',
    date: initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    notes: initial?.notes ?? '',
    categoryId: initial?.categoryId ?? '',
    isRecurring: initial?.isRecurring ?? false,
    frequency: initial?.frequency ?? 2,
    nextOccurrence: initial?.nextOccurrence
      ? initial.nextOccurrence.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount.toString().replace(',', '.')),
        categoryId: form.categoryId || null,
        frequency: form.isRecurring ? parseInt(form.frequency) : null,
        nextOccurrence: form.isRecurring ? form.nextOccurrence : null,
      };
      if (initial?.id) await updateTransaction(initial.id, payload);
      else await createTransaction(payload);
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "px-3 py-2 rounded-lg border border-[#333] bg-[#111] text-white text-sm w-full outline-none focus:border-indigo-500";
  const isExpense = form.type === 'expense';

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold text-white mb-3 mt-0">
          {initial?.id ? t('editTransaction') : t('addTransaction')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">

          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-[#333]">
            <button type="button" onClick={() => set('type', 'expense')}
              className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${isExpense ? 'bg-red-500/20 text-red-400 border-r border-red-500/30' : 'bg-transparent text-[#555] border-r border-[#333] hover:text-[#aaa]'}`}>
              {t('expense')}
            </button>
            <button type="button" onClick={() => set('type', 'income')}
              className={`flex-1 py-2 text-sm font-semibold transition-colors cursor-pointer ${!isExpense ? 'bg-green-500/20 text-green-400' : 'bg-transparent text-[#555] hover:text-[#aaa]'}`}>
              {t('incomeLabel')}
            </button>
          </div>

          {/* Amount */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xl font-bold" style={{ color: isExpense ? '#f87171' : '#22c55e' }}>€</span>
            <input
              className="w-full pl-9 pr-4 py-3 rounded-lg border border-[#333] bg-[#111] text-white text-xl font-bold outline-none focus:border-indigo-500 placeholder:text-[#333]"
              type="text" inputMode="decimal" placeholder="0,00"
              value={form.amount} onChange={e => set('amount', e.target.value)} required
            />
          </div>

          {/* Description + Date on same row */}
          <input className={inputClass} placeholder={t('description')} value={form.description} onChange={e => set('description', e.target.value)} required />
          <input className={inputClass} type="date" value={form.date} onChange={e => set('date', e.target.value)} />

          {/* Category chips */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => set('categoryId', '')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${!form.categoryId ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 'border-[#333] text-[#555] hover:text-[#aaa] hover:border-[#555]'}`}>
                {t('noCategory')}
              </button>
              {categories.map(c => (
                <button key={c.id} type="button" onClick={() => set('categoryId', c.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer border ${form.categoryId === c.id ? 'border-transparent text-white' : 'border-[#333] text-[#555] hover:text-[#aaa] hover:border-[#555]'}`}
                  style={form.categoryId === c.id ? { background: c.color + '33', borderColor: c.color, color: c.color } : {}}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Notes */}
          <textarea className={`${inputClass} resize-none`} rows={2} placeholder={t('notes')} value={form.notes} onChange={e => set('notes', e.target.value)} />

          {/* Recurring toggle */}
          <button type="button" onClick={() => set('isRecurring', !form.isRecurring)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors cursor-pointer w-full ${form.isRecurring ? 'border-indigo-500 bg-indigo-500/10' : 'border-[#333] bg-transparent hover:border-[#555]'}`}>
            <span className={`text-sm font-medium ${form.isRecurring ? 'text-indigo-400' : 'text-[#aaa]'}`}>{t('recurringTransaction')}</span>
            <div className={`w-10 h-5.5 rounded-full relative transition-colors ${form.isRecurring ? 'bg-indigo-500' : 'bg-[#333]'}`} style={{height:'22px',width:'40px'}}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isRecurring ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
          </button>

          {form.isRecurring && (
            <div className="flex gap-2 bg-[#111] border border-[#2a2a2a] rounded-lg p-2.5">
              <div className="flex-1">
                <label className="text-xs text-[#555] uppercase tracking-wide block mb-1">{t('frequency')}</label>
                <select className={inputClass} value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                  <option value={0}>{t('daily')}</option>
                  <option value={1}>{t('weekly')}</option>
                  <option value={2}>{t('monthly')}</option>
                  <option value={3}>{t('yearly')}</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-[#555] uppercase tracking-wide block mb-1">{t('firstOccurrence')}</label>
                <input className={inputClass} type="date" value={form.nextOccurrence} onChange={e => set('nextOccurrence', e.target.value)} />
              </div>
            </div>
          )}

          {error && <p className="text-red-400 text-xs m-0">{error}</p>}

          <div className="flex gap-3 justify-end mt-1">
            <button type="button" className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-[#333] bg-transparent text-[#aaa] cursor-pointer hover:border-[#555] hover:text-white transition-colors" onClick={onCancel}>
              {t('cancel')}
            </button>
            <button type="submit" disabled={saving} className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer hover:bg-indigo-600 transition-colors disabled:opacity-70">
              {saving ? '...' : initial?.id ? t('saveChanges') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
