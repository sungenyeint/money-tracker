import React, { useState, useMemo } from 'react';
import { Transaction } from '../types/transaction';

interface TransactionHistoryProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onUpdate: (id: string) => void;
    showAll?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
    transactions,
    onDelete,
    onUpdate,
    showAll = false
}) => {
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');

    // Get unique years and months from transactions
    const years = useMemo(() => {
        const uniqueYears = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];
        return uniqueYears.sort((a, b) => b - a); // Sort descending
    }, [transactions]);

    const months = useMemo(() => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames.map((name, index) => ({ name, value: index + 1 }));
    }, []);

    // Filter transactions based on selected year and month
    const filteredTransactions = useMemo(() => {
        return transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionYear = transactionDate.getFullYear();
            const transactionMonth = transactionDate.getMonth() + 1; // getMonth() returns 0-11

            const yearMatch = !selectedYear || transactionYear === parseInt(selectedYear);
            const monthMatch = !selectedMonth || transactionMonth === parseInt(selectedMonth);

            return yearMatch && monthMatch;
        });
    }, [transactions, selectedYear, selectedMonth]);

    const getTypeIcon = (type: string) => {
        return type === 'income' ? '💰' : '💸';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const clearFilters = () => {
        setSelectedYear('');
        setSelectedMonth('');
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm">Add your first transaction to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Controls */}
            { showAll && (
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center space-x-2">
                        <label htmlFor="year-filter" className="text-sm font-medium text-gray-700">
                            Year:
                        </label>
                        <select
                            id="year-filter"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Years</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label htmlFor="month-filter" className="text-sm font-medium text-gray-700">
                            Month:
                        </label>
                        <select
                            id="month-filter"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Months</option>
                            {months.map(month => (
                                <option key={month.value} value={month.value}>{month.name}</option>
                            ))}
                        </select>
                    </div>

                    {(selectedYear || selectedMonth) && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Filter Summary */}
                {(selectedYear || selectedMonth) && (
                    <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredTransactions.length} of {transactions.length} transactions
                        {selectedYear && selectedMonth && (
                            <span> for {months[parseInt(selectedMonth) - 1]?.name} {selectedYear}</span>
                        )}
                        {selectedYear && !selectedMonth && (
                            <span> for {selectedYear}</span>
                        )}
                        {!selectedYear && selectedMonth && (
                            <span> for {months[parseInt(selectedMonth) - 1]?.name}</span>
                        )}
                    </div>
                )}
            </div>
            )}

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-lg">No transactions found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                        <div key={transaction.id} className={`rounded-lg shadow ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'} ${showAll ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={showAll ? () => onUpdate(transaction.id) : undefined}>
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {transaction.description}
                                            </h3>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <span className="border border-gray-300 rounded px-2 py-0.5 text-xs">
                                                    {transaction.category}
                                                </span>
                                                <span>{formatDate(transaction.date)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <span
                                            className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                }`}
                                        >
                                            {transaction.type === 'income' ? '+' : '-'}
                                            ${transaction.amount.toFixed(2)}
                                        </span>

                                        {showAll && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (confirm('Are you sure you want to delete this transaction?')) {
                                                            onDelete(transaction.id)
                                                        }
                                                    }}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1"
                                                >
                                                    🗑️
                                                </button>
                                            </>
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
