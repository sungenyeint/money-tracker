import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/transaction';
import * as XLSX from 'xlsx';
import { HookData } from 'jspdf-autotable';

interface TransactionHistoryProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onUpdate: (id: string) => void;
    showAll?: boolean;
}

type ExportRow = {
    'No.': number;
    'Date': string;
    'Type': string;
    'Category': string;
    'Description': string;
    'Amount': number;
  };

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
    transactions,
    onDelete,
    onUpdate,
    showAll = false
}) => {
    // Advanced filter states
    const [filterType, setFilterType] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('');
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterMonth, setFilterMonth] = useState<string>('');

    // Dropdown open state
    const [exportOpen, setExportOpen] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClick(event: MouseEvent) {
            if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
                setExportOpen(false);
            }
        }
        if (exportOpen) {
            document.addEventListener('mousedown', handleClick);
        } else {
            document.removeEventListener('mousedown', handleClick);
        }
        return () => document.removeEventListener('mousedown', handleClick);
    }, [exportOpen]);

    // Get categories based on type
    const categories = useMemo(() => {
        if (filterType === 'income') return INCOME_CATEGORIES.map(cat => ({ type: 'income', name: cat }));
        if (filterType === 'expense') return EXPENSE_CATEGORIES.map(cat => ({ type: 'expense', name: cat }));
        // For 'all', combine and tag with type
        return [
            ...INCOME_CATEGORIES.map(cat => ({ type: 'income', name: cat })),
            ...EXPENSE_CATEGORIES.map(cat => ({ type: 'expense', name: cat })),
        ];
    }, [filterType]);

    // Get unique years and months from transactions
    const years = useMemo(() => {
        const uniqueYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];
        return uniqueYears.sort((a, b) => b - a);
    }, [transactions]);
    const months = useMemo(() => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames.map((name, index) => ({ name, value: index + 1 }));
    }, []);

    // Filter transactions based on all filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            // Type filter
            if (filterType !== 'all' && transaction.type !== filterType) return false;
            // Category filter
            if (filterCategory && transaction.category !== filterCategory) return false;
            // Year/month filter
            const txDate = new Date(transaction.date);
            if (filterYear && txDate.getFullYear() !== parseInt(filterYear)) return false;
            if (filterMonth && (txDate.getMonth() + 1) !== parseInt(filterMonth)) return false;
            return true;
        });
    }, [transactions, filterType, filterCategory, filterYear, filterMonth]);

    // Total amount for filtered results
    const totalAmount = useMemo(() => {
        return filteredTransactions.reduce((sum, t) => {
            return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);
    }, [filteredTransactions]);

    // Helper: Prepare export data
    const getExportData = (): ExportRow[] =>
        filteredTransactions.map((t, idx) => ({
            'No.': idx + 1,
            'Date': t.date,
            'Type': t.type,
            'Category': t.category,
            'Description': t.description,
            'Amount': t.amount,
        }));

    // Helper: Export to PDF
    const exportToPDF = async (data: ExportRow[]) => {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();
        // Load logo as base64
        const getBase64FromUrl = async (url: string) => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };
        const logoBase64 = await getBase64FromUrl('/logo.png');
        // Add logo
        doc.addImage(logoBase64, 'PNG', 14, 8, 20, 20);
        // Title
        doc.setFontSize(18);
        doc.text('Transaction Summary', 38, 18);
        // Export date
        doc.setFontSize(11);
        const exportDate = new Date().toLocaleString();
        doc.text(`Exported: ${exportDate}`, 38, 26);
        // Summary stats
        const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netTotal = totalIncome - totalExpense;
        doc.setFontSize(11);
        doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 14, 36);
        doc.text(`Total Expense: $${totalExpense.toFixed(2)}`, 70, 36);
        doc.text(`Net Total: $${netTotal.toFixed(2)}`, 140, 36);
        // Table below summary
        autoTable(doc, {
            startY: 42,
            head: [["No.", "Date", "Type", "Category", "Description", "Amount"]],
            body: data.map(row => [row['No.'], row['Date'], row['Type'], row['Category'], row['Description'], row['Amount']]),
            styles: { fontSize: 10 },
            headStyles: { fillColor: [59, 130, 246] }, // blue
            didDrawPage: (data: HookData) => {
                // Footer
                const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text('Generated by Money Tracker', data.settings.margin.left, pageHeight - 10);
            },
        });
        doc.save('transactions.pdf');
    };

    // Helper: Export to CSV or XLSX
    const exportToSheet = (data: ExportRow[], format: 'csv' | 'xlsx') => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        if (format === 'csv') {
            XLSX.writeFile(wb, 'transactions.csv', { bookType: 'csv' });
        } else {
            XLSX.writeFile(wb, 'transactions.xlsx', { bookType: 'xlsx' });
        }
    };

    // Refactored Export logic
    const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
        if (filteredTransactions.length === 0) return;
        const data = getExportData();
        if (format === 'pdf') {
            await exportToPDF(data);
        } else {
            exportToSheet(data, format);
        }
    };

    const clearFilters = () => {
        setFilterType('all');
        setFilterCategory('');
        setFilterYear('');
        setFilterMonth('');
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 sm:py-12 text-gray-500">
                <div className="text-4xl sm:text-6xl mb-4">📊</div>
                <p className="text-lg sm:text-xl font-medium mb-2">No transactions yet</p>
                <p className="text-xs sm:text-sm text-gray-400">Add your first transaction to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {showAll && (
                <div className="mb-2">
                    <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-800">Transactions</h3>
                        <div ref={exportRef} className="relative flex justify-end">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
                                onClick={e => {
                                    e.preventDefault();
                                    setExportOpen((open) => !open);
                                }}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                Export
                            </button>
                            {exportOpen && (
                                <div className="absolute right-0 mt-12 w-50 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-fade-in">
                                    <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50"
                                        onClick={() => { handleExport('csv'); setExportOpen(false); }}
                                    >
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        Export as CSV
                                    </button>
                                    <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50"
                                        onClick={() => { handleExport('xlsx'); setExportOpen(false); }}
                                    >
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        Export as Excel
                                    </button>
                                    <button
                                        className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-blue-50"
                                        onClick={() => { handleExport('pdf'); setExportOpen(false); }}
                                    >
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M8 8h8M8 12h8M8 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                        Export as PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 flex-1">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Type Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                                <select
                                    value={filterType}
                                    onChange={e => {
                                        setFilterType(e.target.value);
                                        setFilterCategory('');
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-300 transition-colors"
                                >
                                    <option value="all">All</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>
                            {/* Category Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={e => setFilterCategory(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-300 transition-colors"
                                >
                                    <option value="">All</option>
                                    {categories.map(cat => (
                                        <option key={cat.type + '-' + cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Year Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Year</label>
                                <select
                                    value={filterYear}
                                    onChange={e => setFilterYear(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-300 transition-colors"
                                >
                                    <option value="">All</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Month Filter */}
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Month</label>
                                <select
                                    value={filterMonth}
                                    onChange={e => setFilterMonth(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-300 transition-colors"
                                >
                                    <option value="">All</option>
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>{month.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {/* Clear Filters Button */}
                        {(filterType !== 'all' || filterCategory || filterYear || filterMonth) && (
                            <div className="flex justify-end mt-3">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Total Amount for Filtered Results */}
                    <div className="bg-blue-50 rounded-lg px-4 py-3 text-blue-900 font-semibold text-lg flex items-center gap-2 mt-2">
                        <span>Total for filtered results:</span>
                        <span className={totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {totalAmount >= 0 ? '+' : '-'}${Math.abs(totalAmount).toFixed(2)}
                        </span>
                    </div>


                </div>
            )}
            {/* Enhanced Transactions List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-gray-500">
                    <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                    <p className="text-lg sm:text-xl font-medium mb-2">No transactions found</p>
                    <p className="text-xs sm:text-sm text-gray-400">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className={`group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${
                                showAll ? 'cursor-pointer hover:border-gray-200' : ''
                            } ${
                                transaction.type === 'income'
                                    ? 'hover:border-green-200 hover:bg-green-50/30'
                                    : 'hover:border-red-200 hover:bg-red-50/30'
                            }`}
                            onClick={showAll ? () => onUpdate(transaction.id) : undefined}
                        >
                            <div className="p-4 sm:p-5">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    {/* Left Section - Icon and Content */}
                                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl ${
                                            transaction.type === 'income'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {transaction.type === 'income' ? '💰' : '💸'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                                {transaction.description}
                                            </h3>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                                                    transaction.type === 'income'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.category}
                                                </span>
                                                <span className="text-xs sm:text-sm text-gray-500">
                                                    {new Date(transaction.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Amount and Actions */}
                                    <div className="flex items-center justify-end gap-4">
                                        <div className="text-right">
                                            <span
                                                className={`font-bold text-base sm:text-lg ${
                                                    transaction.type === 'income'
                                                        ? 'text-green-600'
                                                        : 'text-red-600'
                                                }`}
                                            >
                                                {transaction.type === 'income' ? '+' : '-'}
                                                ${transaction.amount.toFixed(2)}
                                            </span>
                                        </div>

                                        {showAll && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (confirm('Are you sure you want to delete this transaction?')) {
                                                        onDelete(transaction.id)
                                                    }
                                                }}
                                                className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 touch-manipulation"
                                                title="Delete transaction"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
