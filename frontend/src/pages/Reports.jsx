import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    ChevronRight,
    PieChart,
    TrendingUp,
    Table as TableIcon
} from 'lucide-react';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('balance-sheet');

    const balanceSheetData = {
        assets: [
            { name: 'Sinking Fund Fixed Deposit', amount: '₹15,40,000' },
            { name: 'Maintenance Receivable', amount: '₹1,24,500' },
            { name: 'Cash at Bank (HDFC)', amount: '₹4,30,000' },
            { name: 'Petty Cash', amount: '₹5,000' },
        ],
        liabilities: [
            { name: 'General Fund', amount: '₹12,00,000' },
            { name: 'Reserve Fund', amount: '₹6,00,000' },
            { name: 'Security Deposit (Vendors)', amount: '₹45,000' },
            { name: 'Provision for Audit Fees', amount: '₹15,000' },
        ]
    };

    return (
        <div className="reports-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Financial Statements</h1>
                    <p className="text-muted">Statutory reports for FY 2024-25</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-outline">
                        <Download size={18} /> Download PDF
                    </button>
                    <button className="btn btn-primary">
                        Export to Excel
                    </button>
                </div>
            </header>

            {/* Report Selector Tabs */}
            <div className="flex gap-4 mb-8">
                {[
                    { id: 'balance-sheet', name: 'Balance Sheet', icon: <PieChart size={18} /> },
                    { id: 'income-expenditure', name: 'Income & Exp', icon: <TrendingUp size={18} /> },
                    { id: 'ledger', name: 'General Ledger', icon: <TableIcon size={18} /> },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-outline'} min-w-[160px]`}
                    >
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Assets Side */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card"
                >
                    <div className="flex justify-between items-center mb-6 border-b border-glass-border pb-4">
                        <h3 className="text-xl font-bold text-success">ASSETS</h3>
                        <span className="text-success font-bold">₹20,99,500</span>
                    </div>
                    <div className="space-y-4">
                        {balanceSheetData.assets.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-glass rounded-lg transition-colors">
                                <span className="text-sm font-medium">{item.name}</span>
                                <span className="font-semibold">{item.amount}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Liabilities Side */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="glass-card"
                >
                    <div className="flex justify-between items-center mb-6 border-b border-glass-border pb-4">
                        <h3 className="text-xl font-bold text-error">LIABILITIES</h3>
                        <span className="text-error font-bold">₹18,60,000</span>
                    </div>
                    <div className="space-y-4">
                        {balanceSheetData.liabilities.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-glass rounded-lg transition-colors">
                                <span className="text-sm font-medium">{item.name}</span>
                                <span className="font-semibold">{item.amount}</span>
                            </div>
                        ))}
                        <div className="mt-8 pt-4 border-t border-glass-border flex justify-between items-center">
                            <span className="text-sm font-bold opacity-70">SURPLUS (I & E)</span>
                            <span className="font-bold underline">₹2,39,500</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Audit View Footer */}
            <div className="mt-8 glass-card border-l-4 border-primary">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 glass rounded-full flex items-center justify-center text-primary">
                            <FileText />
                        </div>
                        <div>
                            <h4 className="font-bold">Audit Ready Statement</h4>
                            <p className="text-xs text-muted">All entries are reconciled with bank statements as of today.</p>
                        </div>
                    </div>
                    <button className="btn btn-outline btn-sm">
                        Share with Auditor <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;
