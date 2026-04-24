import React from 'react';
import { LayoutDashboard, CheckSquare, Settings, LogOut, Search, Plus } from 'lucide-react';
import './LoadingSkeleton.css';

/**
 * LoadingSkeleton Component
 * Mirrors the Dashboard layout with animated shimmer placeholders.
 */
const LoadingSkeleton = () => {
    return (
        <div className="dashboard-layout skeleton-layout">
            {}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-box skeleton"></div>
                    <div className="brand-info">
                        <div className="skeleton" style={{width: '80px', height: '18px'}}></div>
                    </div>
                </div>
                <div className="sidebar-nav">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="nav-item">
                            <div className="skeleton circle" style={{width: '20px', height: '20px'}}></div>
                            <div className="skeleton" style={{width: '100px', height: '14px'}}></div>
                        </div>
                    ))}
                </div>
                <div className="sidebar-footer">
                    <div className="user-block-skeleton">
                        <div className="skeleton circle" style={{width: '34px', height: '34px'}}></div>
                        <div className="user-info-skeleton">
                            <div className="skeleton" style={{width: '80px', height: '12px', marginBottom: '4px'}}></div>
                            <div className="skeleton" style={{width: '120px', height: '10px'}}></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="main-content">
                <header className="top-bar">
                    <div className="header-left">
                        <div className="skeleton" style={{width: '140px', height: '24px', marginBottom: '8px'}}></div>
                        <div className="skeleton" style={{width: '90px', height: '14px'}}></div>
                    </div>
                    <div className="top-bar-actions">
                        <div className="skeleton" style={{width: '220px', height: '36px', borderRadius: '6px'}}></div>
                        <div className="skeleton" style={{width: '110px', height: '36px', borderRadius: '6px'}}></div>
                    </div>
                </header>

                <div className="content-inner">
                    {/* Stats Row Skeleton */}
                    <div className="stats-grid">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="stat-card">
                                <div className="skeleton" style={{width: '50px', height: '12px', marginBottom: '12px', opacity: 0.5}}></div>
                                <div className="skeleton" style={{width: '80px', height: '28px'}}></div>
                            </div>
                        ))}
                    </div>

                    {/* Kanban Board Skeleton */}
                    <div className="kanban-board">
                        {[1, 2, 3].map(col => (
                            <div key={col} className="kanban-column">
                                <div className="column-header">
                                    <div className="skeleton" style={{width: '120px', height: '18px'}}></div>
                                </div>
                                <div className="task-list">
                                    {[1, 2].map(task => (
                                        <div key={task} className="task-card-skeleton">
                                            <div className="skeleton" style={{width: '100%', height: '14px', marginBottom: '12px'}}></div>
                                            <div className="skeleton" style={{width: '80%', height: '10px', marginBottom: '20px', opacity: 0.6}}></div>
                                            <div className="card-footer-skeleton">
                                                <div className="skeleton" style={{width: '60px', height: '18px', borderRadius: '12px'}}></div>
                                                <div className="skeleton" style={{width: '50px', height: '12px'}}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LoadingSkeleton;
