import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Box,
    Plus,
    Wrench,
    ShieldCheck,
    History,
    Search,
    AlertCircle,
    TrendingDown,
    Calendar,
    MapPin,
    ExternalLink,
    X,
    Package,
    CheckCircle2,
    Settings,
    MoreVertical,
    FileText
} from 'lucide-react';
import api from '../api';

const Assets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/assets');
            setAssets(res.data || []);
        } catch (err) {
            console.error('Failed to fetch assets', err);
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({ name: '', category: 'ELECTRONICS', location: '', cost: '', nextService: '' });

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            let formattedDate = formData.nextService;
            if (formData.nextService) {
                // Ensure it's passed as YYYY-MM-DD or handled by backend, frontend format fits
                const d = new Date(formData.nextService);
                formattedDate = formData.nextService;
            }

            const res = await api.post('/assets', {
                name: formData.name,
                category: formData.category,
                location: formData.location,
                cost: formData.cost,
                nextService: formattedDate
            });
            setAssets([res.data, ...assets]);
            setShowModal(false);
            setFormData({ name: '', category: 'ELECTRONICS', location: '', cost: '', nextService: '' });
        } catch (err) {
            console.error('Failed to add asset', err);
            alert('Failed to save asset');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'HEALTHY': return 'text-success bg-success/10';
            case 'MAINTENANCE_DUE': return 'text-warning bg-warning/10';
            case 'REPAIR_REQUIRED': return 'text-error bg-error/10';
            default: return 'text-muted bg-glass';
        }
    };

    return (
        <div className="assets-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Box className="text-primary" /> Asset & Inventory
                    </h1>
                    <p className="text-muted">Lifecycle management and maintenance tracking for society property</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={18} /> Add Asset
                </button>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Assets', val: '₹0', sub: 'In Value', icon: <TrendingDown /> },
                    { label: 'Pending Service', val: '00', sub: 'Urgent', icon: <Wrench /> },
                    { label: 'In Warranty', val: '0%', sub: 'Coverage', icon: <ShieldCheck /> },
                    { label: 'Audited', val: 'N/A', sub: 'Last Check', icon: <History /> },
                ].map((s, i) => (
                    <div key={i} className="glass-card">
                        <div className="text-primary mb-3">{s.icon}</div>
                        <p className="text-xs text-muted font-bold uppercase">{s.label}</p>
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-2xl font-bold mt-1">{s.val}</h2>
                            <span className="text-[10px] text-muted">{s.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass-card">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold">Managed Assets</h3>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                            <input type="text" className="bg-glass border border-glass-border rounded-lg py-2 pl-10 pr-4 text-sm" placeholder="Search Assets..." />
                        </div>
                        <button className="p-2 glass border border-glass-border rounded-lg hover:text-primary transition-colors">
                            <AlertCircle size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset) => (
                        <motion.div
                            key={asset.id}
                            whileHover={{ scale: 1.01 }}
                            className="p-5 glass border border-glass-border rounded-2xl flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center border border-glass-border">
                                        <Box className="text-muted" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{asset.name}</h4>
                                        <p className="text-[10px] text-muted font-bold uppercase tracking-wider">{asset.category}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${getStatusColor(asset.status)}`}>
                                    {asset.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <MapPin size={14} /> {asset.location}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted">
                                    <Calendar size={14} /> Next: {asset.nextService}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-glass-border flex justify-between items-center">
                                <span className="text-sm font-bold text-text-muted">Value: {asset.cost}</span>
                                <div className="flex gap-2">
                                    <button className="text-muted hover:text-primary transition-colors p-1"><History size={16} /></button>
                                    <button className="text-muted hover:text-primary transition-colors p-1"><ExternalLink size={16} /></button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Add Asset Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full transition-colors text-muted"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 gradient-text">Add New Asset</h2>

                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Asset Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Lobby AC" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm">
                                        <option value="ELECTRONICS">Electronics</option>
                                        <option value="MECHANICAL">Mechanical/Pump</option>
                                        <option value="FURNITURE">Furniture</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Location</label>
                                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. Club House" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Purchase Cost (₹)</label>
                                    <input type="number" value={formData.cost} onChange={(e) => setFormData({ ...formData, cost: e.target.value })} placeholder="0.00" className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Next Service Due</label>
                                    <input type="date" value={formData.nextService} onChange={(e) => setFormData({ ...formData, nextService: e.target.value })} className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm" required />
                                </div>
                            </div>
                            <button type="submit" className="w-full btn btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                Save Asset
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assets;
