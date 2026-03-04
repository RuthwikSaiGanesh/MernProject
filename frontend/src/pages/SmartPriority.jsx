import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';

const SmartPriority = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recalculating, setRecalculating] = useState(false);
    const { user } = useContext(AuthContext);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/department');
            setComplaints(res.data && Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/login');
            } else if (err.response?.status === 403) {
                navigate('/department-setup');
            } else {
                setError(err.response?.data?.message || 'Failed to load complaints');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [navigate]);

    // Trigger Level 3 recalculation
    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            const res = await api.post('/complaints/recalculate-priority');
            alert(`${res.data.message}. ${res.data.updated} complaint(s) updated.`);
            // Refresh complaints to reflect new priorities
            await fetchComplaints();
        } catch (err) {
            alert(err.response?.data?.message || 'Recalculation failed');
        } finally {
            setRecalculating(false);
        }
    };

    if (loading) return <Loader />;

    const highCount = complaints.filter(c => c.priority === 'High').length;
    const mediumCount = complaints.filter(c => c.priority === 'Medium').length;
    const lowCount = complaints.filter(c => c.priority === 'Low').length;
    const totalCount = complaints.length;

    let highPct = 0, mediumPct = 0, lowPct = 0;
    if (totalCount > 0) {
        highPct = (highCount / totalCount) * 100;
        mediumPct = (mediumCount / totalCount) * 100;
        lowPct = (lowCount / totalCount) * 100;
    }

    const pieStyle = {
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: totalCount > 0
            ? `conic-gradient(
                #dc3545 0% ${highPct}%,
                #fd7e14 ${highPct}% ${highPct + mediumPct}%,
                #198754 ${highPct + mediumPct}% 100%
            )`
            : '#e9ecef',
        margin: '0 auto'
    };

    return (
        <div className='dashboard-content'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className='section-title' style={{ marginBottom: 0 }}>Smart Priority Overview — Level 3</h2>
                <button
                    className='btn btn-primary'
                    onClick={handleRecalculate}
                    disabled={recalculating}
                    style={{ padding: '0.6rem 1.2rem' }}
                >
                    {recalculating ? 'Recalculating...' : '🔄 Recalculate Priorities'}
                </button>
            </div>

            {error && <div className='alert alert-danger'>{error}</div>}

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                    <div className='card' style={{ padding: '2rem', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '2rem' }}>Priority Distribution</h3>
                        <div style={pieStyle}></div>
                        <div style={{ marginTop: '2rem' }}>
                            <h4>Total Active: {totalCount}</h4>
                        </div>
                    </div>
                </div>

                <div style={{ flex: '1 1 45%', minWidth: '300px' }}>
                    <div className='card' style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Active Complaints Count</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                            <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderBottom: '5px solid #dc3545' }}>
                                <h4 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>High</h4>
                                <h2>{highCount}</h2>
                            </div>
                            <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderBottom: '5px solid #fd7e14' }}>
                                <h4 style={{ color: '#fd7e14', marginBottom: '0.5rem' }}>Medium</h4>
                                <h2>{mediumCount}</h2>
                            </div>
                            <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', borderBottom: '5px solid #198754' }}>
                                <h4 style={{ color: '#198754', marginBottom: '0.5rem' }}>Low</h4>
                                <h2>{lowCount}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartPriority;
