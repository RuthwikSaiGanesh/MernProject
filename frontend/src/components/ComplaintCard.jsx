import { MapPin, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ComplaintCard.css';

const ComplaintCard = ({ complaint, onStatusUpdate, role }) => {
    const navigate = useNavigate();

    // Defensive: bail out if complaint data is invalid
    if (!complaint || !complaint.complaintId) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Finished': return <CheckCircle size={18} className='status-resolved' />;
            case 'In Progress': return <Clock size={18} className='status-progress' />;
            case 'Reached':
            default: return <AlertCircle size={18} className='status-pending' />;
        }
    };

    const getPriorityColor = (priority) => {
        if (priority === 'High') return '#dc3545';
        if (priority === 'Medium') return '#fd7e14';
        if (priority === 'Low') return '#198754';
        return '#6c757d';
    };

    const API_URI = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const imageUrl = complaint.image ? `${API_URI}${complaint.image}` : null;

    const handleCardClick = () => {
        navigate(`/complaint/${complaint.complaintId}`);
    };

    return (
        <div className='complaint-card' onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className='complaint-header'>
                <div className='complaint-title-group'>
                    <span className='complaint-id'>{complaint.complaintId}</span>
                    <h3 className='complaint-title'>{complaint.title || 'Untitled Complaint'}</h3>
                </div>
                <div className={`complaint-badge badge-${(complaint.department || 'water').toLowerCase()}`}>
                    {complaint.department || 'N/A'}
                </div>
            </div>

            <p className='complaint-desc'>{complaint.description || 'No description provided.'}</p>

            {imageUrl && (
                <div className='complaint-image-container'>
                    <img src={imageUrl} alt='Complaint evidence' className='complaint-image' />
                </div>
            )}

            <div className='complaint-footer'>
                <div className='complaint-meta'>
                    <span className='meta-item'>
                        <Calendar size={16} />
                        {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className='meta-item'>
                        <MapPin size={16} />
                        {complaint.location?.district || 'N/A'}
                    </span>
                    {complaint.priority && (
                        <span className='meta-item' style={{
                            backgroundColor: getPriorityColor(complaint.priority),
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            display: 'inline-block',
                            marginLeft: '5px'
                        }}>
                            Priority: {complaint.priority}
                        </span>
                    )}
                </div>

                <div className='complaint-actions'>
                    <div className='status-display'>
                        {getStatusIcon(complaint.status)}
                        <span className={`status-text text-${(complaint.status || 'reached').replace(/ /g, '-').toLowerCase()}`}>
                            {complaint.status || 'Reached'}
                        </span>
                    </div>

                    {(role === 'Department' || role === 'Admin') && onStatusUpdate && (
                        <select
                            className='form-control status-select'
                            value={complaint.status || 'Reached'}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                                e.stopPropagation();
                                onStatusUpdate(complaint._id, e.target.value);
                            }}
                        >
                            <option value='Reached'>Reached</option>
                            <option value='In Progress'>In Progress</option>
                            <option value='Finished'>Finished</option>
                        </select>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComplaintCard;
