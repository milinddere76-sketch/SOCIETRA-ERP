import React, { useState, useEffect } from 'react';
import { Settings, Plus, Trash2, Save, Calendar, CheckSquare } from 'lucide-react';
import api from '../api';

const MaintenanceStructure = () => {
    const [config, setConfig] = useState({
        repairsAndMaintenance: 0,
        sinkingFund: 0,
        serviceCharges: 0,
        commonUtilityCharges: 0,
        statutoryFees: 0,
        parkingCharges: 0,
        miscellaneousCharges: 0,
        calculationMethod: 'FIXED',
        recurringBillingEnabled: false,
        recurringBillingDay: 1
    });
    const [customHeads, setCustomHeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [configRes, headsRes] = await Promise.all([
                api.get('/maintenance-config'),
                api.get('/maintenance-heads')
            ]);
            if (configRes.data) setConfig(configRes.data);
            setCustomHeads(headsRes.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching maintenance structure", error);
            setLoading(false);
        }
    };

    const handleSaveConfig = async () => {
        try {
            setSaving(true);
            await api.post('/maintenance-config', config);
            alert("Maintenance configuration saved successfully!");
        } catch (error) {
            console.error("Failed to save config", error);
            alert("Error saving configuration.");
        } finally {
            setSaving(false);
        }
    };

    const handleAddHead = async () => {
        const name = prompt("Enter Charge Head Name (e.g., Lift Charges):");
        if (!name) return;
        const amount = prompt("Enter Default Amount:");
        if (isNaN(amount)) return;

        try {
            const res = await api.post('/maintenance-heads', { 
                name, 
                amount: parseFloat(amount),
                calculationMethod: config.calculationMethod 
            });
            setCustomHeads([...customHeads, res.data]);
        } catch (error) {
            console.error("Failed to add head", error);
        }
    };

    const handleDeleteHead = async (id) => {
        if (!window.confirm("Delete this charge head?")) return;
        try {
            await api.delete(`/maintenance-heads/${id}`);
            setCustomHeads(customHeads.filter(h => h.id !== id));
        } catch (error) {
            console.error("Failed to delete head", error);
        }
    };

    if (loading) return <div className="p-8">Loading configuration...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold gradient-text pb-2">Maintenance Billing Structure</h1>
                    <p className="text-text-muted">Define your society's custom charge heads and recurring billing rules.</p>
                </div>
                <button 
                    onClick={handleSaveConfig}
                    disabled={saving}
                    className="btn btn-primary shadow-lg shadow-primary/30 flex items-center gap-2"
                >
                    <Save size={20} /> {saving ? 'Saving...' : 'Save All Settings'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Standard Heads Configuration */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Settings className="text-primary" size={24} /> Standard Charge Heads
                    </h2>
                    <div className="space-y-4">
                        {[
                            { label: "Repairs & Maintenance", key: "repairsAndMaintenance" },
                            { label: "Sinking Fund", key: "sinkingFund" },
                            { label: "Service Charges", key: "serviceCharges" },
                            { label: "Common Utility Charges", key: "commonUtilityCharges" },
                            { label: "Statutory Fees", key: "statutoryFees" },
                            { label: "Parking Charges", key: "parkingCharges" },
                            { label: "Miscellaneous Charges", key: "miscellaneousCharges" },
                        ].map((field) => (
                            <div key={field.key} className="flex items-center justify-between p-3 rounded-xl border border-glass-border bg-surface/30">
                                <span className="font-medium">{field.label}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-muted text-sm">₹</span>
                                    <input 
                                        type="number"
                                        value={config[field.key]}
                                        onChange={(e) => setConfig({ ...config, [field.key]: parseFloat(e.target.value) || 0 })}
                                        className="w-24 bg-background border border-glass-border rounded-lg p-1.5 text-right font-bold outline-none focus:border-primary"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-glass-border">
                        <label className="block text-sm font-bold text-muted uppercase tracking-wider mb-2">Calculation Base</label>
                        <div className="flex gap-4">
                            {['FIXED', 'PER_SQFT'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setConfig({ ...config, calculationMethod: method })}
                                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold ${
                                        config.calculationMethod === method 
                                        ? 'bg-primary/10 border-primary text-primary' 
                                        : 'bg-surface border-glass-border text-muted'
                                    }`}
                                >
                                    {method.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Custom heads */}
                    <div className="glass-card">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plus className="text-primary" size={24} /> Custom Charge Heads
                            </h2>
                            <button 
                                onClick={handleAddHead}
                                className="p-2 hover:bg-primary/10 text-primary rounded-full transition-colors"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {customHeads.length === 0 ? (
                                <p className="text-center py-8 text-muted italic">No custom heads defined yet.</p>
                            ) : (
                                customHeads.map((head) => (
                                    <div key={head.id} className="flex justify-between items-center p-4 border border-glass-border rounded-xl bg-surface/30">
                                        <div>
                                            <p className="font-bold">{head.name}</p>
                                            <p className="text-xs text-muted font-medium">₹ {head.amount} ({head.calculationMethod})</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteHead(head.id)}
                                            className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recurring settings */}
                    <div className="glass-card bg-gradient-to-br from-surface to-primary/5 border-primary/20">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="text-primary" size={24} /> Recurring Billing Rules
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold">Enable Auto-Generation</p>
                                    <p className="text-xs text-muted">Automatically generate and email bills every month.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={config.recurringBillingEnabled}
                                        onChange={(e) => setConfig({ ...config, recurringBillingEnabled: e.target.checked })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            {config.recurringBillingEnabled && (
                                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                                    <label className="block text-sm font-medium text-muted">Day of Month to Generate</label>
                                    <input 
                                        type="number"
                                        min="1"
                                        max="28"
                                        value={config.recurringBillingDay}
                                        onChange={(e) => setConfig({ ...config, recurringBillingDay: parseInt(e.target.value) || 1 })}
                                        className="w-full p-3 rounded-xl bg-background border border-glass-border focus:border-primary outline-none"
                                        placeholder="e.g. 1 for 1st of every month"
                                    />
                                    <p className="text-[10px] text-primary flex items-center gap-1 mt-1">
                                        <CheckSquare size={12} /> Bills will be generated on {config.recurringBillingDay || '1st'} of every month.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaintenanceStructure;
