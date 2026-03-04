import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';
import { MapPin, Calendar, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import './Complaints.css';

const ComplaintDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [responseMsg, setResponseMsg] = useState('');
    const [statusUpdate, setStatusUpdate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchComplaint();
    }, [id]);

    const fetchComplaint = async () => {
        try {
            const res = await api.get(`/complaints/track/${id}`);
            setComplaint(res.data);
            setStatusUpdate(res.data.status);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load complaint');
        } finally {
            setLoading(false);
        }
    };

    const handleResponseSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // Need the MongoDB object _id for updating, which comes from track endpoint but let's ensure it's there
            // Track pulls by complaintId parameter. Let's make sure it's the _id format inside the backend or update backend to use _id
            // The track view gets it by UUID. The add response takes the Mongo _id.
            await api.post(`/complaints/${complaint._id}/responses`, {
                message: responseMsg,
                status: statusUpdate
            });
            setResponseMsg('');
            fetchComplaint(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to add response');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loader />;
    if (error) return <div className='alert alert-danger' style={{ margin: '2rem auto', maxWidth: '800px' }}>{error}</div>;
    if (!complaint) return <div className='alert alert-danger' style={{ margin: '2rem auto', maxWidth: '800px' }}>Complaint data not available.</div>;

    const API_URI = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const imageUrl = complaint.image ? `${API_URI}${complaint.image}` : null;

    const isDepartmentOrAdmin = user?.role === 'Department' || user?.role === 'Admin';

    return (
        <div className='track-container' style={{ marginTop: '2rem' }}>
            <button className='btn btn-outline' onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
                &larr; Back
            </button>

            <div className='card' style={{ marginBottom: '2rem' }}>
                <div className='complaint-header' style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <div>
                        <span className='complaint-id'>{complaint.complaintId}</span>
                        <h2 style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>{complaint.title}</h2>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className={`complaint-badge badge-${(complaint.department || 'water').toLowerCase()}`}>{complaint.department || 'N/A'}</span>
                            <span className={`badge`} style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>
                                Priority: {complaint.priority}
                            </span>
                            {complaint.isAnonymous && <span className='badge' style={{ background: '#fee2e2', color: '#ef4444', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>Anonymous Reporter</span>}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className={`status-text text-${(complaint.status || 'reached').replace(/ /g, '-').toLowerCase()}`} style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
                            {complaint.status}
                        </span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '1.5rem' }}>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Description</h4>
                        <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{complaint.description}</p>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase' }}>Location Details</h4>
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem' }}>
                            <span><strong>Address:</strong> {complaint.location?.address || 'N/A'}</span>
                            {complaint.location?.village && <span><strong>Village/Area:</strong> {complaint.location.village}</span>}
                            <span><strong>Taluk:</strong> {complaint.location?.taluk || 'N/A'}</span>
                            <span><strong>District:</strong> {complaint.location?.district || 'N/A'}</span>
                            <span><strong>Pincode:</strong> {complaint.location?.pincode || 'N/A'}</span>
                            {(complaint.location.lat && complaint.location.lng) && (
                                <span style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                                    <MapPin size={16} /> {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {imageUrl && (
                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Attached Evidence</h4>
                        <img src={imageUrl} alt='Evidence' style={{ maxWidth: '100%', borderRadius: '0.5rem', maxHeight: '400px', objectFit: 'cover' }} />
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={16} /> {new Date(complaint.createdAt).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={16} /> {new Date(complaint.createdAt).toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Responses Section */}
            <div className='card' style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <MessageSquare size={20} /> Official Responses
                </h3>

                {complaint.responses && complaint.responses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {complaint.responses.map((resp, idx) => (
                            <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', borderLeft: '4px solid var(--primary-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong style={{ color: 'var(--text-main)' }}>{resp.updatedBy}</strong>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(resp.date).toLocaleString()}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.875rem' }}>{resp.message}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className='text-muted' style={{ fontStyle: 'italic' }}>No official responses yet.</p>
                )}

                {/* Reply Form for Department/Admin */}
                {isDepartmentOrAdmin && (
                    <form onSubmit={handleResponseSubmit} style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Add a Response</h4>

                        <div className='form-group'>
                            <label className='form-label'>Status Update (Optional)</label>
                            <select
                                className='form-control'
                                value={statusUpdate}
                                onChange={(e) => setStatusUpdate(e.target.value)}
                                style={{ maxWidth: '200px' }}
                            >
                                <option value='Reached'>Reached</option>
                                <option value='In Progress'>In Progress</option>
                                <option value='Finished'>Finished</option>
                            </select>
                        </div>

                        <div className='form-group'>
                            <textarea
                                className='form-control'
                                rows='3'
                                placeholder='Type your official response here...'
                                value={responseMsg}
                                onChange={(e) => setResponseMsg(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        <button type='submit' className='btn btn-primary' disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Post Response'}
                        </button>
                    </form>
                )}
            </div>

        </div>
    );
};

export default ComplaintDetail;
