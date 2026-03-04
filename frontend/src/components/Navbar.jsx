import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className='navbar'>
            <div className='navbar-container'>
                <Link to='/' className='navbar-logo'>
                    <span className='logo-icon'>⚡</span>
                    SmartUtility
                </Link>
                <div className='navbar-menu'>
                    {user ? (
                        <div className='navbar-user'>
                            <span className='user-name'>
                                <UserIcon size={16} />
                                {user.name} ({user.role})
                            </span>
                            <button className='btn btn-outline btn-sm logout-btn' onClick={handleLogout}>
                                <LogOut size={16} /> Logout
                            </button>
                        </div>
                    ) : (
                        <div className='navbar-auth'>
                            <Link to='/login' className='btn btn-outline'>Login</Link>
                            <Link to='/register' className='btn btn-primary'>Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
