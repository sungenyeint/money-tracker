type SummaryCardProps = {
    totalIncome: number;
    totalExpense: number;
    totalBalance: number;
}

const SummaryCard = ({ totalIncome, totalExpense, totalBalance }: SummaryCardProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-green-100 p-4 rounded-xl shadow text-center">
                <p className="text-green-700 font-semibold">💰 Total Income</p>
                <p className="text-2xl font-bold text-green-900">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-xl shadow text-center">
                <p className="text-red-700 font-semibold">💸 Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">${totalExpense.toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-xl shadow text-center ${totalBalance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
                <p className={`font-semibold ${totalBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>📊 Net Savings</p>
                <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>${totalBalance.toFixed(2)}</p>
            </div>
        </div>
    )
}

export default SummaryCard
