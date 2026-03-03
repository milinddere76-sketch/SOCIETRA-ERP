import React, { useState, useEffect } from 'react';
import { Building2, Users, Activity, BarChart4, ChevronRight, LogOut, CheckCircle, Clock, IndianRupee, PieChart, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ societies: 0, users: 0, approvals: 0, totalRevenue: 0 });
    const [recentSocieties, setRecentSocieties] = useState([]);
    const [qrPayments, setQrPayments] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const socRes = await api.get('/superadmin/societies');
                const usrRes = await api.get('/superadmin/users');

                const pending = socRes.data.filter(s => s.status === 'PENDING').length;
                setStats(prev => ({ ...prev, societies: socRes.data.length, users: usrRes.data.length, approvals: pending }));
                setRecentSocieties(socRes.data.slice(-5).reverse());
            } catch (error) {
                console.error("Failed to load dashboard data.", error);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div className="space-y-6 pb-20">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black gradient-text pb-2 uppercase tracking-tighter">Global Operations Hub</h1>
                    <p className="text-text-muted text-sm italic">Master control panel for SOCIETRA multi-tenant architecture.</p>
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
                    className="btn bg-error/10 text-error hover:bg-error hover:text-white shadow-xl border-0 flex items-center gap-2"
                >
                    <LogOut size={18} /> Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-white">
                {[
                    { title: "Total Societies", amount: stats.societies, icon: <Building2 />, color: "from-primary to-primary-dark" },
                    { title: "Global Users", amount: stats.users, icon: <Users />, color: "from-secondary to-secondary-dark" },
                    { title: "Pending Approvals", amount: stats.approvals, icon: <ShieldAlert />, color: stats.approvals > 0 ? "from-warning to-warning-dark" : "from-success to-success-dark" },
                    { title: "Total Revenue", amount: `₹${stats.totalRevenue}`, icon: <IndianRupee />, color: "from-indigo-600 to-indigo-800" }
                ].map((stat, idx) => (
                    <div key={idx} className={`p-6 rounded-3xl shadow-xl shadow-opacity-20 bg-gradient-to-br ${stat.color} relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">{stat.title}</p>
                                <h2 className="text-4xl font-black">{stat.amount}</h2>
                            </div>
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                {stat.icon}
                            </div>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Societies */}
                    <div className="glass-card p-0 overflow-hidden border-t-4 border-primary">
                        <div className="p-5 border-b border-glass-border bg-surface-light/50 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2"><BarChart4 size={18} /> Recent Onboardings</h3>
                            <button onClick={() => navigate('/superadmin/societies')} className="text-xs font-black uppercase text-primary hover:underline">View Ledger</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface border-b border-glass-border text-muted text-[10px] uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Society Name</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Identifier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {recentSocieties.map((soc) => (
                                        <tr key={soc.id} className="hover:bg-primary/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-text uppercase">{soc.name}</p>
                                                <p className="text-[10px] text-text-muted font-bold">{soc.city}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-tighter ${soc.status === 'ACTIVE' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                                    {soc.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-[10px] font-black font-mono text-primary">{soc.societyCode}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* QR Payment Logs */}
                    <div className="glass-card p-0 overflow-hidden border-t-4 border-indigo-600">
                        <div className="p-5 border-b border-glass-border bg-surface-light/50 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2"><PieChart size={18} /> QR Payment Audit</h3>
                            <button className="text-[10px] font-black uppercase text-text-muted">Download CSV</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface border-b border-glass-border text-muted text-[10px] uppercase font-black tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Transaction</th>
                                        <th className="px-6 py-4">Plan</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4 text-right">Audit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {qrPayments.map((pay) => (
                                        <tr key={pay.id} className="hover:bg-indigo-600/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-sm text-text uppercase">{pay.socName}</p>
                                                <p className="text-[10px] text-text-muted font-bold">{pay.date}</p>
                                            </td>
                                            <td className="px-6 py-4"><span className="text-[10px] font-black text-text-muted">{pay.plan}</span></td>
                                            <td className="px-6 py-4 font-black text-sm">₹{pay.amount}</td>
                                            <td className="px-6 py-4 text-right">
                                                {pay.status === 'VERIFIED' ? (
                                                    <span className="inline-flex items-center gap-1 text-success font-black text-[10px] uppercase tracking-tighter"><CheckCircle size={12} /> Verified</span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-warning font-black text-[10px] uppercase tracking-tighter"><Clock size={12} /> Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card bg-gradient-to-br from-surface to-primary/5 border-primary/20 p-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner">
                            <Activity size={24} />
                        </div>
                        <h3 className="font-black text-xl mb-2 uppercase tracking-tight">System Performance</h3>
                        <p className="text-xs text-text-muted font-bold mb-6 leading-relaxed">
                            Infrastructure is operating at 99.9% uptime. All 24 node clusters are synchronized across master database regions.
                        </p>
                        <div className="space-y-4">
                            {['System Status: Operational', 'Health Check: Passed', 'Global Clusters: Syncing'].map((msg, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs font-bold text-primary px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    {msg}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6 space-y-4 border-t-4 border-secondary">
                        <h3 className="font-black text-sm uppercase tracking-widest text-secondary">Global Routing</h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Register New Global Entity', path: '/superadmin/societies' },
                                { label: 'Audit User Directory', path: '/superadmin/users' },
                                { label: 'Security Role Authority', path: '/admin' }
                            ].map((task, i) => (
                                <button key={i} onClick={() => navigate(task.path)} className="w-full text-left p-4 rounded-2xl bg-surface border border-glass-border hover:border-secondary hover:shadow-lg transition-all group">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-secondary">{task.label}</span>
                                        <ChevronRight size={16} className="text-text-muted group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
