import React from 'react';
import { Transaction } from './../types/transaction';

interface TransactionHistoryProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    showAll?: boolean;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
    transactions,
    onDelete,
    showAll = false
}) => {
    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No transactions yet</p>
                <p className="text-sm">Add your first transaction to get started!</p>
            </div>
        );
    }

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

    return (
        <div className="space-y-3">
            {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
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
                                    <button
                                        type="button"
                                        onClick={() => onDelete(transaction.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TransactionHistory;
