import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await api.get('/departments');
                // Ensure response is an array
                setDepartments(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load departments');
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);

    if (loading) return <Loader />;

    // Split departments by proximity (set by backend)
    const localDepts = departments.filter(d => d.proximity === 'local' || d.proximity === 'district');
    const otherDepts = departments.filter(d => d.proximity === 'other');

    // Render a department card
    const renderDeptCard = (dept) => (
        <div key={dept._id} className='card' style={{ marginBottom: '1rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{dept.name || 'Unnamed Department'}</h3>
                <div className={`badge badge-${(dept.department || '').toLowerCase()}`}>
                    {dept.department || 'N/A'}
                </div>
            </div>
            <p style={{ marginTop: '0.5rem', color: '#6c757d', fontSize: '0.9rem' }}>
                <strong>District:</strong> {dept.district || 'N/A'} &nbsp;|&nbsp;
                <strong>Taluk:</strong> {dept.taluk || 'N/A'}
            </p>
            <p style={{ marginTop: '0.5rem' }}><strong>Office Location:</strong> {dept.departmentInfo?.officeLocation || 'N/A'}</p>
            <p><strong>Area Covered:</strong> {dept.departmentInfo?.areaCovered || 'N/A'}</p>
            <p><strong>Description:</strong> {dept.departmentInfo?.workDescription || 'N/A'}</p>
        </div>
    );

    return (
        <div className='dashboard-content'>
            {error && <div className='alert alert-danger'>{error}</div>}

            {/* Section 1: Departments in Your Area */}
            <h2 className='section-title'>Departments in Your Area</h2>
            {localDepts.length === 0 ? (
                <div className='card' style={{ textAlign: 'center', padding: '2rem', marginBottom: '2rem' }}>
                    <p>No departments found in your district ({user?.district || 'unknown'}) yet.</p>
                </div>
            ) : (
                <div className='complaints-grid' style={{ marginBottom: '2rem' }}>
                    {localDepts.map(renderDeptCard)}
                </div>
            )}

            {/* Section 2: Other Departments */}
            <h2 className='section-title'>Other Departments</h2>
            {otherDepts.length === 0 ? (
                <div className='card' style={{ textAlign: 'center', padding: '2rem' }}>
                    <p>No other departments found.</p>
                </div>
            ) : (
                <div className='complaints-grid'>
                    {otherDepts.map(renderDeptCard)}
                </div>
            )}
        </div>
    );
};

export default Departments;
