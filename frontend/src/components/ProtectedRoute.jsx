import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles, requireSetup = true }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <Loader />;

    if (!user) {
        return <Navigate to='/login' replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Strict deterministic routing: send them to their designated areas 
        if (user.role === 'Admin') return <Navigate to='/admin-dashboard' replace />;
        if (user.role === 'Department') {
            if (!user.departmentInfo || !user.departmentInfo.officeLocation) {
                return <Navigate to='/department-setup' replace />;
            }
            return <Navigate to='/department-dashboard' replace />;
        }
        return <Navigate to='/dashboard' replace />;
    }

    // STRICT: Force Department users to complete setup
    if (user.role === 'Department' && requireSetup) {
        if (!user.departmentInfo || !user.departmentInfo.officeLocation) {
            return <Navigate to='/department-setup' replace />;
        }
    }

    // STRICT: Prevent Department users from staying on setup page if already complete
    if (user.role === 'Department' && !requireSetup) {
        if (user.departmentInfo && user.departmentInfo.officeLocation) {
            return <Navigate to='/department-dashboard' replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
