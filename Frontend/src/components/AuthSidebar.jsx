import React from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import './AuthSidebar.css';

/**
 * AuthSidebar Component - Refined Compact Style
 * Larger brand name, smaller secondary text, and relevant copy.
 */
const AuthSidebar = () => {
    return (
        <div className="auth-sidebar-pane">
            <div className="sidebar-brand-top">
                <div className="brand-logo-pill">
                    <Zap size={22} color="#fff" fill="#fff" />
                </div>
                <span className="brand-name-xl">TaskFlow</span>
            </div>

            <div className="sidebar-hero-section">
                <div className="hero-tagline-sm">THE ULTIMATE TRACKER</div>
                <h1 className="hero-compact-title">
                    Enhance <br />
                    <span className="highlight">Self Productivity</span>
                </h1>
                <p className="hero-description-sm">
                    This app helps you track your daily activities, 
                    manage your schedule, and stay on top of your goals.
                </p>
            </div>

            <div className="feature-card-compact glass-panel">
                <div className="feat-icon-sm">
                    <Zap size={16} color="var(--accent)" />
                </div>
                <div className="feat-text-sm">
                    <h4>Activity Engine</h4>
                    <p>Log your progress and visualize your growth effortlessly.</p>
                </div>
            </div>
        </div>
    );
};

export default AuthSidebar;
