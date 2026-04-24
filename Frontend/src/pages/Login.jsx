import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import AuthSidebar from '../components/AuthSidebar';
import api from '../services/api';

const Login = () => {
    const { login, setUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    
    const [googleRegistration, setGoogleRegistration] = useState(null);
    const [newName, setNewName] = useState('');

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError('');
            try {
                const res = await api.post('/auth/google', { accessToken: tokenResponse.access_token });
                
                if (res.data.needsName) {
                    setGoogleRegistration(res.data);
                    setNewName(res.data.googleName || '');
                    return;
                }

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUser(res.data.user);
                navigate('/dashboard');
            } catch (err) { 
                setError(err.response?.data?.message || 'Google login failed'); 
            }
        }
    });

    const handleCompleteRegistration = async (e) => {
        if (e) e.preventDefault();
        setError('');
        
        if (!newName.trim()) return setError('Name is mandatory');

        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(newName)) return setError('Name can only contain alphabetic characters.');

        setIsSubmitting(true);
        try {
            const res = await api.post('/auth/complete-google-registration', {
                name: newName,
                email: googleRegistration.email
            });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setUser(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete registration');
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        
        if (!formData.email.trim() || !formData.password.trim()) {
            return setError('Please fill in all mandatory fields.');
        }

        setIsSubmitting(true);
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
                setIsSubmitting(false);
            }
        } catch (err) {
            setError('Invalid email or password.');
            setIsSubmitting(false);
        }
    };

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
                    {!googleRegistration ? (
                        <>
                            <div className="auth-form-header">
                                <h2>Welcome Back</h2>
                                <p>Sign in to continue tracking your productivity.</p>
                            </div>

                            <button className="google-btn-custom" onClick={() => handleGoogleLogin()}>
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" width="16" />
                                <span>Continue with Google</span>
                            </button>

                            <div className="divider-text">OR WITH EMAIL</div>

                            <form onSubmit={handleSubmit}>
                                {error && <div className="error-pill" style={{marginBottom: '0.75rem'}}>{error}</div>}

                                <div className="auth-input-group">
                                    <label>Email Address</label>
                                    <div className="auth-input-wrapper">
                                        <Mail size={14} className="input-icon" />
                                        <input 
                                            type="email" placeholder="name@company.com" required
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="auth-input-group">
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <label>Password</label>
                                        <Link to="/forgot-password" style={{fontSize: '0.6rem', color: 'var(--text-mute)', textDecoration: 'none', marginBottom: '6px'}}>Forgot Password?</Link>
                                    </div>
                                    <div className="auth-input-wrapper">
                                        <Lock size={14} className="input-icon" />
                                        <input 
                                            type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                        <button type="button" className="eye-toggle" onClick={() => setShowPass(!showPass)}>
                                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>

                                <button className="auth-btn-primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            <div className="auth-footer">
                                Don't have an account? <Link to="/signup">Create One</Link>
                            </div>
                        </>
                    ) : (
                        <div className="animate-fade">
                            <div className="auth-form-header">
                                <h2>Almost There!</h2>
                                <p>Please confirm your name to finish registration.</p>
                            </div>

                            <div style={{textAlign: 'center', marginBottom: '1.5rem'}}>
                                <p style={{fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '8px'}}>{googleRegistration.email}</p>
                            </div>

                            <form onSubmit={handleCompleteRegistration}>
                                {error && <div className="error-pill">{error}</div>}

                                <div className="auth-input-group">
                                    <label>Your Full Name</label>
                                    <div className="auth-input-wrapper">
                                        <User size={14} className="input-icon" />
                                        <input 
                                            type="text" placeholder="John Doe" required
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <button className="auth-btn-primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Completing...' : 'Finish Registration'} <ArrowRight size={18} />
                                </button>
                                
                                <button 
                                    type="button" 
                                    className="auth-footer" 
                                    style={{background: 'none', border: 'none', width: '100%', cursor: 'pointer'}}
                                    onClick={() => setGoogleRegistration(null)}
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="sub-footer-links" style={{marginTop: '2rem'}}>
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <span>Help Center</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
