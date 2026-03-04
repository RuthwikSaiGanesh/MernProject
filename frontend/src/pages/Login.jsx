import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    // STRICT REDIRECTION: If already logged in, redirect immediately based on role
    useEffect(() => {
        if (user) {
            if (user.role === 'Admin') navigate('/admin-dashboard', { replace: true });
            else if (user.role === 'Department') {
                if (!user.departmentInfo || !user.departmentInfo.officeLocation) {
                    navigate('/department-setup', { replace: true });
                } else {
                    navigate('/department-dashboard', { replace: true });
                }
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const user = await login(email, password);
            if (user.role === 'Admin') navigate('/admin-dashboard');
            else if (user.role === 'Department') {
                // Check if profile is setup
                if (!user.departmentInfo || !user.departmentInfo.officeLocation) {
                    navigate('/department-setup');
                } else {
                    navigate('/department-dashboard');
                }
            }
            else navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <div className='card auth-card'>
                <div className='auth-header'>
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your dashboard</p>
                </div>

                {error && <div className='alert alert-danger'>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label className='form-label'>Email Address</label>
                        <input
                            type='email'
                            className='form-control'
                            placeholder='Enter your email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Password</label>
                        <input
                            type='password'
                            className='form-control'
                            placeholder='Enter password'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type='submit'
                        className='btn btn-primary btn-block'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div className='auth-footer'>
                    Don't have an account? <Link to='/register'>Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
