import React, { useState, useEffect } from 'react';
import { Home, Plus, Search, Filter, X } from 'lucide-react';
import api from '../api';

const Units = () => {
    const [units, setUnits] = useState([]);
    const [wings, setWings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        unitNumber: '',
        unitType: '2BHK',
        areaSqft: '',
        ownerName: '',
        occupied: true,
        wingId: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [unitRes, wingRes] = await Promise.all([
                api.get('/units'),
                api.get('/units/wings')
            ]);
            setUnits(unitRes.data);
            setWings(wingRes.data);
            if (wingRes.data.length > 0) {
                setFormData(prev => ({ ...prev, wingId: wingRes.data[0].id }));
            }
        } catch (error) {
            console.error("Failed to fetch units", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean the data: empty string to null for UUID translation
            const submitData = {
                ...formData,
                wingId: formData.wingId || null
            };

            await api.post('/units', submitData);
            setIsModalOpen(false);
            setFormData({
                unitNumber: '',
                unitType: '2BHK',
                areaSqft: '',
                ownerName: '',
                occupied: true,
                wingId: wings.length > 0 ? wings[0].id : ''
            });
            await fetchData();
            alert('Unit registered successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to register unit. Ensure you have selected a Wing.');
        }
    };

    const addWing = async () => {
        const name = prompt("Enter Wing Name (e.g., Wing A, Block B):");
        if (name) {
            try {
                await api.post('/units/wings', { name });
                fetchData();
            } catch (error) {
                alert("Failed to add wing.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text pb-2">Society Units</h1>
                    <p className="text-text-muted">Manage all residential and commercial units within your society.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={addWing} className="btn bg-surface border border-glass-border hover:border-primary/50 text-sm">
                        <Plus size={18} /> Add Wing
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary shadow-lg shadow-primary/30">
                        <Plus size={20} /> Add Unit
                    </button>
                </div>
            </header>

            <div className="glass-card p-0 overflow-hidden">
                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface-light/50">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-2.5 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search units or owners..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-glass-border rounded-xl focus:border-primary outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface border-b border-glass-border text-muted text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-center">Wing</th>
                                <th className="px-6 py-4 font-semibold">Unit Number</th>
                                <th className="px-6 py-4 font-semibold">Type</th>
                                <th className="px-6 py-4 font-semibold">Area (SqFt)</th>
                                <th className="px-6 py-4 font-semibold">Owner/Tenant</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-muted">Loading society data...</td></tr>
                            ) : units.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-muted">No units registered in this society. Click "Add Unit" to start.</td></tr>
                            ) : units.filter(u => u.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) || u.ownerName?.toLowerCase().includes(searchTerm.toLowerCase())).map((unit) => (
                                <tr key={unit.id} className="hover:bg-surface-light/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 mx-auto rounded-xl bg-surface border border-glass-border flex items-center justify-center font-bold text-xs text-primary shadow-sm uppercase">
                                            {unit.wingName || '---'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Home size={16} />
                                        </div>
                                        {unit.unitNumber}
                                    </td>
                                    <td className="px-6 py-4 text-muted">{unit.unitType}</td>
                                    <td className="px-6 py-4 font-mono">{unit.areaSqft ? `${unit.areaSqft} sqft` : '---'}</td>
                                    <td className="px-6 py-4 font-medium">{unit.ownerName || 'Unassigned'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${unit.occupied ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                            {unit.occupied ? 'OCCUPIED' : 'VACANT'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Unit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 p-2 hover:bg-surface-light rounded-full transition-colors text-muted"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-2xl font-bold mb-6 gradient-text">Register New Unit</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Wing/Block</label>
                                    <select
                                        className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm"
                                        value={formData.wingId}
                                        onChange={(e) => setFormData({ ...formData, wingId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Wing</option>
                                        {wings.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Unit Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. A-101"
                                        className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm"
                                        value={formData.unitNumber}
                                        onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Unit Type</label>
                                    <select
                                        className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm"
                                        value={formData.unitType}
                                        onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                                    >
                                        <option value="1BHK">1 BHK</option>
                                        <option value="2BHK">2 BHK</option>
                                        <option value="3BHK">3 BHK</option>
                                        <option value="Penthouse">Penthouse</option>
                                        <option value="Shop">Commercial Shop</option>
                                        <option value="Office">Office Space</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Area (Sq. Ft.)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 750"
                                        className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm"
                                        value={formData.areaSqft}
                                        onChange={(e) => setFormData({ ...formData, areaSqft: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Owner/Member Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter full name"
                                    className="w-full p-3 rounded-xl bg-surface border border-glass-border focus:border-primary outline-none text-sm"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="occupied"
                                    checked={formData.occupied}
                                    onChange={(e) => setFormData({ ...formData, occupied: e.target.checked })}
                                    className="w-4 h-4 rounded border-glass-border accent-primary"
                                />
                                <label htmlFor="occupied" className="text-sm font-semibold cursor-pointer">Unit is currently occupied</label>
                            </div>

                            <button type="submit" className="w-full btn btn-primary py-4 mt-4 shadow-lg shadow-primary/20">
                                Register Unit
                            </button>
                        </form>

                        {wings.length === 0 && (
                            <p className="mt-4 text-[10px] text-warning font-bold text-center uppercase">Warning: You must create at least one Wing/Block before adding units.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Units;
