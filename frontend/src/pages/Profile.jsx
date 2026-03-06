import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';

const Profile = () => {
    const { user, updateUser, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        district: '',
        taluk: '',
        department: '',
        officeLocation: '',
        areaCovered: '',
        workDescription: '',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    // Populate form when user data is available
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                district: user.district || '',
                taluk: user.taluk || '',
                department: user.department || '',
                officeLocation: user.departmentInfo?.officeLocation || '',
                areaCovered: user.departmentInfo?.areaCovered || '',
                workDescription: user.departmentInfo?.workDescription || '',
            });
        }
    }, [user]);

    // Auto-dismiss success message after 3 seconds
    useEffect(() => {
        if (message.type === 'success') {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await updateUser(formData);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    // Show loader while auth is loading
    if (authLoading) return <Loader />;

    // Defensive: don't render if no user
    if (!user) return null;

    return (
        <div className='dashboard-content'>
            <div className='card' style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>My Profile</h2>
                <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    Role: <span style={{
                        display: 'inline-block',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        backgroundColor: user.role === 'Department' ? '#dbeafe' : '#dcfce7',
                        color: user.role === 'Department' ? '#1e3a8a' : '#166534',
                    }}>{user.role}</span>
                </p>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label className='form-label'>Full Name</label>
                        <input
                            type='text'
                            className='form-control'
                            name='name'
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
                            value={formData.email}
                            onChange={handleChange}
                            required
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
                            value={formData.taluk}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {user.role === 'Department' && (
                        <>
                            <div className='form-group'>
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
                            </div>

                            <div className='form-group'>
                                <label className='form-label'>Office Location</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='officeLocation'
                                    value={formData.officeLocation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className='form-group'>
                                <label className='form-label'>Area Covered</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='areaCovered'
                                    value={formData.areaCovered}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className='form-group'>
                                <label className='form-label'>Work Description</label>
                                <textarea
                                    className='form-control'
                                    name='workDescription'
                                    value={formData.workDescription}
                                    onChange={handleChange}
                                    required
                                    rows='3'
                                ></textarea>
                            </div>
                        </>
                    )}

                    <button
                        type='submit'
                        className='btn btn-primary btn-block'
                        disabled={isSaving}
                        style={{ padding: '0.8rem', fontSize: '1rem', marginTop: '1.5rem', width: '100%' }}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
