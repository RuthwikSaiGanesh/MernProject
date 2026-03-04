import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';

const CitizenDashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Wait for auth to finish before fetching
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchComplaints = async () => {
            try {
                const res = await api.get('/complaints/my');
                // Defensive: ensure array
                setComplaints(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login');
                    return;
                }
                setError(err.response?.data?.message || 'Failed to load complaints');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, [navigate, user, authLoading]);

    if (authLoading || loading) return <Loader />;

    return (
        <div className='dashboard-content'>
            <h2 className='section-title'>
                {user ? `Welcome, ${user.name}` : 'My Dashboard'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {user?.district && user?.taluk
                    ? `${user.taluk}, ${user.district}`
                    : 'Your submitted complaints appear here.'}
            </p>

            {error && <div className='alert alert-danger'>{error}</div>}

            {!error && complaints.length === 0 ? (
                <div className='card' style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>
                        You have not submitted any complaints yet.
                    </p>
                    <button
                        className='btn btn-primary'
                        style={{ marginTop: '1rem' }}
                        onClick={() => navigate('/submit-complaint')}
                    >
                        Submit a Complaint
                    </button>
                </div>
            ) : (
                <div className='complaints-grid'>
                    {Array.isArray(complaints) && complaints.map(complaint => (
                        <ComplaintCard
                            key={complaint._id || complaint.complaintId}
                            complaint={complaint}
                            role='Citizen'
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CitizenDashboard;
