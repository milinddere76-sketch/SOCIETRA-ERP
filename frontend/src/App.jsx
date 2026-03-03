import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ShareCertificates from './pages/ShareCertificates';
import Intelligence from './pages/Intelligence';
import Meetings from './pages/Meetings';
import Security from './pages/Security';
import Assets from './pages/Assets';
import Complaints from './pages/Complaints';
import AdminControl from './pages/AdminControl';
import CreateSociety from './pages/CreateSociety';
import Units from './pages/Units';
import Members from './pages/Members';
import Billing from './pages/Billing';
import MaintenanceStructure from './pages/MaintenanceStructure';
import Accounting from './pages/Accounting';
import AccountingSetup from './pages/AccountingSetup';
import SocietySettings from './pages/SocietySettings';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SuperAdminSocieties from './pages/SuperAdminSocieties';
import SuperAdminUsers from './pages/SuperAdminUsers';
import SuperAdminModules from './pages/SuperAdminModules';
import ResidentDashboard from './pages/ResidentDashboard';
import ResidentBills from './pages/ResidentBills';
import ResidentProfile from './pages/ResidentProfile';
import ResidentNotifications from './pages/ResidentNotifications';
import PublicRegister from './pages/PublicRegister';
import Sidebar from './components/Sidebar';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', checkAuth);
        // Custom event for same-tab updates
        window.addEventListener('auth-change', checkAuth);
        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('auth-change', checkAuth);
        };
    }, []);

    return (
        <Router>
            <div className="app-container">
                {isAuthenticated && <Sidebar />}
                <main className={isAuthenticated ? "main-content" : "full-content"}>
                    <Routes>
                        <Route
                            path="/register"
                            element={<PublicRegister />}
                        />
                        <Route
                            path="/login"
                            element={!isAuthenticated ? <Login /> : <Navigate to={
                                localStorage.getItem('role') === 'SUPER_ADMIN' ? '/superadmin' :
                                    localStorage.getItem('role') === 'MEMBER' ? '/resident/dashboard' : '/dashboard'
                            } />}
                        />
                        <Route
                            path="/dashboard"
                            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/create-society"
                            element={isAuthenticated ? <CreateSociety /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/units"
                            element={isAuthenticated ? <Units /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/members"
                            element={isAuthenticated ? <Members /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/billing"
                            element={isAuthenticated ? <Billing /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/maintenance-structure"
                            element={isAuthenticated ? <MaintenanceStructure /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/accounting"
                            element={isAuthenticated ? <Accounting /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/accounting/setup"
                            element={isAuthenticated ? <AccountingSetup /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/society-settings"
                            element={isAuthenticated ? <SocietySettings /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/records"
                            element={isAuthenticated ? <Reports /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/certificates"
                            element={isAuthenticated ? <ShareCertificates /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/intelligence"
                            element={isAuthenticated ? <Intelligence /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/meetings"
                            element={isAuthenticated ? <Meetings /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/security"
                            element={isAuthenticated ? <Security /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/assets"
                            element={isAuthenticated ? <Assets /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/complaints"
                            element={isAuthenticated ? <Complaints /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/admin"
                            element={isAuthenticated ? <AdminControl /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/superadmin"
                            element={isAuthenticated ? <SuperAdminDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/superadmin/societies"
                            element={isAuthenticated ? <SuperAdminSocieties /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/superadmin/users"
                            element={isAuthenticated ? <SuperAdminUsers /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/superadmin/modules"
                            element={isAuthenticated ? <SuperAdminModules /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/resident/dashboard"
                            element={isAuthenticated ? <ResidentDashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/resident/bills"
                            element={isAuthenticated ? <ResidentBills /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/resident/profile"
                            element={isAuthenticated ? <ResidentProfile /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/resident/notifications"
                            element={isAuthenticated ? <ResidentNotifications /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/resident/complaints"
                            element={isAuthenticated ? <Complaints /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/"
                            element={!isAuthenticated ? <Navigate to="/login" /> : <Navigate to={
                                localStorage.getItem('role') === 'SUPER_ADMIN' ? '/superadmin' :
                                    localStorage.getItem('role') === 'MEMBER' ? '/resident/dashboard' : '/dashboard'
                            } />}
                        />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
