"use client";

import { useState, useEffect } from "react";
import SummaryCard from "../components/SummaryCard";
import TransactionForm from "../components/TransactionForm";
import { Transaction } from "../types/transaction";
import TransactionHistory from "../components/TransactionHistory";
import ExpenseChart from "../components/ExpenseChart";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../contexts/AuthContext";
import {
    getTransactions,
    insertTransaction,
    destroyTransaction,
    updateTransaction,
} from "./../lib/apiTransactions";
import Header from "@/components/Header";

export default function Home() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeTab, setActiveTab] = useState<
        "overview" | "transactions" | "analytics"
    >("overview");
    const { user, loading } = useAuth();
    const [selectedTransaction, setSelectedTransaction] = useState<
        Transaction | undefined
    >(undefined);
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        const fetchTransactions = async () => {
            // Only fetch if loading is false and we have a user
            if (!loading && user) {
                try {
                    const data = await getTransactions();
                    setTransactions(data);
                } catch (error) {
                    console.error("Failed to fetch transactions:", error);
                }
            } else if (!loading && !user) {
                // If not loading and no user, clear transactions
                setTransactions([]);
            }
        };
        fetchTransactions();
    }, [user, loading]); // Add loading to the dependency array

    const handleTransactionSubmit = async (
        transaction: Omit<Transaction, "id">
    ) => {
        setIsFormOpen(false);
        setSubmitLoading(true);
        try {
            if (selectedTransaction) {
                // Call the API to update the transaction in the database
                await updateTransaction(selectedTransaction.id, transaction);

                // Correctly update the local state by merging the new transaction data
                setTransactions((prev) =>
                    prev.map((t) =>
                        t.id === selectedTransaction.id ? { ...t, ...transaction } : t
                    )
                );
            } else {
                // Call the API to insert the new transaction
                const newTransaction = await insertTransaction(transaction);

                // Add the new transaction (returned from the API) to the local state
                setTransactions((prev) => [...prev, newTransaction]);
            }

            setSelectedTransaction(undefined);
        } catch (error) {
            console.error("Failed to add transaction:", error);
            // You can add UI error handling here if you wish
        } finally {
            setSubmitLoading(false);
        }
    };

    const deleteTransaction = async (id: string) => {
        setSubmitLoading(true);
        try {
            await destroyTransaction(id);
            setTransactions((prev) =>
                prev.filter((transaction) => transaction.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete transaction:", error);
            // You can add UI error handling here if you wish
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setIsFormOpen(true);
        setSelectedTransaction(
            transactions.find((transaction) => transaction.id === id)
        );
    };

    const totalBalance = transactions.reduce((sum, transaction) => {
        return transaction.type === "income"
            ? sum + transaction.amount
            : sum - transaction.amount;
    }, 0);

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    if (loading || submitLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-500 mb-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                    </svg>
                    <p className="text-lg text-gray-700">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <AuthForm />;
    }

    return (
        <div className="min-h-screen p-6 md:p-10 md:w-3/4 mx-auto">
            {/* Header */}
            <Header />

            {/* Current Balance */}
            <section className="bg-gradient-to-r from-green-400 to-blue-500 text-white text-center p-6 rounded-xl shadow mb-6">
                <h2 className="text-xl font-medium mb-1">Current Balance</h2>
                <p className="text-4xl font-bold">${totalBalance.toFixed(2)}</p>
                <span
                    className={`text-sm bg-white ${totalBalance >= 0 ? "text-green-600" : "text-red-600"
                        } px-3 py-1 rounded-full mt-2 inline-block font-semibold`}
                >
                    {totalBalance >= 0 ? "Positive Balance" : "Negative Balance"}
                </span>
            </section>

            {/* Summary Cards */}
            <SummaryCard
                totalIncome={totalIncome}
                totalExpense={totalExpenses}
                totalBalance={totalBalance}
            />

            {/* Tabs */}
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
                            <h3 className="text-lg font-semibold mb-2">
                                Recent Transactions
                            </h3>
                            <TransactionHistory
                                transactions={transactions.slice(0, 5)}
                                onDelete={deleteTransaction}
                                onUpdate={handleUpdate}
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
                        onUpdate={handleUpdate}
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
                    onSubmit={handleTransactionSubmit}
                    onClose={() => setIsFormOpen(false)}
                    selectedTransaction={selectedTransaction}
                />
            )}
        </div>
    );
}
