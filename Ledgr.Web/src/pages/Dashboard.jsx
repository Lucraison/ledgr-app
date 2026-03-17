import { useEffect, useState } from 'react';
import { Tag, Repeat, Copy, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTransactions, getSummary, deleteTransaction, getCategories, parseToken, getProjections } from '../api';
import TransactionForm from '../components/TransactionForm';
import CategoryManager from '../components/CategoryManager';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';
import RecurringManager from '../components/RecurringManager';
import ConfirmModal from '../components/ConfirmModal';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (n) => n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Dashboard({ showAdd, onShowAddHandled }) {
  const { t, i18n } = useTranslation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [projections, setProjections] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 20;

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function load(p = page) {
    const [txRes, sum, cats, proj] = await Promise.all([
      getTransactions({ year, month, search: search || undefined, type: filterType || undefined, page: p, pageSize: PAGE_SIZE }),
      getSummary({ year, month }),
      getCategories(),
      getProjections({ year, month }),
    ]);
    const items = Array.isArray(txRes) ? txRes : (txRes?.items ?? []);
    const totalCount = Array.isArray(txRes) ? txRes.length : (txRes?.total ?? 0);
    setTransactions(items);
    setTotal(totalCount);
    setSummary(sum);
    setCategories(cats);
    setProjections(proj);
  }

  useEffect(() => { setPage(1); load(1); }, [year, month]);
  useEffect(() => { setPage(1); load(1); }, [search, filterType]);

  useEffect(() => { if (showAdd) { setEditing(null); setShowForm(true); onShowAddHandled(); } }, [showAdd]);

  function handleEdit(tx) { setEditing(tx); setShowForm(true); }
  function handleCopy(tx) {
    setEditing({ amount: tx.amount, type: tx.type, description: tx.description, categoryId: tx.categoryId, notes: tx.notes, isRecurring: false });
    setShowForm(true);
  }
  function handleAdd() { setEditing(null); setShowForm(true); }
  function handleDelete(id) {
    setConfirm({ message: t('deleteTransaction'), onConfirm: async () => { setConfirm(null); await deleteTransaction(id); load(); } });
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const chartData = Object.values(
    transactions
      .filter(tx => tx.type === 'expense')
      .reduce((acc, tx) => {
        const name = tx.category?.name ?? t('uncategorized');
        const color = tx.category?.color ?? '#555';
        if (!acc[name]) acc[name] = { name, value: 0, color };
        acc[name].value += tx.amount;
        return acc;
      }, {})
  );

  const summaryCards = [
    { key: 'income',   label: t('income'),   value: summary.income,   color: '#22c55e' },
    { key: 'expenses', label: t('expenses'),  value: summary.expenses, color: '#f87171' },
    { key: 'balance',  label: t('balance'),   value: summary.balance,  color: '#6366f1' },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans" onClick={() => setOpenMenu(null)}>
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#1e1e1e]">
        <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>Ledgr</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowRecurring(true)} className="p-2 rounded-lg border border-[#333] text-[#555] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors" title={t('recurring')}>
            <Repeat size={16} />
          </button>
          <button onClick={() => setShowCategories(true)} className="p-2 rounded-lg border border-[#333] text-[#555] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors" title={t('categories')}>
            <Tag size={16} />
          </button>
          <select className="px-3 py-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-white text-sm cursor-pointer" value={month} onChange={e => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="px-3 py-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-white text-sm cursor-pointer" value={year} onChange={e => setYear(+e.target.value)}>
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 px-4 sm:px-6 pb-4">
        {/* Summary cards */}
        <div className="flex flex-col gap-3 order-1 sm:flex-1">
          {summaryCards.map(d => (
            <div
              key={d.key}
              className={`bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] transition-all ${d.key !== 'balance' ? 'cursor-pointer hover:border-[#444]' : ''}`}
              style={filterType === d.key ? { outline: `2px solid ${d.color}` } : {}}
              onClick={() => d.key !== 'balance' && setFilterType(f => f === d.key ? '' : d.key)}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: d.color }}>{d.label}</span>
              <span className="text-2xl font-bold">{d.value < 0 ? '-' : ''}€{fmt(Math.abs(d.value))}</span>
            </div>
          ))}
        </div>

        {/* Projected cards */}
        {projections && (
          <div className="flex flex-col gap-3 order-3 sm:order-2 sm:flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#555] -mb-1">{t('projected')}</p>
            {[
              { key: 'month', label: t('monthEnd'), data: projections.month },
              { key: 'year',  label: t('yearEnd'),  data: projections.year  },
            ].map(d => (
              <div key={d.key} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a]">
                <span className="block text-xs font-semibold uppercase tracking-wide mb-2 text-[#555]">{d.label}</span>
                <div className="flex justify-between text-xs text-[#888] mb-1">
                  <span>{t('income')}</span><span className="text-green-400">+€{fmt(d.data.income)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#888] mb-2">
                  <span>{t('expenses')}</span><span className="text-red-400">-€{fmt(d.data.expenses)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-[#2a2a2a] pt-2">
                  <span className="text-[#aaa]">{t('balance')}</span>
                  <span style={{ color: d.data.balance >= 0 ? '#22c55e' : '#f87171' }}>
                    {d.data.balance < 0 ? '-' : '+'}€{fmt(Math.abs(d.data.balance))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Donut chart */}
        {chartData.length > 0 ? (
          <div className="order-4 sm:order-3 sm:flex-1 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] flex flex-col items-center justify-center py-2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} stroke="none">
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  <Label value={`€${fmt(summary.expenses)}`} position="center" fill="#fff" fontSize={15} fontWeight={700} />
                </Pie>
                <Tooltip formatter={v => `€${fmt(v)}`} contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-2">{t('expensesByCategory')}</p>
          </div>
        ) : (
          <div className="order-4 sm:order-3 sm:flex-1 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] flex items-center justify-center min-h-[100px]">
            <p className="text-xs text-[#444] uppercase tracking-wide font-semibold">{t('noExpenses')}</p>
          </div>
        )}

        {/* Transaction list */}
        <div className="order-2 sm:order-4 sm:w-full flex flex-col gap-2 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#555]">{t('transactions')}</p>
            <input
              className="ml-auto px-3 py-1.5 rounded-lg border border-[#333] bg-[#1a1a1a] text-white text-sm outline-none focus:border-indigo-500 w-48"
              placeholder={t('search') ?? 'Search...'}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </div>
          {transactions.length === 0 && <p className="text-[#555] text-center mt-8">{t('noTransactions')}</p>}
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tx.category?.color ?? '#555' }} />
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{tx.description}</div>
                  <div className="text-xs text-[#666] mt-0.5 truncate">
                    {tx.category?.name ?? t('uncategorized')} · {new Date(tx.date).toLocaleDateString()}
                    {tx.parentTransactionId && <span className="ml-1 text-indigo-400">↺</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-bold text-sm mr-1" style={{ color: tx.type === 'income' ? '#22c55e' : '#f87171' }}>
                  {tx.type === 'income' ? '+' : '-'}€{fmt(tx.amount)}
                </span>
                <button className="bg-transparent border-none cursor-pointer p-2 text-[#555] hover:text-white transition-colors" onClick={() => handleCopy(tx)}>
                  <Copy size={15} />
                </button>
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button className="bg-transparent border-none cursor-pointer p-2 text-[#555] hover:text-white transition-colors" onClick={() => setOpenMenu(openMenu === tx.id ? null : tx.id)}>
                    <MoreVertical size={15} />
                  </button>
                  {openMenu === tx.id && (
                    <div className="absolute right-0 top-8 bg-[#222] border border-[#333] rounded-xl shadow-lg z-10 overflow-hidden min-w-[120px]">
                      <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[#aaa] hover:bg-[#2a2a2a] hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left"
                        onClick={() => { setOpenMenu(null); handleEdit(tx); }}>
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-[#2a2a2a] transition-colors cursor-pointer bg-transparent border-none text-left"
                        onClick={() => { setOpenMenu(null); handleDelete(tx.id); }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer text-sm hover:border-[#555] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => { const p = page - 1; setPage(p); load(p); }}
                disabled={page === 1}
              >←</button>
              <span className="text-xs text-[#555]">{page} / {totalPages}</span>
              <button
                className="px-3 py-1.5 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer text-sm hover:border-[#555] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => { const p = page + 1; setPage(p); load(p); }}
                disabled={page === totalPages}
              >→</button>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <TransactionForm
          initial={editing}
          categories={categories}
          onSave={() => { setShowForm(false); load(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showCategories && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategories(false)}
          onSave={load}
        />
      )}

      {showRecurring && (
        <RecurringManager
          onClose={() => setShowRecurring(false)}
          onEdit={tx => { setEditing(tx); setShowForm(true); }}
        />
      )}

      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}
