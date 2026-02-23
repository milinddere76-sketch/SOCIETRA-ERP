import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import ShareCertificates from './pages/ShareCertificates';
import Intelligence from './pages/Intelligence';
import Meetings from './pages/Meetings';
import Security from './pages/Security';
import Assets from './pages/Assets';
import Sidebar from './components/Sidebar';

function App() {
    const isAuthenticated = true; // Placeholder for auth logic

    return (
        <Router>
            <div className="app-container">
                {isAuthenticated && <Sidebar />}
                <main className={isAuthenticated ? "main-content" : "full-content"}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/dashboard"
                            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
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
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
