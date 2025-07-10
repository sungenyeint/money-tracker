import React, { useState, useEffect } from 'react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/transaction';

interface TransactionFormProps {
    onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
    onClose: () => void;
    selectedTransaction?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onClose, selectedTransaction }) => {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (selectedTransaction) {
            setType(selectedTransaction.type);
            setAmount(selectedTransaction.amount.toString());
            setDescription(selectedTransaction.description);
            setCategory(selectedTransaction.category);
            setDate(selectedTransaction.date);
        }
    }, [selectedTransaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || !description || !category) {
            alert('Please fill in all required fields');
            return;
        }

        onSubmit({
            type,
            amount: parseFloat(amount),
            description,
            category,
            date,
        });

        // Reset form
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                <div className="border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Add New Transaction</h2>
                    <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700 text-xl"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>
                <div className="px-6 py-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                className={`flex-1 px-4 py-2 rounded ${type === 'expense'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 border'
                                    }`}
                                onClick={() => setType('expense')}
                            >
                                💸 Expense
                            </button>
                            <button
                                type="button"
                                className={`flex-1 px-4 py-2 rounded ${type === 'income'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 border'
                                    }`}
                                onClick={() => setType('income')}
                            >
                                💰 Income
                            </button>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="amount" className="block font-medium">Amount *</label>
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="category" className="block font-medium">Category *</label>
                            <select
                                id="category"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="block font-medium">Description *</label>
                            <textarea
                                id="description"
                                placeholder="Enter description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="date" className="block font-medium">Date</label>
                            <input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 rounded border bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`flex-1 px-4 py-2 rounded text-white ${type === 'income'
                                    ? 'bg-green-500 hover:bg-green-600'
                                    : 'bg-red-500 hover:bg-red-600'
                                    }`}
                            >
                                Add {type === 'income' ? 'Income' : 'Expense'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TransactionForm;
