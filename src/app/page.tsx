"use client";

import { useState } from "react";
import SummaryCard from "./components/SummaryCard";
import TransactionForm from "./components/TransactionForm";
import { Transaction } from "./types/transaction";
import TransactionHistory from "./components/TransactionHistory";
import ExpenseChart from "./components/ExpenseChart";

export default function HomePage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<"overview" | "transactions" | "analytics">("overview");

    const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
        const newTransaction: Transaction = {
            ...transaction,
            id: Date.now().toString(),
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setIsFormOpen(false);
    };

    const deleteTransaction = (id: string) => {
        setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    };

    const totalBalance = transactions.reduce((sum, transaction) => {
        return transaction.type === 'income' ? sum + transaction.amount : sum - transaction.amount;
    }, 0);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-6 font-sans">
            {/* Header */}
            <header className="text-center mb-6">
                <div className="flex justify-center items-center gap-2 text-3xl font-bold text-gray-800">
                    <span>💰</span>
                    <h1>Money Tracker</h1>
                </div>
                <p className="text-gray-600">Take control of your finances</p>
            </header>

            {/* Current Balance */}
            <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-center p-6 rounded-xl shadow mb-6">
                <h2 className="text-xl font-medium mb-1">Current Balance</h2>
                <p className="text-4xl font-bold">${totalBalance.toFixed(2)}</p>
                <span
                    className={`text-sm bg-white ${totalBalance >= 0 ? "text-green-600" : "text-red-600"
                        } px-3 py-1 rounded-full mt-2 inline-block font-semibold`}
                >
                    {totalBalance >= 0 ? 'Positive Balance' : 'Negative Balance'}
                </span>
            </section>

            {/* Summary Cards */}
            <SummaryCard totalIncome={totalIncome} totalExpense={totalExpenses} totalBalance={totalBalance} />

            {/* Tabs */}
            <div className="mb-8"></div>
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === "overview"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-600"
                        }`}
                    onClick={() => setActiveTab("overview")}
                >
                    Overview
                </button>
                <button
                    className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === "transactions"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-600"
                        }`}
                    onClick={() => setActiveTab("transactions")}
                >
                    Transactions
                </button>
                <button
                    className={`px-4 py-2 font-semibold focus:outline-none ${activeTab === "analytics"
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-600"
                        }`}
                    onClick={() => setActiveTab("analytics")}
                >
                    Analytics
                </button>
            </div>

            {activeTab === "overview" && (
                <div className="space-y-6">
                    <div className="flex justify-center">
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow"
                        >
                            Add New Transaction
                        </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 shadow">
                            <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
                            <TransactionHistory
                                transactions={transactions.slice(0, 5)}
                                onDelete={deleteTransaction}
                                showAll={false}
                            />
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow">
                            <h3 className="text-lg font-semibold mb-2">Expense Breakdown</h3>
                            <ExpenseChart transactions={transactions} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "transactions" && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">All Transactions</h2>
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow"
                        >
                            Add Transaction
                        </button>
                    </div>
                    <TransactionHistory
                        transactions={transactions}
                        onDelete={deleteTransaction}
                        showAll={true}
                    />
                </div>
            )}

            {activeTab === "analytics" && (
                <div className="grid gap-6">
                    <div className="bg-white rounded-xl p-4 shadow">
                        <h3 className="text-lg font-semibold mb-2">Spending Analytics</h3>
                        <ExpenseChart transactions={transactions} detailed={true} />
                    </div>
                </div>
            )}
            {/* Transaction Form Modal */}
            {isFormOpen && (
                <TransactionForm
                    onSubmit={addTransaction}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    )
}
