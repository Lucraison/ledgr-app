import { useEffect, useState } from 'react';
import { getTemplates, stopRecurrence, deleteTransaction } from '../api';

const FREQUENCY = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

export default function RecurringManager({ onClose, onEdit }) {
  const [templates, setTemplates] = useState([]);

  async function load() {
    setTemplates(await getTemplates());
  }

  useEffect(() => { load(); }, []);

  async function handleStop(id) {
    if (!confirm('Stop this recurring transaction? Past entries will remain.')) return;
    await stopRecurrence(id);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this recurring transaction entirely?')) return;
    await deleteTransaction(id);
    load();
  }

  return (
    <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl w-full max-w-lg flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a] shrink-0">
          <h2 className="text-lg font-semibold text-white m-0">Recurring</h2>
          <button className="bg-transparent border-none text-[#555] cursor-pointer hover:text-white text-2xl leading-none p-1" onClick={onClose}>×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-3">
          {templates.length === 0 && (
            <p className="text-[#555] text-sm text-center py-8">No recurring transactions yet.<br />Add one by checking "Recurring transaction" in the form.</p>
          )}
          {templates.map(t => (
            <div key={t.id} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 mb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{t.description}</span>
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{FREQUENCY[t.frequency]}</span>
                    <span className={`text-xs font-bold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}€{t.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-[#555] mt-1">
                    {t.category?.name ?? 'Uncategorized'} · Next: {t.nextOccurrence ? new Date(t.nextOccurrence).toLocaleDateString() : '—'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { onClose(); onEdit(t); }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleStop(t.id)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer hover:border-indigo-500 hover:text-indigo-400 transition-colors text-xs"
                >
                  Stop
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-red-900 text-red-400 bg-transparent cursor-pointer hover:bg-red-900/20 transition-colors text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
