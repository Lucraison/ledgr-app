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

  const inputClass = "px-3.5 py-2.5 rounded-lg border border-[#333] bg-[#111] text-white text-sm w-full outline-none focus:border-indigo-500";

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-4 mt-0">
          {initial?.id ? t('editTransaction') : t('addTransaction')}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input className={inputClass} type="text" inputMode="decimal" placeholder={t('amount')} value={form.amount} onChange={e => set('amount', e.target.value)} required />
            <select className={inputClass} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="expense">{t('expense')}</option>
              <option value="income">{t('incomeLabel')}</option>
            </select>
          </div>
          <input className={inputClass} placeholder={t('description')} value={form.description} onChange={e => set('description', e.target.value)} required />
          <input className={inputClass} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
          <select className={inputClass} value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
            <option value="">{t('noCategory')}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <textarea className={`${inputClass} resize-y min-h-[70px]`} placeholder={t('notes')} value={form.notes} onChange={e => set('notes', e.target.value)} />

          <label className="flex items-center gap-2 text-sm text-[#aaa] cursor-pointer select-none">
            <input type="checkbox" checked={form.isRecurring} onChange={e => set('isRecurring', e.target.checked)} className="w-4 h-4 accent-indigo-500" />
            {t('recurringTransaction')}
          </label>

          {form.isRecurring && (
            <div className="flex flex-col gap-2.5 bg-[#111] border border-[#2a2a2a] rounded-lg p-3">
              <div className="flex gap-2.5">
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
            </div>
          )}

          {error && <p className="text-red-400 text-xs m-0">{error}</p>}
          <div className="flex gap-3 justify-end mt-2">
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
