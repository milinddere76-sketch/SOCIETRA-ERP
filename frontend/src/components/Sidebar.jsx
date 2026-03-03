import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api';
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
    Shield,
    Calendar,
    LogOut
} from 'lucide-react';
const Sidebar = () => {
    const rawRole = localStorage.getItem('role') || 'SOCIETY_ADMIN';
    const normalizedRole = rawRole.replace('ROLE_', '');
    const [profile, setProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Current Sidebar Role:", normalizedRole);
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/me');
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, [normalizedRole]);

    const superAdminMenu = [
        { name: 'Global Hub', icon: <LayoutDashboard size={20} />, path: '/superadmin' },
        { name: 'Societies', icon: <Building2 size={20} />, path: '/superadmin/societies' },
        { name: 'Global Users', icon: <Users size={20} />, path: '/superadmin/users' },
        { name: 'Module Assigner', icon: <Box size={20} />, path: '/superadmin/modules' },
        { name: 'Society Settings', icon: <Settings size={20} />, path: '/society-settings' },
        { name: 'Accounting Setup', icon: <Calendar size={20} />, path: '/accounting/setup' },
        { name: 'Admin Control Center', icon: <ShieldCheck size={20} />, path: '/admin' },
    ];

    const societyAdminMenu = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
        { name: 'Society Settings', icon: <Settings size={20} />, path: '/society-settings' },
        { name: 'Maintenance', icon: <Receipt size={20} />, path: '/billing' },
        { name: 'Accounting', icon: <Wallet size={20} />, path: '/accounting' },
        { name: 'Accounting Setup', icon: <Settings size={20} />, path: '/accounting/setup' },
        { name: 'Statutory Records', icon: <FileText size={20} />, path: '/records' },
        { name: 'Share Certificates', icon: <Award size={20} />, path: '/certificates' },
        { name: 'AI Intelligence', icon: <BrainCircuit size={20} />, path: '/intelligence' },
        { name: 'Meeting Minutes', icon: <MessageSquare size={20} />, path: '/meetings' },
        { name: 'Gate Security', icon: <Shield size={20} />, path: '/security' },
        { name: 'Asset Management', icon: <Box size={20} />, path: '/assets' },
        { name: 'Helpdesk', icon: <MessageSquare size={20} />, path: '/complaints' },
        { name: 'Members', icon: <Users size={20} />, path: '/members' },
    ];

    const memberMenu = [
        { name: 'Resident Hub', icon: <LayoutDashboard size={20} />, path: '/resident/dashboard' },
        { name: 'My Bills', icon: <Receipt size={20} />, path: '/resident/bills' },
        { name: 'Raise Complaint', icon: <MessageSquare size={20} />, path: '/resident/complaints' },
        { name: 'My Society', icon: <Building2 size={20} />, path: '/resident/society' },
        { name: 'My Profile', icon: <Users size={20} />, path: '/resident/profile' },
    ];

    const menuItems = normalizedRole === 'SUPER_ADMIN' ? superAdminMenu :
        normalizedRole === 'MEMBER' ? memberMenu :
            societyAdminMenu;

    return (
        <aside className="sidebar group/sidebar">
            <div className="flex items-center gap-3 mb-6 px-1 overflow-hidden">
                <div className="w-10 h-10 min-w-[40px] shrink-0 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    S
                </div>
                <div className="sidebar-text flex-1">
                    <h2 className="text-xl font-bold tracking-tight">SOCIETRA</h2>
                    <p className="text-[10px] text-muted tracking-widest uppercase">Management</p>
                </div>
            </div>

            {/* Society Identity Card */}
            {normalizedRole === 'SOCIETY_ADMIN' && profile?.society && (
                <div className="mb-6 px-3 py-3 rounded-xl bg-surface-light/50 border border-glass-border sidebar-text overflow-hidden">
                    <h3 className="font-bold text-primary text-sm truncate">{profile.society.name}</h3>
                    <div className="mt-2 space-y-1 text-xs text-muted">
                        <p className="flex items-center gap-2 truncate" title={profile.society.registrationNumber}><FileText size={12} /> {profile.society.registrationNumber || 'N/A'}</p>
                        <p className="flex items-center gap-2 truncate" title={profile.society.adminEmail}><MessageSquare size={12} /> {profile.society.adminEmail || 'N/A'}</p>
                        <p className="flex items-center gap-2 truncate" title={profile.society.adminMobile}><Users size={12} /> {profile.society.adminMobile || 'N/A'}</p>
                        <p className="flex items-start gap-2 line-clamp-2" title={`${profile.society.address || ''} ${profile.society.city || ''} ${profile.society.pincode || ''}`}>
                            <Building2 size={12} className="shrink-0 mt-0.5" />
                            <span>{profile.society.address}, {profile.society.city} - {profile.society.pincode}</span>
                        </p>
                    </div>
                </div>
            )}

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center justify-between px-3 py-3 rounded-xl transition-all group ${isActive ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-glass hover:text-text'
                            }`
                        }
                    >
                        <div className="flex items-center gap-4 overflow-hidden w-full">
                            <span className="sidebar-icon shrink-0">{item.icon}</span>
                            <span className="font-semibold sidebar-text">{item.name}</span>
                        </div>
                        <ChevronRight size={16} className="sidebar-text opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-glass-border px-1 overflow-hidden">
                <div className="glass p-2 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 min-w-[40px] shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">
                        AU
                    </div>
                    <div className="flex-1 overflow-hidden sidebar-text">
                        <h4 className="text-sm font-bold truncate text-text">{normalizedRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin User'}</h4>
                        <p className="text-[10px] text-muted truncate">{normalizedRole === 'SUPER_ADMIN' ? 'dev@societra.com' : 'admin@society.com'}</p>
                    </div>
                    <div className="sidebar-text shrink-0 flex gap-2">
                        <Settings
                            size={18}
                            className="text-muted hover:text-primary cursor-pointer"
                            onClick={() => navigate('/society-settings')}
                            title="Society Settings"
                        />
                        <LogOut
                            size={18}
                            className="text-error/70 hover:text-error cursor-pointer"
                            onClick={() => {
                                if (window.confirm("Are you sure you want to logout?")) {
                                    localStorage.removeItem('token');
                                    localStorage.removeItem('role');
                                    window.dispatchEvent(new Event('auth-change'));
                                    window.location.href = '/login';
                                }
                            }}
                            title="Logout"
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
