import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGuard = ({ element: Component }) => {
    const { isAuthenticated, role } = useAuth();


    if (isAuthenticated) {
        // Redirect based on user role
        switch (role) {
            case 'Admin':
                return <Navigate to="/dashboard/Admin" />;
            case 'SuperAdmin':
                return <Navigate to="/dashboard/Admin" />;
            case 'Founder':
                return <Navigate to="/dashboard/Admin" />;
            case 'HumanResource':
                return <Navigate to="/dashboard/Hr" />;
            case 'Accounts':
                return <Navigate to="/dashboard/Accounts" />;
            case 'Department_Head':
                return <Navigate to="/dashboard/Department_Head" />;
            case 'Employee':
                return <Navigate to="/dashboard/employee" />;
            case 'Social_Media_Manager':
                return <Navigate to="/dashboard/employee" />;
            case 'Task_manager':
                return <Navigate to="/dashboard/employee" />;
            case 'Ex_employee':
                return <Navigate to="/dashboard/Ex_employee" />;
            case 'Unverified':
                return <Navigate to="/newuser/Unverified" />;
            default:
                return <Navigate to="/" />;
        }
    }

    return <Component />;
};
export default AuthGuard;
