import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';

const DepartmentDashboard = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/complaints/department');
            // Ensure response is array
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

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/complaints/${id}/status`, { status: newStatus });
            fetchComplaints(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className='dashboard-content'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className='section-title' style={{ marginBottom: 0 }}>
                    {user?.department} Department Dashboard
                </h2>
                <div className='badge badge-primary'>
                    Total: {complaints.length}
                </div>
            </div>

            {error && <div className='alert alert-danger'>{error}</div>}

            {(() => {
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
                    width: '200px',
                    height: '200px',
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
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        {/* Left Side: Complaints */}
                        <div style={{ flex: '1 1 60%' }}>
                            {complaints.length === 0 ? (
                                <div className='card' style={{ textAlign: 'center', padding: '3rem' }}>
                                    <p>No active complaints assigned.</p>
                                </div>
                            ) : (
                                <div className='complaints-grid'>
                                    {Array.isArray(complaints) && complaints.map(complaint => (
                                        <ComplaintCard
                                            key={complaint._id || complaint.complaintId}
                                            complaint={complaint}
                                            role='Department'
                                            onStatusUpdate={handleStatusUpdate}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Pie Chart */}
                        <div style={{ flex: '1 1 30%', minWidth: '250px' }}>
                            <div className='card' style={{ padding: '1.5rem', textAlign: 'center', position: 'sticky', top: '20px' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Smart Priority Overview</h3>
                                <div style={pieStyle}></div>

                                <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span><span style={{ color: '#dc3545', fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '5px' }}>■</span> High Priority:</span>
                                        <strong>{highCount}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span><span style={{ color: '#fd7e14', fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '5px' }}>■</span> Medium Priority:</span>
                                        <strong>{mediumCount}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span><span style={{ color: '#198754', fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '5px' }}>■</span> Low Priority:</span>
                                        <strong>{lowCount}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default DepartmentDashboard;
