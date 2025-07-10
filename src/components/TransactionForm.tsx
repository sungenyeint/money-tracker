import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types/transaction';

interface TransactionFormProps {
    onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
    onClose: () => void;
    selectedTransaction?: Transaction;
}

type FormValues = {
    amount: number;
    description: string;
    category: string;
    date: string;
};

const today = new Date().toISOString().split('T')[0];

const getSchema = (categories: string[]) =>
    yup.object().shape({
        amount: yup
            .number()
            .typeError('Amount is required')
            .required('Amount is required')
            .positive('Amount must be a positive number'),
        description: yup.string().required('Description is required'),
        category: yup
            .string()
            .oneOf(categories, 'Category is required')
            .required('Category is required'),
        date: yup
            .string()
            .required('Date is required')
            .test('not-in-future', 'Date cannot be in the future', (value) => {
                if (!value) return false;
                return new Date(value) <= new Date();
            }),
    });

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onClose, selectedTransaction }) => {
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    const schema = getSchema(categories);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            amount: undefined,
            description: '',
            category: '',
            date: today,
        },
    });

    useEffect(() => {
        if (selectedTransaction) {
            setType(selectedTransaction.type);
            reset({
                amount: selectedTransaction.amount,
                description: selectedTransaction.description,
                category: selectedTransaction.category,
                date: selectedTransaction.date,
            });
        } else {
            reset({
                amount: undefined,
                description: '',
                category: '',
                date: today,
            });
        }
    }, [selectedTransaction, reset]);

    // Update category validation when type changes
    useEffect(() => {
        setValue('category', '');
    }, [type, setValue]);

    const onFormSubmit = (data: FormValues) => {
        onSubmit({
            type,
            ...data,
        });
        reset({
            amount: undefined,
            description: '',
            category: '',
            date: today,
        });
        setType('expense');
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-0 sm:p-0">
                <div className="flex items-center justify-between border-b px-6 py-5">
                    <h2 className="text-xl font-bold text-gray-800">{selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-700 p-2 rounded-full transition"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-6 space-y-6">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-150 border text-base shadow-sm
                                ${type === 'expense' ? 'bg-red-500 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-red-50'}`}
                            onClick={() => setType('expense')}
                        >
                            💸 Expense
                        </button>
                        <button
                            type="button"
                            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-150 border text-base shadow-sm
                                ${type === 'income' ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50'}`}
                            onClick={() => setType('income')}
                        >
                            💰 Income
                        </button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="amount" className="block font-medium mb-1">Amount <span className="text-red-500">*</span></label>
                            <input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...register('amount')}
                                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.amount ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.amount && <div className="text-red-600 text-sm mt-1">{errors.amount.message}</div>}
                        </div>
                        <div>
                            <label htmlFor="category" className="block font-medium mb-1">Category <span className="text-red-500">*</span></label>
                            <select
                                id="category"
                                {...register('category')}
                                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.category ? 'border-red-500' : 'border-gray-200'}`}
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <div className="text-red-600 text-sm mt-1">{errors.category.message}</div>}
                        </div>
                        <div>
                            <label htmlFor="description" className="block font-medium mb-1">Description <span className="text-red-500">*</span></label>
                            <textarea
                                id="description"
                                placeholder="Enter description"
                                {...register('description')}
                                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                                rows={2}
                            />
                            {errors.description && <div className="text-red-600 text-sm mt-1">{errors.description.message}</div>}
                        </div>
                        <div>
                            <label htmlFor="date" className="block font-medium mb-1">Date <span className="text-red-500">*</span></label>
                            <input
                                id="date"
                                type="date"
                                {...register('date')}
                                className={`w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition ${errors.date ? 'border-red-500' : 'border-gray-200'}`}
                            />
                            {errors.date && <div className="text-red-600 text-sm mt-1">{errors.date.message}</div>}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-150
                                ${type === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                            {selectedTransaction ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TransactionForm;
