import { useEffect, useState } from 'react';
import { getTransactions, getSummary, deleteTransaction, getCategories, parseToken } from '../api';
import TransactionForm from '../components/TransactionForm';
import CategoryManager from '../components/CategoryManager';
import ChangePassword from '../components/ChangePassword';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard({ onLogout, onAdmin }) {
  const { isAdmin } = parseToken();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [filterType, setFilterType] = useState('');

  async function load() {
    const [txs, sum, cats] = await Promise.all([
      getTransactions({ year, month }),
      getSummary({ year, month }),
      getCategories(),
    ]);
    setTransactions(txs);
    setSummary(sum);
    setCategories(cats);
  }

  useEffect(() => { load(); }, [year, month]);

  function handleEdit(tx) { setEditing(tx); setShowForm(true); }
  function handleAdd() { setEditing(null); setShowForm(true); }
  async function handleDelete(id) {
    if (!confirm('Delete this transaction?')) return;
    await deleteTransaction(id);
    load();
  }

  const filtered = filterType ? transactions.filter(t => t.type === filterType) : transactions;

  const chartData = Object.values(
    transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const name = t.category?.name ?? 'Uncategorized';
        const color = t.category?.color ?? '#555';
        if (!acc[name]) acc[name] = { name, value: 0, color };
        acc[name].value += t.amount;
        return acc;
      }, {})
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e]">
        <span className="text-xl font-bold text-indigo-500">Ledgr</span>
        <div className="flex gap-2">
          {isAdmin === 'True' && (
            <button onClick={onAdmin} className="border border-[#333] text-[#aaa] rounded-lg px-4 py-1.5 cursor-pointer text-sm bg-transparent hover:border-indigo-500 hover:text-indigo-400 transition-colors">
              Admin
            </button>
          )}
          <button onClick={() => setShowChangePassword(true)} className="border border-[#333] text-[#aaa] rounded-lg px-4 py-1.5 cursor-pointer text-sm bg-transparent hover:border-[#555] hover:text-white transition-colors">
            Password
          </button>
          <button onClick={onLogout} className="border border-[#333] text-[#aaa] rounded-lg px-4 py-1.5 cursor-pointer text-sm bg-transparent hover:border-[#555] hover:text-white transition-colors">
            Logout
          </button>
        </div>
      </header>

      <div className="flex gap-3 px-6 py-4 items-center">
        <select
          className="px-3 py-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-white text-sm cursor-pointer"
          value={month} onChange={e => setMonth(+e.target.value)}
        >
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select
          className="px-3 py-2 rounded-lg border border-[#333] bg-[#1a1a1a] text-white text-sm cursor-pointer"
          value={year} onChange={e => setYear(+e.target.value)}
        >
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button
          className="ml-auto px-4 py-2 rounded-lg border border-[#333] text-[#aaa] bg-transparent cursor-pointer hover:border-[#555] hover:text-white transition-colors text-sm"
          onClick={() => setShowCategories(true)}
        >
          Categories
        </button>
        <button
          className="px-4 py-2 rounded-lg bg-indigo-500 text-white font-semibold cursor-pointer hover:bg-indigo-600 transition-colors"
          onClick={handleAdd}
        >
          + Add
        </button>
      </div>

      <div className="flex gap-4 px-6 pb-4 items-stretch">
        <div className="flex flex-col gap-3 flex-1">
          {[
            { name: 'Income', value: summary.income, color: '#22c55e' },
            { name: 'Expenses', value: summary.expenses, color: '#f87171' },
            { name: 'Balance', value: summary.balance, color: '#6366f1' },
          ].map(d => (
            <div
              key={d.name}
              className={`bg-[#1a1a1a] rounded-xl p-4 border border-[#2a2a2a] transition-all ${d.name !== 'Balance' ? 'cursor-pointer hover:border-[#444]' : ''}`}
              style={filterType === d.name.toLowerCase() ? { outline: `2px solid ${d.color}` } : {}}
              onClick={() => d.name !== 'Balance' && setFilterType(f => f === d.name.toLowerCase() ? '' : d.name.toLowerCase())}
            >
              <span className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: d.color }}>{d.name}</span>
              <span className="text-2xl font-bold">{d.value < 0 ? '-' : ''}€{Math.abs(d.value).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {chartData.length > 0 ? (
          <div className="flex-1 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] flex flex-col items-center justify-center py-2">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} stroke="none">
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  <Label value={`€${summary.expenses.toFixed(2)}`} position="center" fill="#fff" fontSize={15} fontWeight={700} />
                </Pie>
                <Tooltip formatter={v => `€${v.toFixed(2)}`} contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#aaa' }} />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-[#555] uppercase tracking-wide font-semibold mb-2">Expenses by category</p>
          </div>
        ) : (
          <div className="flex-1 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] flex items-center justify-center">
            <p className="text-xs text-[#444] uppercase tracking-wide font-semibold">No expenses yet</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 flex flex-col gap-2">
        {filtered.length === 0 && <p className="text-[#555] text-center mt-8">No transactions this month.</p>}
        {filtered.map(tx => (
          <div key={tx.id} className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3 border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: tx.category?.color ?? '#555' }} />
              <div>
                <div className="text-sm font-medium">{tx.description}</div>
                <div className="text-xs text-[#666] mt-0.5">{tx.category?.name ?? 'Uncategorized'} · {new Date(tx.date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm mr-2" style={{ color: tx.type === 'income' ? '#22c55e' : '#f87171' }}>
                {tx.type === 'income' ? '+' : '-'}€{tx.amount.toFixed(2)}
              </span>
              <button className="bg-transparent border-none cursor-pointer p-1 text-[#555] hover:text-white transition-colors" onClick={() => handleEdit(tx)}>✏️</button>
              <button className="bg-transparent border-none cursor-pointer p-1 text-[#555] hover:text-white transition-colors" onClick={() => handleDelete(tx.id)}>🗑️</button>
            </div>
          </div>
        ))}
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

      {showChangePassword && <ChangePassword onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}
