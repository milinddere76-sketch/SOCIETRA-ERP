import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldCheck, ArrowRight, Smartphone, RefreshCcw, Building2, IndianRupee, QrCode, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [view, setView] = useState('login'); // login, register, payment
    const [step, setStep] = useState(1); // 1: Login, 2: OTP
    const [email, setEmail] = useState('admin@societra.com');
    const [password, setPassword] = useState('Admin@123');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Registration State
    const [regForm, setRegForm] = useState({ name: '', city: '', email: '', plan: 'DEMO' });
    const [paymentVerified, setPaymentVerified] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.requiresOtp === false) {
                localStorage.setItem('token', response.data.token);
                const apiRole = response.data.role;
                let userRole = 'SOCIETY_ADMIN';
                if (apiRole === 'ROLE_SUPER_ADMIN') userRole = 'SUPER_ADMIN';
                else if (apiRole === 'ROLE_MEMBER') userRole = 'MEMBER';

                localStorage.setItem('role', userRole);
                localStorage.setItem('email', response.data.email);
                localStorage.setItem('userName', response.data.firstName + ' ' + response.data.lastName);
                window.dispatchEvent(new Event('auth-change'));

                if (userRole === 'SUPER_ADMIN') navigate('/superadmin');
                else if (userRole === 'MEMBER') navigate('/resident/dashboard');
                else navigate('/dashboard');
            } else {
                setStep(2);
            }
        } catch (error) {
            alert("Login failed! Please check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', 'SOCIETY_ADMIN');
            window.dispatchEvent(new Event('auth-change'));
            navigate('/dashboard');
        } catch (error) {
            alert("Invalid or Expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterInitiate = (e) => {
        e.preventDefault();
        if (regForm.plan === 'DEMO') {
            setView('register-success');
        } else {
            setView('payment');
        }
    };

    const handleQRCodePayment = async () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setPaymentVerified(true);
            setTimeout(() => setView('register-success'), 2000);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card w-full max-w-xl p-8 relative overflow-hidden">

                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-14 h-14 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl">
                        <ShieldCheck size={28} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase">SOCIETRA</h1>
                    <div className="flex gap-4 mt-6 border-b border-glass-border w-full justify-center">
                        <button onClick={() => setView('login')} className={`pb-2 text-xs font-black uppercase tracking-widest transition-all ${view === 'login' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text'}`}>Login</button>
                        <button onClick={() => navigate('/register')} className={`pb-2 text-xs font-black uppercase tracking-widest transition-all ${view === 'register' ? 'text-primary border-b-2 border-primary' : 'text-text-muted hover:text-text'}`}>Register Society</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {view === 'login' && (
                        <motion.div key="login-view" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                            {step === 1 ? (
                                <form onSubmit={handleLogin} className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Work Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-glass border border-glass-border rounded-2xl py-3.5 pl-11 pr-4 focus:border-primary outline-none font-bold text-sm" placeholder="admin@society.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between px-1"><label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Password</label></div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-glass border border-glass-border rounded-2xl py-3.5 pl-11 pr-4 focus:border-primary outline-none font-bold text-sm" placeholder="••••••••" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 group shadow-xl shadow-primary/20">
                                        {loading ? 'Authenticating...' : <><span className="font-bold">SIGN IN</span> <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="text-center mb-2"><p className="text-xs font-bold text-text-muted">Enter verification code sent to your WhatsApp</p></div>
                                    <input type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-glass border border-glass-border rounded-2xl py-5 text-center text-3xl tracking-[0.6em] font-black focus:border-primary outline-none" placeholder="000000" />
                                    <button type="submit" className="btn btn-primary w-full py-4 rounded-2xl font-bold">VERIFY & LOGIN</button>
                                    <button type="button" onClick={() => setStep(1)} className="w-full text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Back to Login</button>
                                </form>
                            )}
                        </motion.div>
                    )}

                    {view === 'register' && (
                        <motion.div key="reg-view" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                            <form onSubmit={handleRegisterInitiate} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Society Name</label><input type="text" required value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} className="w-full bg-glass border border-glass-border rounded-xl py-3 px-4 outline-none text-sm font-bold" /></div>
                                    <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">City</label><input type="text" required value={regForm.city} onChange={e => setRegForm({ ...regForm, city: e.target.value })} className="w-full bg-glass border border-glass-border rounded-xl py-3 px-4 outline-none text-sm font-bold" /></div>
                                </div>
                                <div className="space-y-1.5"><label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1">Official Email</label><input type="email" required value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} className="w-full bg-glass border border-glass-border rounded-xl py-3 px-4 outline-none text-sm font-bold" /></div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { id: 'DEMO', label: 'Demo', price: '₹0', dur: '7 Days' },
                                        { id: 'MONTHLY', label: 'Monthly', price: '₹499', dur: '30 Days' },
                                        { id: 'YEARLY', label: 'Yearly', price: '₹4999', dur: '365 Days' }
                                    ].map(p => (
                                        <div key={p.id} onClick={() => setRegForm({ ...regForm, plan: p.id })} className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${regForm.plan === p.id ? 'border-primary bg-primary/5' : 'border-glass-border hover:border-glass-border-hover'}`}>
                                            <p className="text-[10px] font-black uppercase text-text-muted">{p.label}</p>
                                            <p className="text-lg font-black">{p.price}</p>
                                            <p className="text-[9px] font-bold text-text-muted">{p.dur}</p>
                                        </div>
                                    ))}
                                </div>
                                <button type="submit" className="btn btn-primary w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                                    Next: {regForm.plan === 'DEMO' ? 'Submit Registration' : 'Proceed to Payment'} <ArrowRight size={18} />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {view === 'payment' && (
                        <motion.div key="pay-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                            <h2 className="text-xl font-black uppercase text-primary">SCAN & PAY</h2>
                            <p className="text-xs font-bold text-text-muted">Scan the QR code below using any UPI App (Google Pay, PhonePe, Paytm)</p>
                            <div className="relative mx-auto w-48 h-48 bg-white p-2 rounded-2xl shadow-2xl border-4 border-primary/20">
                                <img src="/GooglePay_QR.png" alt="GooglePay QR" className="w-full h-full object-contain" />
                                {loading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl"><RefreshCw className="animate-spin text-primary" size={32} /></div>}
                                {paymentVerified && <div className="absolute inset-0 bg-success/90 flex flex-col items-center justify-center text-white rounded-xl"><CheckCircle size={48} /><p className="font-black mt-2">PAID</p></div>}
                            </div>
                            <div className="bg-primary/10 p-4 rounded-xl border border-primary/20 flex items-center gap-3 text-left">
                                <IndianRupee size={24} className="text-primary shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-primary">Pending Amount</p>
                                    <p className="text-xl font-black">{regForm.plan === 'MONTHLY' ? '₹ 499.00' : '₹ 4,999.00'}</p>
                                </div>
                            </div>
                            <button onClick={handleQRCodePayment} disabled={loading || paymentVerified} className="btn btn-primary w-full py-4 rounded-xl font-black shadow-lg shadow-primary/20">
                                {loading ? 'Verifying Transaction...' : paymentVerified ? 'Payment Verified!' : 'I HAVE COMPLETED PAYMENT'}
                            </button>
                            <button onClick={() => setView('register')} className="text-[10px] font-black uppercase tracking-widest text-text-muted">Cancel Payment</button>
                        </motion.div>
                    )}

                    {view === 'register-success' && (
                        <motion.div key="success-view" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6 py-10">
                            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto shadow-inner"><CheckCircle size={48} /></div>
                            <h2 className="text-2xl font-black uppercase text-success tracking-tighter">Registration Submitted!</h2>
                            <p className="text-sm font-bold text-text-muted max-w-sm mx-auto">
                                Thank you for choosing SOCIETRA. Your society application is under review. Our team will contact you on <b>{regForm.email}</b> within 24 hours.
                            </p>
                            <div className="flex items-center gap-2 p-4 bg-surface-light border border-glass-border rounded-xl text-left">
                                <Info size={18} className="text-primary" />
                                <p className="text-[10px] font-bold text-text-muted leading-tight">A confirmation email along with payment receipt has been sent to your inbox.</p>
                            </div>
                            <button onClick={() => setView('login')} className="btn btn-primary px-10 py-3 rounded-xl font-bold">BACK TO LOGIN</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default Login;
