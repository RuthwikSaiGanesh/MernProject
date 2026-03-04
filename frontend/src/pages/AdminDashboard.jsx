import { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import Loader from '../components/Loader';

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await api.get('/admin/complaints');
            setComplaints(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load complaints');
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

    const filteredComplaints = filter === 'All'
        ? complaints
        : complaints.filter(c => c.department === filter);

    if (loading) return <Loader />;

    return (
        <div className='dashboard-content'>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h2 className='section-title' style={{ marginBottom: 0 }}>System Overview</h2>

                <select
                    className='form-control'
                    style={{ width: 'auto' }}
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value='All'>All Departments</option>
                    <option value='Water'>Water</option>
                    <option value='Electricity'>Electricity</option>
                    <option value='Road'>Road</option>
                    <option value='Sanitation'>Sanitation</option>
                </select>
            </div>

            {error && <div className='alert alert-danger'>{error}</div>}

            <div className='complaints-grid'>
                {filteredComplaints.map(complaint => (
                    <ComplaintCard
                        key={complaint._id}
                        complaint={complaint}
                        role='Admin'
                        onStatusUpdate={handleStatusUpdate}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
