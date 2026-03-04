import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Calendar, MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import './Complaints.css';

const TrackComplaint = () => {
    const [complaintId, setComplaintId] = useState('');
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const urlLocation = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(urlLocation.search);
        const id = queryParams.get('id');
        if (id) {
            setComplaintId(id);
            searchComplaint(id);
        }
    }, [urlLocation]);

    const searchComplaint = async (idToSearch) => {
        if (!idToSearch) return;

        setLoading(true);
        setError('');
        setComplaint(null);

        try {
            const res = await api.get(`/complaints/track/${idToSearch}`);
            setComplaint(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Complaint not found. Please check the ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        searchComplaint(complaintId);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Finished': return <CheckCircle size={20} style={{ color: '#198754' }} />;
            case 'In Progress': return <Clock size={20} style={{ color: '#fd7e14' }} />;
            case 'Reached':
            default: return <AlertCircle size={20} style={{ color: '#3b82f6' }} />;
        }
    };

    const getPriorityColor = (priority) => {
        if (priority === 'High') return '#dc3545';
        if (priority === 'Medium') return '#fd7e14';
        if (priority === 'Low') return '#198754';
        return '#6c757d';
    };

    return (
        <div className='track-container'>
            <div className='card search-card'>
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Track Complaint Status</h2>

                <form className='search-form' onSubmit={handleSubmit}>
                    <div className='search-input-group'>
                        <input
                            type='text'
                            className='form-control search-input'
                            placeholder='Enter your Complaint ID (e.g. CMP-A1B2C3D4)'
                            value={complaintId}
                            onChange={(e) => setComplaintId(e.target.value)}
                            required
                        />
                        <button type='submit' className='btn btn-primary search-btn' disabled={loading}>
                            <Search size={20} />
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </div>
                </form>
            </div>

            <div className='track-result'>
                {error && <div className='alert alert-danger'>{error}</div>}

                {complaint && (
                    <div className='card' style={{ marginTop: '1.5rem', padding: '2rem' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', color: '#6c757d', fontFamily: 'monospace' }}>{complaint.complaintId}</span>
                                <h3 style={{ margin: '0.5rem 0' }}>{complaint.title || 'Untitled'}</h3>
                                <span className={`complaint-badge badge-${(complaint.department || 'water').toLowerCase()}`} style={{ display: 'inline-block' }}>
                                    {complaint.department || 'N/A'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {getStatusIcon(complaint.status)}
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{complaint.status || 'Reached'}</span>
                            </div>
                        </div>

                        {/* Details grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <strong style={{ color: '#6c757d', fontSize: '0.8rem', textTransform: 'uppercase' }}>Priority</strong>
                                <div style={{ marginTop: '0.25rem' }}>
                                    <span style={{
                                        backgroundColor: getPriorityColor(complaint.priority),
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem'
                                    }}>
                                        {complaint.priority || 'Low'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <strong style={{ color: '#6c757d', fontSize: '0.8rem', textTransform: 'uppercase' }}>Department</strong>
                                <p style={{ marginTop: '0.25rem', fontWeight: '500' }}>{complaint.department || 'N/A'}</p>
                            </div>
                            <div>
                                <strong style={{ color: '#6c757d', fontSize: '0.8rem', textTransform: 'uppercase' }}>Submitted On</strong>
                                <p style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Calendar size={14} /> {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <div>
                                <strong style={{ color: '#6c757d', fontSize: '0.8rem', textTransform: 'uppercase' }}>Location</strong>
                                <p style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={14} /> {complaint.location?.district || 'N/A'}{complaint.location?.taluk ? `, ${complaint.location.taluk}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                            <strong style={{ color: '#6c757d', fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</strong>
                            <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{complaint.description || 'No description.'}</p>
                        </div>

                        {/* View Full Details link */}
                        <button
                            className='btn btn-primary'
                            onClick={() => navigate(`/complaint/${complaint.complaintId}`)}
                            style={{ marginTop: '0.5rem' }}
                        >
                            View Full Details →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackComplaint;
