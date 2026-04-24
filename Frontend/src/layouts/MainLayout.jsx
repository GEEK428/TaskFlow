import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import FlowAI from '../components/FlowAI';

const MainLayout = ({ children }) => {
    return (
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <Topbar />
                {children}
            </main>
            <FlowAI />
        </div>
    );
};

export default MainLayout;
