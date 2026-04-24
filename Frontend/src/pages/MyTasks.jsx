import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    CheckSquare, 
    Settings, 
    LogOut, 
    Search, 
    Plus, 
    Clock, 
    Zap,
    Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { NavLink } from 'react-router-dom';
import api from '../services/api';
import './MyTasks.css';
import './Dashboard.css';

const MyTasks = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const res = await api.get('/tasks');
                setTasks(res.data);
            } catch (err) {
                showToast({ type: 'error', title: 'Error', message: 'Could not load tasks.' });
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'overdue') return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';
        if (filter === 'high') return t.priority === 'high';
        return true;
    });

    return (
        <div className="dashboard-layout animate-fade">
            <aside className="sidebar glass-panel">
                <div className="sidebar-brand">
                    <div className="brand-logo"><Zap size={20} fill="currentColor" /></div>
                    <span className="syne">TaskFlow</span>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className="nav-link"><LayoutDashboard size={18} /> <span>Dashboard</span></NavLink>
                    <NavLink to="/tasks" className="nav-link"><CheckSquare size={18} /> <span>My Tasks</span></NavLink>
                    <NavLink to="/leaderboard" className="nav-link"><Trophy size={18} /> <span>Leaderboard</span></NavLink>
                    <NavLink to="/settings" className="nav-link"><Settings size={18} /> <span>Settings</span></NavLink>
                </nav>
                <div className="sidebar-footer">
                    <div className="user-pill glass-panel">
                        <div className="avatar">{user?.name?.[0] || 'U'}</div>
                        <div className="user-details">
                            <span className="name">{user?.name}</span>
                            <span className="email">{user?.email}</span>
                        </div>
                        <button className="logout-icon" onClick={logout}><LogOut size={16} /></button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <div className="header-info">
                        <h1 className="syne">My Assignments</h1>
                        <p className="date-text">Streamlined task list</p>
                    </div>
                </header>

                <div className="content-inner list-view-content">
                    <div className="filter-bar glass-panel">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                        <button className={filter === 'overdue' ? 'active' : ''} onClick={() => setFilter('overdue')}>Overdue</button>
                        <button className={filter === 'high' ? 'active' : ''} onClick={() => setFilter('high')}>High Priority</button>
                    </div>

                    <div className="tasks-list">
                        {filteredTasks.length === 0 ? (
                            <div className="empty-state glass-panel">No tasks found.</div>
                        ) : (
                            filteredTasks.map(task => (
                                <div key={task._id} className={`task-list-item glass-panel ${task.priority}`}>
                                    <div className={`status-dot ${task.status}`}></div>
                                    <div className="item-content">
                                        <h4>{task.title}</h4>
                                        <div className="item-meta">
                                            <span className="priority-label">{task.priority}</span>
                                            {task.dueDate && (
                                                <span className={`due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                                                    <Clock size={12} />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="item-status-pill">{task.status.replace('-', ' ')}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyTasks;
