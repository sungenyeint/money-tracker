import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Transaction } from '../types/transaction';

interface ExpenseChartProps {
    transactions: Transaction[];
    detailed?: boolean;
}

const COLORS = [
    '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
    '#F97316', '#06B6D4', '#84CC16', '#EC4899', '#6B7280'
];

export default function ExpenseChart({ transactions, detailed = false }: ExpenseChartProps) {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No expense data to display</p>
            </div>
        );
    }

    // Group expenses by category
    const expensesByCategory = expenseTransactions.reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: ((amount / expenseTransactions.reduce((sum, t) => sum + t.amount, 0)) * 100).toFixed(1)
    }));

    if (detailed) {
        // Monthly spending trend
        const monthlyData = transactions.reduce((acc, transaction) => {
            const month = new Date(transaction.date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
            });

            if (!acc[month]) {
                acc[month] = { month, income: 0, expenses: 0 };
            }

            if (transaction.type === 'income') {
                acc[month].income += transaction.amount;
            } else {
                acc[month].expenses += transaction.amount;
            }

            return acc;
        }, {} as Record<string, { month: string; income: number; expenses: number }>);

        const barData = Object.values(monthlyData);

        return (
            <div className="space-y-8">
                <div>
                    <h3 className="text-md font-semibold my-4">Expense Categories</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                innerRadius={40}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h3 className="text-md font-semibold mb-4">Monthly Trends</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="income" fill="#10B981" name="Income" />
                            <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    dataKey="value"
                >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
            </PieChart>
        </ResponsiveContainer>
    );
};
