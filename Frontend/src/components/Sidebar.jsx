import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, Settings, LogOut, Zap, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <>
            {/* Mobile Header / Hamburger Toggle */}
            <div className="mobile-sidebar-header" style={{ display: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="logo-lightning" style={{ width: '32px', height: '32px' }}>
                        <Zap size={16} fill="currentColor" />
                    </div>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: '800' }}>TaskFlow</h1>
                </div>
                <button onClick={toggleMenu} className="menu-toggle-btn" style={{ color: '#97A6FF' }}>
                    {isOpen ? <X size={24} color="#97A6FF" /> : <Menu size={24} color="#97A6FF" />}
                </button>
            </div>

            <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-logo desktop-only-logo">
                    <div className="logo-lightning">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div className="logo-text">
                        <h1>TaskFlow</h1>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/leaderboard" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Trophy size={18} />
                        <span>Leaderboard</span>
                    </NavLink>
                    <NavLink to="/settings" onClick={() => setIsOpen(false)} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={18} />
                        <span>Settings</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={logout} className="logout-btn">
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile drawer */}
            {isOpen && <div className="mobile-overlay-dim" onClick={toggleMenu} />}
        </>
    );
};

export default Sidebar;
