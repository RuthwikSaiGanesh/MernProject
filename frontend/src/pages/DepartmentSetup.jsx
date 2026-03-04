import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

const DepartmentSetup = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        department: user?.department || '',
        taluk: user?.taluk || '',
        officeLocation: user?.departmentInfo?.officeLocation || '',
        areaCovered: user?.departmentInfo?.areaCovered || '',
        workDescription: user?.departmentInfo?.workDescription || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If already setup, maybe redirect? We assume they only come here if missing data, or if they want to edit.
    // Actually, requirement says: After department login: Redirect to /department-setup (only if profile incomplete).

    useEffect(() => {
        if (user?.role !== 'Department') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/setup-department', formData);

            // Update local storage to have the updated user object
            localStorage.setItem('user', JSON.stringify(res.data));

            // Update AuthContext seamlessly and use React Router to navigate
            if (setUser) {
                setUser(res.data);
            }
            navigate('/department-dashboard', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to setup department profile.');
            setLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <div className='card auth-card'>
                <div className='auth-header'>
                    <h2>Department Profile Setup</h2>
                    <p>Please complete your department information to proceed.</p>
                </div>

                {error && <div className='alert alert-danger'>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label className='form-label'>Department Area</label>
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
                        <label className='form-label'>Office Location</label>
                        <input
                            type='text'
                            className='form-control'
                            name='officeLocation'
                            placeholder='e.g., BESCOM Layout Office'
                            value={formData.officeLocation}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Area Covered (Taluk/Ward)</label>
                        <input
                            type='text'
                            className='form-control'
                            name='areaCovered'
                            placeholder='e.g., Ward 150, Bellandur'
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
                            placeholder='Describe roles and responsibilities'
                            value={formData.workDescription}
                            onChange={handleChange}
                            rows='3'
                            required
                        ></textarea>
                    </div>

                    <button
                        type='submit'
                        className='btn btn-primary btn-block'
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DepartmentSetup;
