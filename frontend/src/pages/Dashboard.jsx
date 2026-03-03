import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Users,
    CreditCard,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    MessageSquare,
    Calendar,
    Search,
    Bell,
    CheckCircle2,
    LogOut
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [notifying, setNotifying] = useState(null);
    const [society, setSociety] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSocietyData();
    }, []);

    const fetchSocietyData = async () => {
        try {
            setLoading(true);
            const selectedSocietyId = localStorage.getItem('selectedSocietyId');
            const role = (localStorage.getItem('role') || '').replace('ROLE_', '');
            const isSuperAdmin = role === 'SUPER_ADMIN';

            console.log("Dashboard: Fetching society data...", { role, isSuperAdmin, selectedSocietyId });

            const societyUrl = isSuperAdmin && selectedSocietyId
                ? `/society/settings/${selectedSocietyId}`
                : '/society/settings';

            const res = await api.get(societyUrl);
            console.log("Dashboard: Society data fetched:", res.data?.name);
            setSociety(res.data);
        } catch (err) {
            console.error('Dashboard: Failed to fetch society data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleWhatsApp = (id) => {
        setNotifying(id);
        setTimeout(() => {
            setNotifying(null);
            alert('WhatsApp notification sent successfully!');
        }, 1500);
    };

    const [stats, setStats] = useState([
        { title: 'Total Collection', value: '₹0', trend: '0%', icon: <TrendingUp size={24} />, color: 'var(--success)', description: 'Monthly Revenue' },
        { title: 'Pending Dues', value: '₹0', trend: '0%', icon: <AlertCircle size={24} />, color: 'var(--error)', description: 'Maintenance Dues' },
        { title: 'Active Units', value: '0', trend: '0%', icon: <Users size={24} />, color: 'var(--secondary)', description: 'Occupancy Rate' },
        { title: 'Available Funds', value: '₹0', trend: '0%', icon: <CreditCard size={24} />, color: 'var(--primary)', description: 'Society Balance' },
    ]);

    const [recentPayments, setRecentPayments] = useState([]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Society Centered Header */}
            {society && (
                <div className="text-center py-6 mb-8 glass-card border-primary/20 bg-primary/5">
                    <h1 className="text-4xl font-black tracking-tight text-primary mb-2 uppercase font-serif">
                        {society.name}
                    </h1>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-text-muted">
                        {society.registrationNumber && (
                            <span className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wider">Reg No.</span>
                                {society.registrationNumber}
                            </span>
                        )}
                        <span className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded uppercase tracking-wider">Address</span>
                            {[society.address, society.city].filter(Boolean).join(', ')} {society.pincode}
                        </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 mt-4 pt-4 border-t border-glass-border/50 max-w-2xl mx-auto">
                        {society.adminEmail && (
                            <a href={`mailto:${society.adminEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                <Bell size={14} className="text-primary" />
                                {society.adminEmail}
                            </a>
                        )}
                        {society.adminMobile && (
                            <a href={`tel:${society.adminMobile}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                <TrendingUp size={14} className="text-success rotate-90" />
                                {society.adminMobile}
                            </a>
                        )}
                    </div>
                </div>
            )}

            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text pb-2">Society Operations Hub</h1>
                    <p className="text-text-muted">Comprehensive management suite for your residential community.</p>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to logout?")) {
                            localStorage.removeItem('token');
                            localStorage.removeItem('role');
                            window.dispatchEvent(new Event('auth-change'));
                            window.location.href = '/login';
                        }
                    }}
                    className="btn bg-error/10 text-error hover:bg-error hover:text-white shadow-lg border-0"
                >
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="glass-card hover:-translate-y-1 transition-transform cursor-pointer group"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 text-primary" style={{ color: stat.color, backgroundColor: `${stat.color}15` }}>
                                {stat.icon}
                            </div>
                            <span className="text-xs font-bold text-muted bg-surface-light px-2 py-1 rounded-full">{stat.trend}</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-1 tracking-tight">{stat.value}</h2>
                        <p className="text-sm font-bold text-muted uppercase tracking-wider">{stat.title}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="lg:col-span-2 glass-card p-0 overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b border-glass-border bg-surface-light/50 flex justify-between items-center">
                        <h3 className="font-bold">Recent Maintenance Activity</h3>
                        <button className="text-sm text-primary hover:underline font-semibold flex items-center">View Ledger <ArrowUpRight size={16} /></button>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-surface border-b border-glass-border text-muted text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Unit / Member</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border text-sm">
                            {recentPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-surface-light/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-primary">{payment.unit}</div>
                                        <div className="text-xs text-muted font-normal">{payment.member}</div>
                                    </td>
                                    <td className="px-6 py-4 text-muted">{payment.category}</td>
                                    <td className="px-6 py-4 font-mono font-bold">{payment.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${payment.status === 'Success' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                            }`}>
                                            {payment.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="p-8 text-center border-t border-glass-border">
                        <p className="text-text-muted text-sm">Real-time sync enabled for all society transactions.</p>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-card bg-gradient-to-br from-surface to-primary/5 flex flex-col">
                    <h3 className="font-bold mb-6">Society Quick Links</h3>
                    <div className="space-y-3 flex-1">
                        {[
                            { label: "Manage Units", path: "/units" },
                            { label: "Maintenance Billing", path: "/billing" },
                            { label: "Financial Accounting", path: "/accounting" },
                            { label: "Meeting Manager", path: "/meetings" },
                            { label: "Assets & Inventory", path: "/assets" },
                            { label: "Visitor Security", path: "/security" },
                            { label: "Reports & Records", path: "/records" },
                            { label: "Members Management", path: "/members" },
                            { label: "AI Intelligence", path: "/intelligence" }
                        ].map((link, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(link.path)}
                                className="w-full text-left p-4 rounded-xl bg-surface border border-glass-border hover:border-primary/50 hover:shadow-md transition-all font-semibold flex justify-between items-center group"
                            >
                                {link.label} <ArrowUpRight size={18} className="text-muted group-hover:text-primary transition-colors" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Storage Status</span>
                            <span className="text-[10px] font-bold text-muted">0%</span>
                        </div>
                        <div className="h-1.5 w-full bg-surface-light rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[0%]" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
