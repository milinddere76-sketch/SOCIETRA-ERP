import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    MapPin,
    User,
    Mail,
    Smartphone,
    Lock,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    IndianRupee,
    Info,
    RefreshCw,
    ShieldCheck,
    QrCode
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const PublicRegister = () => {
    const [step, setStep] = useState(1);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        registrationNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        adminEmail: '',
        adminMobile: '',
        adminPassword: '',
        planId: null,
        planName: '',
        planPrice: 0
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await api.get('/public/plans');
                setPlans(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        planId: res.data[0].id,
                        planName: res.data[0].name,
                        planPrice: res.data[0].monthlyPrice
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch plans", err);
                if (err.response?.status === 401) {
                    setError("Public access is not yet activated. Please restart your backend server (mvn spring-boot:run) to apply security changes.");
                } else {
                    setError("Unable to load subscription plans. Please check if the backend is running.");
                }
            }
        };
        fetchPlans();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/public/societies/register', {
                ...formData,
                memberLimit: 50 // Default
            });
            setCreated(res.data);
            setStep(5); // Success step
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentComplete = () => {
        setVerifying(true);
        setTimeout(() => {
            setVerifying(false);
            setPaymentVerified(true);
            setTimeout(() => handleSubmit(), 1500);
        }, 2500);
    };

    const inputClass = "w-full px-4 py-3 bg-surface-light border border-glass-border rounded-xl focus:border-primary outline-none transition-colors font-medium text-sm";
    const labelClass = "block text-[10px] font-black uppercase tracking-widest text-text-muted mb-1.5 ml-1";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card w-full max-w-2xl p-0 relative overflow-hidden shadow-2xl">

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-surface-light flex">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`h-full flex-1 transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-transparent'}`} />
                    ))}
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-3xl font-black gradient-text uppercase tracking-tighter">Register Society</h1>
                            <p className="text-xs font-bold text-text-muted mt-1 uppercase tracking-widest">Step {step} of 4</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            {step === 1 && <Building2 size={24} />}
                            {step === 2 && <IndianRupee size={24} />}
                            {step === 3 && <User size={24} />}
                            {step === 4 && <QrCode size={24} />}
                            {step === 5 && <CheckCircle size={24} />}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Society Name *</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input type="text" name="name" required value={formData.name} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="e.g. Shyama Residency CHS" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="Mumbai" /></div>
                                    <div className="space-y-1.5"><label className={labelClass}>State</label><input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} placeholder="Maharashtra" /></div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Full Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="Wing, Street, Landmark" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button onClick={nextStep} disabled={!formData.name} className="btn btn-primary px-8 rounded-xl font-bold uppercase tracking-widest text-xs">
                                        Next <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    {plans.map(plan => (
                                        <div
                                            key={plan.id}
                                            onClick={() => setFormData({ ...formData, planId: plan.id, planName: plan.name, planPrice: plan.monthlyPrice })}
                                            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${formData.planId === plan.id ? 'border-primary bg-primary/5 shadow-md scale-[1.01]' : 'border-glass-border hover:border-glass-border-hover'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.planId === plan.id ? 'bg-primary text-white' : 'bg-surface-light text-muted'}`}>
                                                    <ShieldCheck size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black uppercase text-sm">{plan.name}</p>
                                                    <p className="text-[10px] font-bold text-text-muted uppercase">{plan.maxFlats} Units Max • {plan.validityDays ? `${plan.validityDays} Days Validity` : 'Unlimited Validity'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-black">₹{plan.monthlyPrice}</p>
                                                <p className="text-[9px] font-black text-text-muted uppercase">Plan Price</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="btn btn-outline px-6 rounded-xl font-bold uppercase tracking-widest text-xs">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button onClick={nextStep} className="btn btn-primary px-8 rounded-xl font-bold uppercase tracking-widest text-xs">
                                        Next <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex gap-3 mb-4">
                                    <Info className="text-primary shrink-0" size={18} />
                                    <p className="text-xs font-bold text-primary">This will be your credentials to log in as the Society Admin after registration.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Admin Email *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input type="email" name="adminEmail" required value={formData.adminEmail} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="admin@society.com" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Admin Mobile *</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input type="tel" name="adminMobile" required value={formData.adminMobile} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Set Password *</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                        <input type="password" name="adminPassword" required value={formData.adminPassword} onChange={handleChange} className={`${inputClass} pl-11`} placeholder="••••••••" />
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="btn btn-outline px-6 rounded-xl font-bold uppercase tracking-widest text-xs">
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                    <button
                                        onClick={() => {
                                            const plan = plans.find(p => p.id === formData.planId);
                                            if (plan?.monthlyPrice === 0 || plan?.planType === 'DEMO') handleSubmit();
                                            else nextStep();
                                        }}
                                        disabled={!formData.adminEmail || !formData.adminPassword}
                                        className="btn btn-primary px-8 rounded-xl font-bold uppercase tracking-widest text-xs"
                                    >
                                        {plans.find(p => p.id === formData.planId)?.monthlyPrice === 0 ? 'Submit Application' : 'Proceed to Payment'} <ArrowRight size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
                                <h2 className="text-xl font-black uppercase text-primary tracking-tighter">Complete Payment</h2>
                                <p className="text-xs font-bold text-text-muted max-w-sm mx-auto">Scan this QR code with any UPI app to pay for your <b>{formData.planName}</b>.</p>

                                <div className="relative mx-auto w-52 h-52 bg-white p-3 rounded-2xl shadow-xl border-4 border-primary/10">
                                    <img src="/GooglePay_QR.png" alt="Payment QR" className="w-full h-full object-contain" />
                                    {verifying && <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl"><RefreshCw className="animate-spin text-primary" size={32} /></div>}
                                    {paymentVerified && <div className="absolute inset-0 bg-success/90 flex flex-col items-center justify-center text-white rounded-xl"><CheckCircle size={48} /><p className="font-black mt-2">PAID</p></div>}
                                </div>

                                <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm"><IndianRupee size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-primary tracking-widest">Payable Amount</p>
                                        <p className="text-2xl font-black text-text">₹ {formData.planPrice}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    <button onClick={handlePaymentComplete} disabled={verifying || paymentVerified} className="btn btn-primary w-full py-4 rounded-xl font-black uppercase tracking-widest">
                                        {verifying ? 'Verifying...' : paymentVerified ? 'Payment Verified!' : 'I have completed payment'}
                                    </button>
                                    <button onClick={prevStep} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors">Cancel & Go Back</button>
                                </div>
                            </motion.div>
                        )}

                        {step === 5 && created && (
                            <motion.div key="step5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8 py-6">
                                <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto shadow-inner"><CheckCircle size={56} /></div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase text-success tracking-tighter">Society Registered!</h2>
                                    <p className="text-sm font-bold text-text-muted max-w-sm mx-auto mt-2">Welcome to the SOCIETRA family. Your society has been successfully established in the cloud.</p>
                                </div>

                                <div className="bg-surface-light p-6 rounded-2xl border border-glass-border text-left space-y-4">
                                    <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-primary/20">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-text-muted flex items-center gap-1.5"><ShieldCheck size={12} className="text-primary" /> Society Access Code</p>
                                            <p className="text-2xl font-black text-primary font-mono tracking-widest mt-1">{created.societyCode}</p>
                                        </div>
                                        <button onClick={() => { navigator.clipboard.writeText(created.societyCode); alert("Code copied!"); }} className="p-3 hover:bg-surface-light rounded-xl transition-colors text-primary"><RefreshCw size={20} /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white p-3 rounded-xl border border-glass-border">
                                            <p className="text-[9px] font-black text-text-muted uppercase">Admin Email</p>
                                            <p className="text-xs font-bold truncate">{formData.adminEmail}</p>
                                        </div>
                                        <div className="bg-white p-3 rounded-xl border border-glass-border">
                                            <p className="text-[9px] font-black text-text-muted uppercase">Admin Password</p>
                                            <p className="text-xs font-bold">••••••••</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={() => navigate('/login')} className="btn btn-primary w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                                    Go to Login <ArrowRight size={20} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-error/5 border border-error/20 rounded-xl text-error text-xs font-bold text-center flex items-center justify-center gap-2">
                            <Info size={14} /> {error}
                        </motion.div>
                    )}
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="font-black text-primary uppercase tracking-widest text-xs">Provisioning your society...</p>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default PublicRegister;
