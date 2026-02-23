import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Users,
    CreditCard,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    MessageSquare
} from 'lucide-react';

const Dashboard = () => {
    const [notifying, setNotifying] = useState(null);

    const handleWhatsApp = (id) => {
        setNotifying(id);
        setTimeout(() => {
            setNotifying(null);
            alert('WhatsApp notification sent successfully!');
        }, 1500);
    };

    const stats = [
        { title: 'Total Collection', value: '₹12.5L', trend: '+12%', icon: <TrendingUp className="text-success" />, color: 'var(--success)' },
        { title: 'Pending Dues', value: '₹1.2L', trend: '+5%', icon: <AlertCircle className="text-error" />, color: 'var(--error)' },
        { title: 'Active Units', value: '184', trend: '92%', icon: <Users className="text-secondary" />, color: 'var(--secondary)' },
        { title: 'Available Funds', value: '₹4.8L', trend: '-2%', icon: <CreditCard className="text-primary" />, color: 'var(--primary)' },
    ];

    const recentPayments = [
        { id: 1, unit: 'A-201', member: 'Rahul Sharma', amount: '₹3,500', status: 'Success', date: '2 Mins ago' },
        { id: 2, unit: 'C-504', member: 'Priya Verma', amount: '₹12,400', status: 'Pending', date: '15 Mins ago' },
        { id: 3, unit: 'B-1102', member: 'Amit Patel', amount: '₹4,200', status: 'Success', date: '1 Hour ago' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="dashboard-page"
        >
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Society Overview</h1>
                    <p className="text-muted">Welcome back, Society Admin</p>
                </div>
                <div className="flex gap-4">
                    <button className="btn btn-outline">
                        <Download size={18} /> Export Stats
                    </button>
                    <button className="btn btn-primary">
                        + New Bill
                    </button>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="stats-grid grid grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="glass-card"
                    >
                        <div className="flex justify-between mb-4">
                            <div className="p-3 glass rounded-lg">
                                {stat.icon}
                            </div>
                            <span className={`flex items - center text - sm ${stat.trend.startsWith('+') ? 'text-success' : 'text-error'} `}>
                                {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </span>
                        </div>
                        <p className="text-muted text-sm">{stat.title}</p>
                        <h2 className="text-2xl font-bold mt-1">{stat.value}</h2>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Main Chart Placeholder */}
                <div className="col-span-2 glass-card h-[400px] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-6 left-6">
                        <h3 className="text-lg font-bold">Revenue Trend</h3>
                        <p className="text-sm text-muted">Monthly collection analysis</p>
                    </div>
                    <div className="w-full h-full pt-16 flex items-end justify-between px-8 pb-8 gap-4">
                        {[40, 70, 45, 90, 65, 80, 50, 95, 75, 60, 85, 45].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary hover:bg-secondary transition-all rounded-t-md relative group" style={{ height: `${h}% ` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ₹{h}k
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="glass-card">
                    <h3 className="text-lg font-bold mb-6">Recent Payments</h3>
                    <div className="space-y-6">
                        {recentPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between pb-4 border-b border-glass-border last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full glass flex items-center justify-center font-bold text-sm">
                                        {payment.unit}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold">{payment.member}</h4>
                                        <p className="text-xs text-muted">{payment.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleWhatsApp(payment.id)}
                                        className="p-2 hover:bg-primary/20 rounded-lg text-primary transition-colors"
                                        title="Send WhatsApp Bill"
                                    >
                                        <MessageSquare size={16} className={notifying === payment.id ? 'animate-bounce' : ''} />
                                    </button>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{payment.amount}</p>
                                        <span className={`text - [10px] px - 2 py - 1 rounded - full ${payment.status === 'Success' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'} `}>
                                            {payment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-outline w-full mt-8">View All Receipts</button>
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
