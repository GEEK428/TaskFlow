import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, X, Sparkles, ArrowRight } from 'lucide-react';
import AuthSidebar from '../components/AuthSidebar';
import api from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [requirements, setRequirements] = useState({ length: false, upper: false, number: false, special: false });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const pass = formData.password;
        setRequirements({
            length: pass.length >= 8,
            upper: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*]/.test(pass)
        });
    }, [formData.password]);

    const isPassStrong = Object.values(requirements).every(Boolean);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Basic Validations
        if (!formData.email.trim() || !formData.password.trim() || !formData.confirm.trim()) {
            return setError('Please fill in all mandatory fields.');
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            return setError('Please enter a valid email address.');
        }

        if (!isPassStrong) return setError('Please meet all security requirements.');
        if (formData.password !== formData.confirm) return setError('Passwords do not match.');

        setIsSubmitting(true);
        try {
            await api.post('/auth/direct-reset', { 
                email: formData.email, 
                password: formData.password 
            });
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const ReqItem = ({ met, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: met ? '#10b981' : 'var(--text-mute)' }}>
            {met ? <Check size={10} /> : <X size={10} />}
            <span>{label}</span>
        </div>
    );

    return (
        <div className="auth-page-wrapper">
            <div className="auth-main-container animate-fade">
                <AuthSidebar />

                <div className="auth-form-pane">
                    <div className="mobile-auth-logo" style={{ marginBottom: '2rem', display: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', color: '#0b0e14', borderRadius: '8px', display: 'grid', placeItems: 'center' }}>
                                <Sparkles size={18} />
                            </div>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: '800' }}>TaskFlow</h1>
                        </div>
                    </div>

                    <div className="auth-form-header">
                        <h2>Forgot Password</h2>
                        <p>Initiate direct security reset to reclaim your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                        {error && <div className="error-pill" style={{ marginBottom: '1.5rem' }}>{error}</div>}

                        <div className="auth-input-group">
                            <label>Registered Email</label>
                            <div className="auth-input-wrapper">
                                <Mail size={14} className="input-icon" />
                                <input 
                                    type="email" placeholder="name@company.com" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label>New Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={14} className="input-icon" />
                                <input 
                                    type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                                <button type="button" className="eye-toggle" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                            {formData.password && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                    <ReqItem met={requirements.length} label="8+ Characters" />
                                    <ReqItem met={requirements.upper} label="Uppercase" />
                                    <ReqItem met={requirements.number} label="Number" />
                                    <ReqItem met={requirements.special} label="Special" />
                                </div>
                            )}
                        </div>

                        <div className="auth-input-group">
                            <label>Confirm New Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={14} className="input-icon" />
                                <input 
                                    type={showConfirm ? 'text' : 'password'} placeholder="••••••••" required
                                    value={formData.confirm}
                                    onChange={(e) => setFormData({...formData, confirm: e.target.value})}
                                />
                                <button type="button" className="eye-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button className="auth-btn-primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Resetting...' : 'Update & Sign In'} <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="auth-footer" style={{ marginTop: '2rem' }}>
                        Remembered your password? <Link to="/login">Back to Sign In</Link>
                    </div>

                    <div className="sub-footer-links" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <span>Help Center</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
