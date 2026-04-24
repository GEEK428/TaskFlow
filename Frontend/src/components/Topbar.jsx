import React, { useState, useEffect, useRef } from 'react';
import { Bell, Clock, Check, CheckCheck, X, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateTaskModal from './CreateTaskModal';
import api from '../services/api';

const Topbar = () => {
    const { user, setUser } = useAuth();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [reminderTime, setReminderTime] = useState(user?.reminderTime || '');
    const notiRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Error marking all read:', err);
        }
    };

    const saveReminderTime = async () => {
        try {
            const res = await api.put('/auth/profile', { reminderTime });
            // Update context and local storage immediately
            const updatedUser = { ...user, reminderTime: res.data.user.reminderTime };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Close modal immediately
            setIsTimeModalOpen(false);
            
            // Dispatch event to notify scheduler or other components
            window.dispatchEvent(new CustomEvent('reminderUpdated'));
        } catch (err) {
            console.error('Error saving reminder time:', err);
            alert('Failed to sync reminder. Please try again.');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notiRef.current && !notiRef.current.contains(event.target)) {
                setIsNotiOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="topbar">
            <div className="topbar-left" style={{ display: 'flex', gap: '12px' }}>
                <button className="create-task-btn" onClick={() => setIsModalOpen(true)}>Create Task</button>
            </div>

            <div className="topbar-actions">
                {/* Daily Reminder Button */}
                <div className="icon-badge" onClick={() => setIsTimeModalOpen(true)} title="Daily Reminder">
                    <Clock size={20} className="theme-icon" />
                    {user?.reminderTime && <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', border: '2px solid var(--bg-deep)' }}></div>}
                </div>

                {/* Notification Bell */}
                <div className="icon-badge" onClick={() => setIsNotiOpen(!isNotiOpen)} style={{ position: 'relative' }}>
                    <Bell size={20} className="theme-icon" />
                    {unreadCount > 0 && <div className="notification-count">{unreadCount}</div>}
                    
                    {isNotiOpen && (
                        <div ref={notiRef} className="animate-fade notification-dropdown-mobile" style={{ position: 'absolute', top: '55px', right: '0', width: '320px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 1000, overflow: 'hidden' }}>
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ fontSize: '0.9rem', fontWeight: '800' }}>Notifications</h4>
                                {unreadCount > 0 && <button onClick={(e) => { e.stopPropagation(); markAllRead(); }} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer' }}>Mark all read</button>}
                            </div>
                            <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-mute)', fontSize: '0.8rem' }}>
                                        No recent alerts.
                                    </div>
                                ) : (
                                    notifications.map((noti) => (
                                        <div key={noti._id} onClick={(e) => { e.stopPropagation(); if (!noti.read) markAsRead(noti._id); }} style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)', background: noti.read ? 'transparent' : 'rgba(151, 166, 255, 0.03)', cursor: 'pointer', transition: 'background 0.2s' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: noti.read ? 'var(--text-mute)' : 'white' }}>{noti.title}</span>
                                                <span style={{ fontSize: '0.6rem', color: 'var(--text-mute)' }}>{new Date(noti.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>{noti.message}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile Trigger */}
                <div className="user-profile-trigger" onClick={() => navigate('/settings')} title="View Settings">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'var(--accent)', color: '#0b0e14', fontWeight: '900', fontSize: '0.8rem' }}>
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                    )}
                </div>
            </div>

            {/* Daily Reminder Modal */}
            {isTimeModalOpen && (
                <div className="animate-fade" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'grid', placeItems: 'center' }}>
                    <div style={{ background: '#0b0e14', borderRadius: '32px', padding: '2.5rem', width: '100%', maxWidth: '400px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Daily Intel Hub</h3>
                            <button onClick={() => setIsTimeModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20}/></button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-mute)', marginBottom: '2rem' }}>Set your preferred time for daily in-app productivity briefings and system alerts.</p>
                        
                        <div className="auth-input-group" style={{ marginBottom: '2rem' }}>
                            <label>Reminder Time (Daily)</label>
                            <div className="auth-input-wrapper">
                                <Clock size={14} className="input-icon" />
                                <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} style={{ paddingLeft: '40px' }} />
                            </div>
                        </div>

                        <button onClick={saveReminderTime} className="auth-btn-primary" style={{ margin: 0 }}>
                            Sync Daily Reminder
                        </button>
                    </div>
                </div>
            )}

            <CreateTaskModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onTaskCreated={() => window.dispatchEvent(new Event('taskCreated'))}
            />
        </header>
    );
};

export default Topbar;
