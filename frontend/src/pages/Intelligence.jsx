import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BrainCircuit,
    AlertTriangle,
    TrendingUp,
    UserX,
    ArrowRight,
    ShieldAlert,
    MessageSquare
} from 'lucide-react';

const Intelligence = () => {
    const predictions = [
        {
            id: 1,
            unit: 'C-504',
            member: 'Priya Verma',
            dues: '₹42,500',
            risk: 0.88,
            level: 'CRITICAL',
            factors: ['3 consecutive months unpaid', 'Ignored 2 WhatsApp reminders'],
            action: 'Legal Notice'
        },
        {
            id: 2,
            unit: 'A-102',
            member: 'Vikram Singh',
            dues: '₹12,400',
            risk: 0.65,
            level: 'HIGH',
            factors: ['Increasing trend in delay', 'Partial payments only'],
            action: 'Committee Meeting'
        },
        {
            id: 3,
            unit: 'B-703',
            member: 'Sanjay Oak',
            dues: '₹8,200',
            risk: 0.42,
            level: 'MEDIUM',
            factors: ['Historically pays in 45 days'],
            action: 'Soft Reminder'
        }
    ];

    return (
        <div className="intelligence-page">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BrainCircuit className="text-primary" size={24} />
                        <h1 className="text-3xl font-bold">AI Recovery Intelligence</h1>
                    </div>
                    <p className="text-muted">Predictive analysis for maintenance collection & recovery</p>
                </div>
                <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">ML Model Active: v2.4</span>
                </div>
            </header>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="glass-card border-l-4 border-error">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-error/10 rounded-lg text-error"><UserX size={20} /></div>
                        <span className="text-xs font-bold text-error">+2 this month</span>
                    </div>
                    <p className="text-sm text-muted">High Risk Units</p>
                    <h2 className="text-3xl font-bold">08</h2>
                </div>
                <div className="glass-card border-l-4 border-primary">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><TrendingUp size={20} /></div>
                        <span className="text-xs font-bold text-primary">84% Accuracy</span>
                    </div>
                    <p className="text-sm text-muted">Predicted Recovery</p>
                    <h2 className="text-3xl font-bold">₹2.4L</h2>
                </div>
                <div className="glass-card border-l-4 border-success">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-success/10 rounded-lg text-success"><ShieldAlert size={20} /></div>
                        <span className="text-xs font-bold text-success">Optimized</span>
                    </div>
                    <p className="text-sm text-muted">Success Rate</p>
                    <h2 className="text-3xl font-bold">92%</h2>
                </div>
            </div>

            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle size={20} className="text-warning" />
                Probability of Default (Next 30 Days)
            </h3>

            <div className="space-y-4">
                {predictions.map((p) => (
                    <motion.div
                        key={p.id}
                        whileHover={{ x: 10 }}
                        className={`glass-card flex items-center gap-6 border-r-4 ${p.level === 'CRITICAL' ? 'border-r-error' : p.level === 'HIGH' ? 'border-r-warning' : 'border-r-primary'
                            }`}
                    >
                        <div className="w-16 h-16 rounded-2xl glass flex flex-col items-center justify-center border border-glass-border">
                            <span className="text-[10px] text-muted uppercase">Risk</span>
                            <span className="text-xl font-bold">{Math.round(p.risk * 100)}%</span>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="text-lg font-bold">{p.unit} - {p.member}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${p.level === 'CRITICAL' ? 'bg-error/20 text-error' : 'bg-warning/20 text-warning'
                                    }`}>
                                    {p.level}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted">
                                <span>Dues: <span className="text-text font-bold">{p.dues}</span></span>
                                <span className="flex items-center gap-1">
                                    {p.factors.map((f, i) => (
                                        <span key={i} className="bg-glass-border px-2 py-0.5 rounded italic">
                                            • {f}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right mr-4">
                                <p className="text-[10px] text-muted uppercase font-bold">Recommendation</p>
                                <p className="text-sm font-bold text-primary">{p.action}</p>
                            </div>
                            <button className="btn btn-primary btn-sm rounded-xl">
                                Take Action <ArrowRight size={14} />
                            </button>
                            <button className="p-2 hover:bg-glass rounded-xl text-primary border border-primary/20">
                                <MessageSquare size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-8 p-6 glass rounded-2xl border border-primary/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                        <BrainCircuit />
                    </div>
                    <div>
                        <h4 className="font-bold">AI Insight</h4>
                        <p className="text-sm text-muted">Units in 'Wing C' show a 12% higher probability of delay this quarter compared to last year.</p>
                    </div>
                </div>
                <button className="btn btn-outline btn-sm">View Full Analysis</button>
            </div>
        </div>
    );
};

export default Intelligence;
