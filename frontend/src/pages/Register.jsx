import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Citizen',
        district: '',
        taluk: '',
        department: '',
        officeLocation: '',
        areaCovered: '',
        workDescription: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { user, register } = useContext(AuthContext);
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (formData.role === 'Department') {
                // DO NOT use context register to avoid auto-login
                await api.post('/auth/register', formData);
                navigate('/login', { replace: true });
            } else {
                const newUser = await register(formData);
                if (newUser.role === 'Admin') navigate('/admin-dashboard');
                else navigate('/dashboard'); // STRICT REDIRECT: Citizen goes to Citizen Dashboard directly
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <div className='card auth-card'>
                <div className='auth-header'>
                    <h2>Create Account</h2>
                    <p>Join the community to report issues</p>
                </div>

                {error && <div className='alert alert-danger'>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label className='form-label'>Full Name</label>
                        <input
                            type='text'
                            className='form-control'
                            name='name'
                            placeholder='Enter your name'
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Email Address</label>
                        <input
                            type='email'
                            className='form-control'
                            name='email'
                            placeholder='Enter your email'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Password</label>
                        <input
                            type='password'
                            className='form-control'
                            name='password'
                            placeholder='Create a password'
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength='6'
                        />
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>District</label>
                        <select
                            className='form-control'
                            name='district'
                            value={formData.district}
                            onChange={handleChange}
                            required
                        >
                            <option value=''>Select District</option>
                            <option value='Bengaluru Urban'>Bengaluru Urban</option>
                            <option value='Bengaluru Rural'>Bengaluru Rural</option>
                            <option value='Mysuru'>Mysuru</option>
                            <option value='Hubballi-Dharwad'>Hubballi-Dharwad</option>
                            <option value='Mangaluru'>Mangaluru</option>
                            <option value='Belagavi'>Belagavi</option>
                            <option value='Kalaburagi'>Kalaburagi</option>
                            <option value='Ballari'>Ballari</option>
                        </select>
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Taluk</label>
                        <input
                            type='text'
                            className='form-control'
                            name='taluk'
                            placeholder='Enter your taluk'
                            value={formData.taluk}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Role</label>
                        <select
                            className='form-control'
                            name='role'
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value='Citizen'>Citizen</option>
                            <option value='Department'>Department Official</option>
                        </select>
                    </div>

                    {formData.role === 'Department' && (
                        <div className='form-group slide-down'>
                            <label className='form-label'>Department</label>
                            <select
                                className='form-control'
                                name='department'
                                value={formData.department}
                                onChange={handleChange}
                                required
                            >
                                <option value=''>Select Department</option>
                                <option value='Water'>Water</option>
                                <option value='Electricity'>Electricity</option>
                                <option value='Road'>Road</option>
                                <option value='Sanitation'>Sanitation</option>
                            </select>

                            <label className='form-label' style={{ marginTop: '1rem' }}>Office Location</label>
                            <input
                                type='text'
                                className='form-control'
                                name='officeLocation'
                                placeholder='Enter office location'
                                value={formData.officeLocation}
                                onChange={handleChange}
                                required
                            />

                            <label className='form-label' style={{ marginTop: '1rem' }}>Area Covered</label>
                            <input
                                type='text'
                                className='form-control'
                                name='areaCovered'
                                placeholder='e.g., North Zone, Sector 4'
                                value={formData.areaCovered}
                                onChange={handleChange}
                                required
                            />

                            <label className='form-label' style={{ marginTop: '1rem' }}>Work Description</label>
                            <textarea
                                className='form-control'
                                name='workDescription'
                                placeholder='Briefly describe department responsibilities'
                                value={formData.workDescription}
                                onChange={handleChange}
                                required
                                rows='3'
                            ></textarea>
                        </div>
                    )}

                    <button
                        type='submit'
                        className='btn btn-primary btn-block'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className='auth-footer'>
                    Already have an account? <Link to='/login'>Sign In here</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
