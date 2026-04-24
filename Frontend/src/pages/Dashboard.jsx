import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { 
    ClipboardList, Clock, CheckCircle2, AlertCircle, 
    Calendar, ChevronLeft, ChevronRight, Sparkles, ArrowRight, X, Trophy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, overdue: 0 });
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    
    const [pages, setPages] = useState({
        Todo: 0,
        'In Progress': 0,
        Done: 0,
        Activity: 0
    });
    const ITEMS_PER_PAGE = 5;

    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const [myRank, setMyRank] = useState('--');

    const fetchData = async () => {
        try {
            const [statsRes, tasksRes, rankRes] = await Promise.all([
                api.get('/tasks/stats'),
                api.get('/tasks'),
                api.get('/leaderboard/me')
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
            setMyRank(rankRes.data.rank);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        window.addEventListener('taskCreated', fetchData);
        return () => window.removeEventListener('taskCreated', fetchData);
    }, []);

    const getColTasks = (status) => tasks.filter(t => t.status === status);

    const handlePageChange = (section, direction) => {
        setPages(prev => ({
            ...prev,
            [section]: direction === 'next' ? prev[section] + 1 : Math.max(0, prev[section] - 1)
        }));
    };

    const handleMarkDone = async (taskId) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: 'Done' });
            fetchData();
            window.dispatchEvent(new CustomEvent('taskUpdated'));
        } catch (err) {
            console.error('Error marking task as done:', err);
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsDetailModalOpen(true);
    };

    const statCards = [
        { label: 'Total Tasks', value: stats.total, icon: <ClipboardList size={16} className="theme-icon" />, color: '#97A6FF' },
        { label: 'In Progress', value: stats.pending, icon: <Clock size={16} />, color: '#f59e0b' },
        { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={16} />, color: '#10b981' },
        { label: 'Overdue', value: stats.overdue, icon: <AlertCircle size={16} />, color: '#fb7185' },
        { label: 'Global Rank', value: `#${myRank}`, icon: <Trophy size={16} color="#97A6FF" />, color: '#97A6FF' }
    ];

    const getCategoryColor = (cat) => {
        const colors = {
            'Development': '#6366F1', 'Design': '#ec4899', 'Production': '#10b981',
            'QA': '#8b5cf6', 'Marketing': '#f59e0b', 'Management': '#3b82f6'
        };
        return colors[cat] || '#718096';
    };

    if (loading) {
        return (
            <MainLayout>
                <div style={{ height: '100%', display: 'grid', placeItems: 'center' }}>
                    <div className="animate-pulse" style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.8rem' }}>Syncing...</div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="dashboard-view animate-fade" style={{ padding: '2rem 2.5rem', maxWidth: '100%', overflowX: 'hidden' }}>
                
                {}
                <header style={{ marginBottom: '2.5rem' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '4px', letterSpacing: '-0.5px' }}>Welcome back, {user?.name.split(' ')[0]}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>Dashboard</span>
                        <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-mute)' }}></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-mute)' }}>Your productivity engine is operational.</span>
                    </div>
                </header>

                {}
                {tasks.length === 0 && !loading && (
                    <div className="nudge-card animate-fade" style={{ marginBottom: '3rem' }} onClick={() => window.dispatchEvent(new CustomEvent('flowAiNudge'))}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                            <div style={{ width: '60px', height: '60px', background: 'rgba(151, 166, 255, 0.1)', borderRadius: '18px', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                                <Sparkles size={32} />
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>Welcome to your Productivity Hub</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-mute)', maxWidth: '400px' }}>It looks like you're just getting started. Would you like some tips on how to structure your first tasks?</p>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: '800', fontSize: '0.8rem' }}>
                                Ask Flow AI <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                )}

                {}
                <div className="stats-grid stat-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '3rem' }}>
                    {statCards.map((stat, i) => (
                        <div key={i} className="stat-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${stat.color}15`, color: stat.color, display: 'grid', placeItems: 'center' }}>
                                {stat.icon}
                            </div>
                            <div>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-mute)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</span>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginTop: '2px' }}>{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {}
                <div className="kanban-board kanban-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    {['Todo', 'In Progress', 'Done'].map((status, i) => {
                        const allColTasks = getColTasks(status);
                        const currentPage = pages[status];
                        const paginatedTasks = allColTasks.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE);
                        const hasNext = (currentPage + 1) * ITEMS_PER_PAGE < allColTasks.length;

                        return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? '#97A6FF' : i === 1 ? '#f59e0b' : '#10b981' }}></div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'white' }}>{status}</span>
                                        <span style={{ fontSize: '0.6rem', padding: '1px 6px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-mute)', fontWeight: '800' }}>{allColTasks.length}</span>
                                    </div>
                                    
                                    {}
                                    {allColTasks.length > ITEMS_PER_PAGE && (
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            <button onClick={() => handlePageChange(status, 'prev')} disabled={currentPage === 0} style={{ background: 'transparent', border: 'none', color: currentPage === 0 ? 'rgba(255,255,255,0.1)' : 'var(--text-mute)', cursor: 'pointer' }}><ChevronLeft size={14}/></button>
                                            <button onClick={() => handlePageChange(status, 'next')} disabled={!hasNext} style={{ background: 'transparent', border: 'none', color: !hasNext ? 'rgba(255,255,255,0.1)' : 'var(--text-mute)', cursor: 'pointer' }}><ChevronRight size={14}/></button>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                    {paginatedTasks.length === 0 ? (
                                        <div style={{ padding: '2rem 1.5rem', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '16px', fontSize: '0.7rem', color: 'var(--text-mute)' }}>
                                            No tasks
                                        </div>
                                    ) : (
                                        paginatedTasks.map((task, j) => (
                                            <div key={j} className="animate-fade task-card-hover" onClick={() => handleTaskClick(task)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '1.25rem', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <span style={{ fontSize: '0.55rem', padding: '3px 8px', borderRadius: '5px', background: `${getCategoryColor(task.category)}20`, color: getCategoryColor(task.category), fontWeight: '800', textTransform: 'uppercase' }}>
                                                        {task.category}
                                                    </span>
                                                    {task.isLate && status === 'Done' && (
                                                        <span style={{ fontSize: '0.55rem', color: '#fb7185', fontWeight: '800' }}>(LATE)</span>
                                                    )}
                                                </div>
                                                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginTop: '0.75rem', color: 'white' }}>{task.title}</h4>
                                                
                                                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: '#0b0e14', display: 'grid', placeItems: 'center', fontSize: '0.65rem', fontWeight: '900' }}>
                                                                {task.category.charAt(0)}
                                                            </div>
                                                            {status === 'Todo' && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); api.put(`/tasks/${task._id}`, { status: 'In Progress' }).then(() => fetchData()); }}
                                                                    style={{ background: 'transparent', border: 'none', color: '#f59e0b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '800' }}
                                                                >
                                                                    <Clock size={14} /> <span>Start</span>
                                                                </button>
                                                            )}
                                                            {status !== 'Done' && (
                                                                <button 
                                                                    onClick={(e) => { e.stopPropagation(); handleMarkDone(task._id); }}
                                                                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '800' }}
                                                                >
                                                                    <CheckCircle2 size={14} /> <span>Done</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                        {status === 'Done' && (
                                                            <div style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: '800' }}>
                                                                Done at {new Date(task.completedAt || task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-mute)', fontSize: '0.65rem', fontWeight: '700' }}>
                                                            <Calendar size={12} />
                                                            <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-mute)', fontSize: '0.65rem', fontWeight: '700' }}>
                                                            <Clock size={12} />
                                                            <span>Target: {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {}
            {isDetailModalOpen && selectedTask && (
                <div className="animate-fade" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'grid', placeItems: 'center', backdropFilter: 'blur(10px)' }}>
                    <div style={{ background: '#0b0e14', borderRadius: '32px', padding: '2.5rem', width: '90%', maxWidth: '550px', border: '1px solid var(--border-light)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--accent)', color: '#0b0e14', display: 'grid', placeItems: 'center' }}>
                                    <Sparkles size={18} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Task Intelligence</h3>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '50%', display: 'grid', placeItems: 'center' }}><X size={20}/></button>
                        </div>
                        
                        <div style={{ marginBottom: '2.5rem' }}>
                            <span style={{ fontSize: '0.65rem', padding: '4px 10px', borderRadius: '6px', background: `${getCategoryColor(selectedTask.category)}20`, color: getCategoryColor(selectedTask.category), fontWeight: '900', textTransform: 'uppercase', marginBottom: '1rem', display: 'inline-block' }}>
                                {selectedTask.category}
                            </span>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'white', marginBottom: '1.5rem', lineHeight: '1.2' }}>{selectedTask.title}</h2>
                            
                            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {selectedTask.description || "No technical description provided for this mission."}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-mute)', display: 'grid', placeItems: 'center' }}>
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.55rem', color: 'var(--text-mute)', textTransform: 'uppercase', fontWeight: '800' }}>Deadline</p>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>{new Date(selectedTask.deadline).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-mute)', display: 'grid', placeItems: 'center' }}>
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.55rem', color: 'var(--text-mute)', textTransform: 'uppercase', fontWeight: '800' }}>Target Time</p>
                                    <p style={{ fontSize: '0.8rem', fontWeight: '700' }}>{new Date(selectedTask.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Dashboard;

