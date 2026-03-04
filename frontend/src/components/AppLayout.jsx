import { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../context/AuthContext';
import Loader from './Loader';

const AppLayout = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <Loader />;

    if (!user) {
        return <Navigate to='/login' />;
    }

    return (
        <div className='dashboard-layout'>
            <Sidebar role={user.role} />
            <div className='dashboard-content'>
                <Outlet />
            </div>
        </div>
    );
};

export default AppLayout;
