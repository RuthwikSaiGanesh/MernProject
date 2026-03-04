import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, UserCircle, Settings, Users, Grid, Building, PieChart, Search } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ role }) => {
    const location = useLocation();

    const menuItems = {
        Admin: [
            { name: 'Dashboard', path: '/admin-dashboard', icon: <Grid size={20} /> },
            { name: 'Users', path: '/admin-users', icon: <Users size={20} /> },
        ],
        Department: [
            { name: 'Dashboard', path: '/department-dashboard', icon: <Grid size={20} /> },
            { name: 'Smart Priority', path: '/department-priority', icon: <PieChart size={20} /> },
            { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
        ],
        Citizen: [
            { name: 'Dashboard', path: '/dashboard', icon: <Grid size={20} /> },
            { name: 'Submit Complaint', path: '/submit-complaint', icon: <FileText size={20} /> },
            { name: 'Track Status', path: '/track-complaint', icon: <Search size={20} /> },
            { name: 'Departments', path: '/departments', icon: <Building size={20} /> },
            { name: 'Profile', path: '/profile', icon: <UserCircle size={20} /> },
        ]
    };

    const links = menuItems[role] || menuItems['Citizen'];

    return (
        <aside className='sidebar'>
            <div className='sidebar-menu'>
                <p className='sidebar-title'>Navigation</p>
                <ul className='sidebar-list'>
                    {links.map((link, index) => (
                        <li key={index}>
                            <Link
                                to={link.path}
                                className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
