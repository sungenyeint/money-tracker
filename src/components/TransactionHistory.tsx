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
            <div className="text-center py-8 sm:py-12 text-gray-500">
                <div className="text-4xl sm:text-6xl mb-4">📊</div>
                <p className="text-lg sm:text-xl font-medium mb-2">No transactions yet</p>
                <p className="text-xs sm:text-sm text-gray-400">Add your first transaction to get started!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Filter Controls */}
            {showAll && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                        {/* Filter Row */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1">
                                <label htmlFor="year-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Year
                                </label>
                                <select
                                    id="year-filter"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-300 transition-colors"
                                >
                                    <option value="">All Years</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex-1">
                                <label htmlFor="month-filter" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Month
                                </label>
                                <select
                                    id="month-filter"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-gray-300 transition-colors"
                                >
                                    <option value="">All Months</option>
                                    {months.map(month => (
                                        <option key={month.value} value={month.value}>{month.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {(selectedYear || selectedMonth) && (
                            <div className="flex justify-start">
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Filter Summary */}
                    {(selectedYear || selectedMonth) && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="text-sm text-blue-800">
                                <span className="font-medium">Showing {filteredTransactions.length} of {transactions.length} transactions</span>
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
                        </div>
                    )}
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
                                            {getTypeIcon(transaction.type)}
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
                                                    {formatDate(transaction.date)}
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
