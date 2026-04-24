import React, { useState } from 'react';
import { X, Calendar, Clock, Tag, Type, AlignLeft, Send, Sparkles } from 'lucide-react';
import api from '../services/api';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Development',
        date: '',
        hours: '12',
        minutes: '00'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const validateTime = () => {
        const h = parseInt(formData.hours);
        const m = parseInt(formData.minutes);
        
        if (isNaN(h) || h < 0 || h > 23) {
            setError('Hours must be between 0 and 23');
            return false;
        }
        if (isNaN(m) || m < 0 || m > 59) {
            setError('Minutes must be between 0 and 59');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');

        if (!formData.title || !formData.description || !formData.date) {
            return setError('Please fill in all mandatory fields.');
        }

        if (!validateTime()) return;

        setLoading(true);
        try {
            const h = formData.hours.padStart(2, '0');
            const m = formData.minutes.padStart(2, '0');
            const deadline = new Date(`${formData.date}T${h}:${m}:00`);
            const now = new Date();
            
            if (isNaN(deadline.getTime())) {
                return setError('Invalid date or time format. Please re-enter.');
            }

            
            if (deadline <= now) {
                return setError('Deadline must be in the future. Past times are not allowed.');
            }

            await api.post('/tasks', {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                deadline: deadline.toISOString()
            });

            onTaskCreated();
            onClose();
            setFormData({ title: '', description: '', category: 'Development', date: '', hours: '12', minutes: '00' });
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to create task';
            setError(msg === 'Network Error' ? 'Backend server unreachable. Please check connection.' : msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container animate-fade">
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="modal-logo-box">
                            <Sparkles size={16} />
                        </div>
                        <h2 className="syne">New Task</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && <div className="error-pill" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                        <div className="modal-input-group">
                            <label className="modal-label">Category</label>
                            <div className="modal-input-wrapper">
                                <Tag size={14} className="modal-icon" />
                                <select 
                                    className="modal-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    <option value="Development">Development</option>
                                    <option value="Design">Design</option>
                                    <option value="Production">Production</option>
                                    <option value="QA">QA</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Management">Management</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="modal-input-group">
                            <label className="modal-label">Deadline Date</label>
                            <div className="modal-input-wrapper">
                                <Calendar size={14} className="modal-icon" />
                                <input 
                                    type="date" required
                                    value={formData.date}
                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-input-group">
                        <label className="modal-label">Task Title</label>
                        <div className="modal-input-wrapper">
                            <Type size={14} className="modal-icon" />
                            <input 
                                type="text" placeholder="e.g. Design System Audit" required
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="modal-input"
                            />
                        </div>
                    </div>

                    <div className="modal-input-group">
                        <label className="modal-label">Description</label>
                        <div className="modal-input-wrapper">
                            <AlignLeft size={14} className="modal-icon" style={{ top: '14px' }} />
                            <textarea 
                                placeholder="Add technical context..." required
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="modal-input modal-textarea"
                                style={{ minHeight: '80px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="modal-input-group">
                            <label className="modal-label">Hour (0-23)</label>
                            <div className="modal-input-wrapper">
                                <Clock size={14} className="modal-icon" />
                                <input 
                                    type="number" min="0" max="23"
                                    placeholder="12"
                                    value={formData.hours}
                                    onChange={(e) => setFormData({...formData, hours: e.target.value})}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                        <div className="modal-input-group">
                            <label className="modal-label">Minutes (0-59)</label>
                            <div className="modal-input-wrapper">
                                <Clock size={14} className="modal-icon" />
                                <input 
                                    type="number" min="0" max="59"
                                    placeholder="00"
                                    value={formData.minutes}
                                    onChange={(e) => setFormData({...formData, minutes: e.target.value})}
                                    className="modal-input"
                                />
                            </div>
                        </div>
                    </div>

                    <button className="launch-btn" type="submit" disabled={loading} style={{ marginTop: '1.5rem' }}>
                        <span>{loading ? 'Launching...' : 'Launch Task'}</span>
                        <Send size={16} />
                    </button>
                </form>
            </div>

            <style jsx="true">{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(5, 7, 10, 0.85);
                    backdrop-filter: blur(10px);
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    padding-top: 5vh;
                    z-index: 99999;
                    overflow-y: auto;
                }
                .modal-container {
                    width: 95%;
                    max-width: 480px;
                    max-height: 90vh;
                    overflow-y: auto;
                    background: #121721;
                    border: 1px solid rgba(151, 166, 255, 0.15);
                    border-radius: 24px;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
                }
                .modal-header {
                    padding: 1.25rem 2rem;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .modal-logo-box {
                    width: 24px;
                    height: 24px;
                    background: var(--accent);
                    color: #0b0e14;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--text-mute);
                    cursor: pointer;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: grid;
                    place-items: center;
                    transition: all 0.2s;
                }
                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: white;
                }
                .modal-body {
                    padding: 1.5rem 2rem 2rem;
                }
                .modal-input-group {
                    margin-bottom: 1rem;
                }
                .modal-label {
                    display: block;
                    font-size: 0.65rem;
                    font-weight: 800;
                    color: var(--text-mute);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 8px;
                }
                .modal-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .modal-icon {
                    position: absolute;
                    left: 14px;
                    color: var(--accent);
                    opacity: 0.8;
                    z-index: 10;
                }
                .modal-input, .modal-select {
                    width: 100%;
                    background: #1a1f2b !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    padding: 12px 12px 12px 42px !important;
                    border-radius: 10px !important;
                    color: white !important;
                    font-size: 0.9rem !important;
                    outline: none !important;
                    transition: all 0.2s !important;
                }
                .modal-input:focus, .modal-select:focus {
                    border-color: var(--accent) !important;
                    background: #1e2536 !important;
                    box-shadow: 0 0 0 4px rgba(151, 166, 255, 0.1);
                }
                .modal-textarea {
                    min-height: 100px;
                    resize: none;
                    line-height: 1.5;
                }
                .modal-select {
                    appearance: none;
                    cursor: pointer;
                }
                .launch-btn {
                    width: 100%;
                    margin-top: 2rem;
                    padding: 14px;
                    background: linear-gradient(135deg, #97A6FF 0%, #6366F1 100%);
                    color: #0b0e14;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
                }
                .launch-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 35px rgba(99, 102, 241, 0.5);
                    filter: brightness(1.1);
                }
                .launch-btn:active {
                    transform: translateY(0);
                }
                .launch-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                /* Hide number input arrows */
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                  -webkit-appearance: none;
                  margin: 0;
                }
            `}</style>
        </div>
    );
};

export default CreateTaskModal;
