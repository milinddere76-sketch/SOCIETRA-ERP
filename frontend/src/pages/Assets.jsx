import React, { useState } from 'react';
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
    ExternalLink
} from 'lucide-react';

const Assets = () => {
    const assets = [
        { id: 1, name: 'Main Water Pump - Wing A', category: 'PUMP', location: 'Basement A', status: 'HEALTHY', lastService: '12 Jan 2024', nextService: '12 Jul 2024', cost: '₹45,000' },
        { id: 2, name: 'Diesel Generator 150kVA', category: 'GENERATOR', location: 'Utility Yard', status: 'MAINTENANCE_DUE', lastService: '05 Aug 2023', nextService: '05 Feb 2024', cost: '₹12,40,000' },
        { id: 3, name: 'Schindler Elevator', category: 'LIFT', location: 'Wing B', status: 'REPAIR_REQUIRED', lastService: '20 Dec 2023', nextService: '20 Jan 2024', cost: '₹18,00,000' },
        { id: 4, name: 'CCTV Network (16 Cam)', category: 'CCTV', location: 'Perimeter', status: 'HEALTHY', lastService: '01 Nov 2023', nextService: '01 May 2024', cost: '₹85,000' },
    ];

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
                <button className="btn btn-primary">
                    <Plus size={18} /> Add Asset
                </button>
            </header>

            <div className="grid grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Assets', val: '₹42.5L', sub: 'In Value', icon: <TrendingDown /> },
                    { label: 'Pending Service', val: '04', sub: 'Urgent', icon: <Wrench /> },
                    { label: 'In Warranty', val: '86%', sub: 'Coverage', icon: <ShieldCheck /> },
                    { label: 'Audited', val: 'Jan 24', sub: 'Last Check', icon: <History /> },
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
        </div>
    );
};

export default Assets;
