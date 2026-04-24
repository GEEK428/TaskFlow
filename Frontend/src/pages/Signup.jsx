import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Check, X, Sparkles } from 'lucide-react';
import AuthSidebar from '../components/AuthSidebar';

const Signup = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);


    const [requirements, setRequirements] = useState({
        length: false,
        upper: false,
        number: false,
        special: false
    });

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
        if (e) e.preventDefault();
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            return setError('Please fill in all mandatory fields.');
        }


        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(formData.name)) {
            return setError('Name can only contain alphabetic characters.');
        }

        if (!isPassStrong) {
            return setError('Please fulfill all password requirements.');
        }

        setIsSubmitting(true);
        try {
            const result = await register(formData);
            if (result.success) {
                navigate('/login');
            } else {
                setError(result.message);
                setIsSubmitting(false);
            }
        } catch (err) {
            setError('Account creation failed. Please try again.');
            setIsSubmitting(false);
        }
    };

    const ReqItem = ({ met, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6rem', color: met ? '#10b981' : 'var(--text-mute)' }}>
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
                        <h2>Create Account</h2>
                        <p>Join TaskFlow and supercharge your daily goals.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-pill" style={{ marginBottom: '0.75rem' }}>{error}</div>}

                        <div className="auth-input-group">
                            <label style={{ fontSize: '0.55rem' }}>Full Name</label>
                            <div className="auth-input-wrapper">
                                <User size={14} className="input-icon" />
                                <input
                                    type="text" placeholder="John Doe" required
                                    value={formData.name}
                                    style={{ fontSize: '0.8rem' }}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                        setFormData({ ...formData, name: val });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label>Email Address</label>
                            <div className="auth-input-wrapper">
                                <Mail size={14} className="input-icon" />
                                <input
                                    type="email" placeholder="name@company.com" required
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="auth-input-group">
                            <label>Password</label>
                            <div className="auth-input-wrapper">
                                <Lock size={14} className="input-icon" />
                                <input
                                    type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button type="button" className="eye-toggle" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>

                            { }
                            {formData.password && (
                                <div className="animate-fade" style={{ marginTop: '10px', marginBottom: '10px' }}>
                                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${(Object.values(requirements).filter(Boolean).length / 4) * 100}%`,
                                            background: isPassStrong ? '#10b981' : '#fb7185',
                                            transition: 'all 0.3s'
                                        }}></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 4px' }}>
                                        <ReqItem met={requirements.length} label="8+ Characters" />
                                        <ReqItem met={requirements.upper} label="Uppercase Letter" />
                                        <ReqItem met={requirements.number} label="One Number" />
                                        <ReqItem met={requirements.special} label="Special Char" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="auth-btn-primary" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </div>

                    <div className="sub-footer-links">
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <span>Help Center</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
