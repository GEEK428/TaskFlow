import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { 
    User, Shield, Trash2, Camera, 
    Save, X, Check, Lock, AlertTriangle, Upload,
    Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
    const { user, setUser, logout } = useAuth();
    
    // States
    const [name, setName] = useState(user?.name || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [isCapturing, setIsCapturing] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });
    const [requirements, setRequirements] = useState({ length: false, upper: false, number: false, special: false });
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState({ profile: false, password: false, avatar: false });
    const [message, setMessage] = useState({ type: '', text: '' });
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const pass = passwords.new;
        setRequirements({
            length: pass.length >= 8,
            upper: /[A-Z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[!@#$%^&*]/.test(pass)
        });
    }, [passwords.new]);

    const isPassStrong = Object.values(requirements).every(Boolean);

    // Handlers
    const startCamera = async () => {
        setIsCapturing(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            setMessage({ type: 'error', text: 'Camera access denied.' });
            setIsCapturing(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
        setIsCapturing(false);
    };

    const capturePhoto = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            setAvatar(canvas.toDataURL('image/png'));
            stopCamera();
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const updateAvatar = async () => {
        setLoading({ ...loading, avatar: true });
        try {
            const res = await api.put('/auth/profile', { avatar });
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setMessage({ type: 'success', text: 'Avatar updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update avatar.' });
        } finally {
            setLoading({ ...loading, avatar: false });
        }
    };

    const updateName = async () => {
        setLoading({ ...loading, profile: true });
        try {
            const res = await api.put('/auth/profile', { name });
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setMessage({ type: 'success', text: 'Name updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
        } finally {
            setLoading({ ...loading, profile: false });
        }
    };

    const updatePassword = async () => {
        setMessage({ type: '', text: '' });

        // Basic Validations
        if (!passwords.new.trim() || !passwords.confirm.trim()) {
            return setMessage({ type: 'error', text: 'Please fill in both password fields.' });
        }

        if (!isPassStrong) {
            return setMessage({ type: 'error', text: 'Please meet all password complexity requirements.' });
        }

        if (passwords.new !== passwords.confirm) {
            return setMessage({ type: 'error', text: 'Passwords do not match.' });
        }

        setLoading({ ...loading, password: true });
        try {
            await api.put('/auth/update-password', { password: passwords.new });
            setPasswords({ new: '', confirm: '' });
            setMessage({ type: 'success', text: 'Password updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Password update failed.' });
        } finally {
            setLoading({ ...loading, password: false });
        }
    };

    const ReqItem = ({ met, label }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', color: met ? '#10b981' : 'var(--text-mute)' }}>
            {met ? <Check size={10} /> : <X size={10} />}
            <span>{label}</span>
        </div>
    );

    return (
        <MainLayout>
            <div className="dashboard-view animate-fade" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
                <div className="dashboard-header" style={{ marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Profile Settings</h2>
                    <p style={{ color: 'var(--text-mute)' }}>Manage your identification and security hub.</p>
                </div>

                {message.text && (
                    <div className="animate-fade" style={{ background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? '#10b981' : '#fb7185', padding: '12px 20px', borderRadius: '12px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                        {message.text}
                    </div>
                )}

                <div className="mobile-scroll-container" style={{ marginBottom: '2rem' }}>
                    <div className="mobile-scroll-content" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                        
                        {/* Modular Section: Avatar */}
                        <section style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                                <Camera size={18} color="var(--accent)" /> Identity Icon
                            </h3>
                            
                            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                                <div style={{ width: '120px', height: '120px', borderRadius: '24px', background: 'var(--bg-input)', border: '2px solid var(--border-light)', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
                                    {avatar ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent)' }}>{user?.name?.charAt(0).toUpperCase()}</span>}
                                </div>
                                
                                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <label style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Upload size={16} /> From System
                                        <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                                    </label>
                                    <button onClick={startCamera} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Camera size={16} /> Capture Image
                                    </button>
                                    <button onClick={updateAvatar} disabled={loading.avatar} style={{ padding: '12px', borderRadius: '12px', background: 'var(--accent)', color: '#0b0e14', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800', border: 'none', gridColumn: 'span 1' }}>
                                        <Save size={16} /> {loading.avatar ? 'Saving...' : 'Save Photo'}
                                    </button>
                                    <button onClick={async () => {
                                        setLoading({ ...loading, avatar: true });
                                        try {
                                            const res = await api.put('/auth/profile', { avatar: '' });
                                            setAvatar('');
                                            setUser(res.data.user);
                                            localStorage.setItem('user', JSON.stringify(res.data.user));
                                            setMessage({ type: 'success', text: 'Photo deleted successfully!' });
                                        } catch (err) {
                                            setMessage({ type: 'error', text: 'Failed to delete photo.' });
                                        } finally {
                                            setLoading({ ...loading, avatar: false });
                                        }
                                    }} disabled={loading.avatar} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(251, 113, 133, 0.1)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '800', border: '1px solid rgba(251, 113, 133, 0.2)' }}>
                                        <Trash2 size={16} /> Delete Photo
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Modular Section: Name */}
                        <section style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                                <User size={18} color="var(--accent)" /> Personal Details
                            </h3>
                            <div className="auth-input-group" style={{ marginBottom: '1.5rem' }}>
                                <label>Full Name</label>
                                <div className="auth-input-wrapper">
                                    <User size={14} className="input-icon" />
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={updateName} disabled={loading.profile} className="auth-btn-primary" style={{ width: 'auto', padding: '10px 30px', margin: 0, fontSize: '0.85rem' }}>
                                {loading.profile ? 'Updating...' : 'Update Name'}
                            </button>
                        </section>

                        {/* Modular Section: Security */}
                        <section style={{ background: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                                <Shield size={18} color="var(--accent)" /> Vault Overhaul
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                                <div className="auth-input-group">
                                    <label>New Password</label>
                                    <div className="auth-input-wrapper">
                                        <Lock size={14} className="input-icon" />
                                        <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                                        <button type="button" className="eye-toggle" onClick={() => setShowPass(!showPass)}>
                                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                    {passwords.new && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                                            <ReqItem met={requirements.length} label="8+ Chars" />
                                            <ReqItem met={requirements.upper} label="Uppercase" />
                                            <ReqItem met={requirements.number} label="Number" />
                                            <ReqItem met={requirements.special} label="Special" />
                                        </div>
                                    )}
                                </div>
                                <div className="auth-input-group">
                                    <label>Confirm Password</label>
                                    <div className="auth-input-wrapper">
                                        <Lock size={14} className="input-icon" />
                                        <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                                        <button type="button" className="eye-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                                            {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={updatePassword} disabled={loading.password} className="auth-btn-primary" style={{ width: 'auto', padding: '10px 30px', margin: 0, fontSize: '0.85rem' }}>
                                {loading.password ? 'Updating...' : 'Save New Credentials'}
                            </button>
                        </section>

                        {/* Danger Zone */}
                        <section style={{ background: 'rgba(251, 113, 133, 0.05)', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(251, 113, 133, 0.2)' }}>
                            <h3 style={{ fontSize: '1rem', color: '#fb7185', marginBottom: '1rem', fontWeight: '800' }}>Permanent Deletion</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-mute)', marginBottom: '2.5rem', lineHeight: '1.8' }}>
                                This action is final and irreversible. All your tasks, performance records, and profile data will be permanently purged from the TaskFlow database. 
                                <br/><br/>
                                Please ensure you have backed up any necessary information before proceeding.
                            </p>
                            <button onClick={() => setShowDeleteModal(true)} style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid #fb7185', background: 'transparent', color: '#fb7185', fontWeight: '800', cursor: 'pointer' }}>
                                Delete Account
                            </button>
                        </section>
                    </div>
                </div>
            </div>

            {/* Modals: Camera & Delete */}
            {isCapturing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'grid', placeItems: 'center' }}>
                    <div style={{ background: '#0b0e14', borderRadius: '32px', padding: '2rem', width: '100%', maxWidth: '500px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3>Capture Hub</h3>
                            <button onClick={stopCamera} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20}/></button>
                        </div>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', aspectRatio: '1', borderRadius: '24px', objectFit: 'cover', border: '2px solid var(--accent)', marginBottom: '2rem' }} />
                        <button onClick={capturePhoto} className="auth-btn-primary" style={{ margin: 0 }}>Take Snapshot</button>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'grid', placeItems: 'center' }}>
                    <div style={{ background: '#0b0e14', borderRadius: '32px', padding: '2.5rem', width: '100%', maxWidth: '450px', border: '1px solid rgba(251, 113, 133, 0.3)', textAlign: 'center' }}>
                        <AlertTriangle size={48} color="#fb7185" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ marginBottom: '1rem' }}>Confirm Destruction</h3>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-mute)', marginBottom: '2rem' }}>Type <strong style={{ color: 'white' }}>{user.name}</strong> to confirm:</p>
                        <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} style={{ width: '100%', padding: '14px', background: 'var(--bg-input)', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'white', textAlign: 'center', marginBottom: '2rem' }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <button onClick={() => setShowDeleteModal(false)} style={{ padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--border-light)', color: 'white' }}>Cancel</button>
                            <button onClick={async () => { try { await api.delete('/auth/delete-account', { data: { nameConfirmation: deleteConfirm } }); logout(); } catch(err) { setMessage({type:'error', text:'Failed to delete.'}); } }} disabled={deleteConfirm !== user.name} style={{ padding: '12px', borderRadius: '12px', background: '#fb7185', color: 'white', border: 'none', opacity: deleteConfirm === user.name ? 1 : 0.4 }}>Delete Forever</button>
                        </div>
                    </div>
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </MainLayout>
    );
};

export default Settings;
