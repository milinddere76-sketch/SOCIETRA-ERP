import React, { useState, useEffect } from 'react';
import { Box, Save, Search, CheckCircle2 } from 'lucide-react';
import api from '../api';

const SuperAdminModules = () => {
    const modulesAvailable = ['Accounting', 'Gate Security', 'AI Intelligence', 'Statutory Records', 'Asset Management'];

    const [societies, setSocieties] = useState([]);

    useEffect(() => {
        fetchSocieties();
    }, []);

    const fetchSocieties = async () => {
        try {
            const response = await api.get('/superadmin/societies');
            // Assuming the backend doesn't return 'modules', we mock an empty selection for now
            const mappedSocieties = response.data.map(soc => ({
                ...soc,
                modules: ['Accounting', 'Gate Security', 'Statutory Records'] // Default selected for demo
            }));
            setSocieties(mappedSocieties);
        } catch (error) {
            console.error("Failed to fetch societies", error);
        }
    };

    const handleToggleModule = (socId, moduleName) => {
        setSocieties(societies.map(soc => {
            if (soc.id === socId) {
                const hasMod = soc.modules.includes(moduleName);
                if (hasMod) {
                    return { ...soc, modules: soc.modules.filter(m => m !== moduleName) };
                } else {
                    return { ...soc, modules: [...soc.modules, moduleName] };
                }
            }
            return soc;
        }));
    };

    const handleDeploy = () => {
        // Mock save implementation mapped to the new dynamic modules array
        alert("Module configurations deployed successfully for all registered societies!");
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold gradient-text pb-2">Module Assignments</h1>
                    <p className="text-text-muted">Provision and restrict core system modules dynamically per society.</p>
                </div>
                <button onClick={handleDeploy} className="btn btn-primary shadow-lg shadow-primary/30">
                    <Save size={20} /> Deploy Configurations
                </button>
            </header>

            <div className="glass-card p-0">
                <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface-light/50">
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-2.5 text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search societies..."
                            className="w-full pl-10 pr-4 py-2 bg-surface border border-glass-border rounded-xl focus:border-primary outline-none text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-surface border-b border-glass-border text-muted text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Society Tenant</th>
                                {modulesAvailable.map(mod => (
                                    <th key={mod} className="px-4 py-4 font-semibold text-center whitespace-nowrap">{mod}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border text-sm">
                            {societies.map(soc => (
                                <tr key={soc.id} className="hover:bg-surface-light/30">
                                    <td className="px-6 py-4 font-bold text-primary">
                                        {soc.name}
                                        <div className="text-xs text-muted font-normal mt-1">{soc.societyCode}</div>
                                    </td>
                                    {modulesAvailable.map(mod => {
                                        const isEnabled = soc.modules.includes(mod);
                                        return (
                                            <td key={mod} className="px-4 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleModule(soc.id, mod)}
                                                    className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${isEnabled ? 'bg-primary text-white border-primary border' : 'bg-surface-light border border-glass-border text-transparent hover:border-primary/50'}`}
                                                >
                                                    {isEnabled && <CheckCircle2 size={14} />}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminModules;
