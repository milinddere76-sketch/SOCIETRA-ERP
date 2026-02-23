import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldCheck, ArrowRight, Smartphone, RefreshCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [step, setStep] = useState(1); // 1: Login, 2: OTP
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulation of API call
        setTimeout(() => {
            if (email === 'admin@societra.com') {
                // Super Admin Bypasses OTP
                localStorage.setItem('token', 'super-admin-token');
                navigate('/dashboard');
            } else {
                // All other users go to OTP step
                setStep(2);
            }
            setLoading(false);
        }, 1500);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulation of OTP verification
        setTimeout(() => {
            localStorage.setItem('token', 'user-token');
            navigate('/dashboard');
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card w-full max-w-md p-8 relative overflow-hidden"
            >
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">SOCIETRA</h1>
                    <p className="text-text-muted mt-2">
                        {step === 1 ? 'Smart Management & Accounting' : 'Security Verification'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-medium ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-glass border border-glass-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors"
                                        placeholder="admin@society.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between px-1">
                                    <label className="text-sm font-medium">Password</label>
                                    <a href="#" className="text-xs text-primary hover:underline">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-glass border border-glass-border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2 group"
                            >
                                {loading ? 'Checking Credentials...' : (
                                    <>
                                        Continue to Dashboard
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.form
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-6"
                        >
                            <div className="text-center mb-6">
                                <p className="text-sm text-text-muted">
                                    We've sent a 6-digit code to your registered <br />
                                    WhatsApp number ending in <b>*8923</b>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input
                                        type="text"
                                        maxLength={6}
                                        required
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full bg-glass border border-glass-border rounded-xl py-4 pl-10 pr-4 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-primary transition-colors"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Verifying...' : 'Authenticate Login'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs text-text-muted hover:text-white transition-colors flex items-center justify-center gap-2 mt-2"
                                >
                                    <RefreshCcw size={12} /> Use different account
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Footer decorations */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
            </motion.div>
        </div>
    );
};

export default Login;
