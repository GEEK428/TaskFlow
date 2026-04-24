/**
 * PrivateRoute Component
 * A wrapper component that redirects unauthenticated users to the login page.
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ color: 'white', padding: '20px' }}>Loading TaskFlow...</div>;
    }

    return user ? (
        <>
            <Outlet />
        </>
    ) : <Navigate to="/login" replace />;
};

export default PrivateRoute;
