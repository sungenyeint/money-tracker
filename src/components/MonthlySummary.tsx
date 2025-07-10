import React from 'react';
import { Transaction } from '../types/transaction';

interface MonthlySummaryProps {
  transactions: Transaction[];
  selectedMonth?: string;
  onSelectMonth?: (month: string) => void;
  onClearFilter?: () => void;
}

function getMonthlySummary(transactions: Transaction[]) {
  const summary: Record<string, { income: number; expense: number }> = {};
  transactions.forEach((t) => {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!summary[key]) summary[key] = { income: 0, expense: 0 };
    if (t.type === 'income') summary[key].income += t.amount;
    else summary[key].expense += t.amount;
  });
  // Sort by date descending
  return Object.entries(summary)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, { income, expense }]) => ({ month, income, expense }));
}

function formatMonth(month: string) {
  // month is 'YYYY-MM'
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ transactions, selectedMonth, onSelectMonth, onClearFilter }) => {
  const data = getMonthlySummary(transactions);

  if (data.length === 0) {
    return <div className="text-gray-500 text-center py-6">No data to summarize.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center mb-2">
        <h3 className="text-lg font-semibold flex-1">Monthly Summary</h3>
        {selectedMonth && onClearFilter && (
          <button
            onClick={onClearFilter}
            className="ml-2 px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>
      <table className="min-w-full bg-white rounded-xl shadow mt-2">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Month</th>
            <th className="px-4 py-2 text-right text-green-700">Income</th>
            <th className="px-4 py-2 text-right text-red-700">Expense</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ month, income, expense }) => (
            <tr
              key={month}
              className={`border-t cursor-pointer transition-colors ${selectedMonth === month ? 'bg-blue-50 font-bold' : 'hover:bg-gray-50'}`}
              onClick={() => onSelectMonth && onSelectMonth(month)}
            >
              <td className="px-4 py-2 font-medium">{formatMonth(month)}</td>
              <td className="px-4 py-2 text-right text-green-700">${income.toFixed(2)}</td>
              <td className="px-4 py-2 text-right text-red-700">${expense.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlySummary;
