import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    Receipt,
    Wallet,
    FileText,
    Users,
    Settings,
    ShieldCheck,
    ChevronRight,
    Award,
    BrainCircuit,
    MessageSquare,
    Box,
    Shield
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Society Units', icon: <Building2 size={20} />, path: '/units' },
        { name: 'Maintenance', icon: <Receipt size={20} />, path: '/billing' },
        { name: 'Accounting', icon: <Wallet size={20} />, path: '/accounting' },
        { name: 'Statutory Records', icon: <FileText size={20} />, path: '/records' },
        { name: 'Share Certificates', icon: <Award size={20} />, path: '/certificates' },
        { name: 'AI Intelligence', icon: <BrainCircuit size={20} />, path: '/intelligence' },
        { name: 'Meeting Minutes', icon: <MessageSquare size={20} />, path: '/meetings' },
        { name: 'Gate Security', icon: <Shield size={20} />, path: '/security' },
        { name: 'Asset Management', icon: <Box size={20} />, path: '/assets' },
        { name: 'Members', icon: <Users size={20} />, path: '/members' },
        { name: 'Admin Control', icon: <ShieldCheck size={20} />, path: '/admin' },
    ];

    return (
        <aside className="sidebar">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    S
                </div>
                <div>
                    <h2 className="text-xl font-bold tracking-tight">SOCIETRA</h2>
                    <p className="text-[10px] text-muted tracking-widest uppercase">Management</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-glass hover:text-text'
                            }`
                        }
                    >
                        <div className="flex items-center gap-4">
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-glass-border px-2">
                <div className="glass p-4 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-light border border-glass-border" />
                    <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold truncate">Admin User</h4>
                        <p className="text-xs text-muted truncate">admin@society.com</p>
                    </div>
                    <Settings size={18} className="text-muted hover:text-text cursor-pointer" />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
