import { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { MapPin, UploadCloud, CheckCircle } from 'lucide-react';
import './Complaints.css';

const SubmitComplaint = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        department: '',
        category: 'General',
        isAnonymous: false,
        address: '',
        village: '',
        taluk: '',
        district: 'Bengaluru Urban',
        pincode: '',
        lat: '',
        lng: ''
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [gettingLocation, setGettingLocation] = useState(false);

    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const getLocation = () => {
        setGettingLocation(true);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setGettingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData({
                    ...formData,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setGettingLocation(false);
            },
            () => {
                setError('Unable to retrieve your location. Please enter manually.');
                setGettingLocation(false);
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.address || !formData.taluk || !formData.district || !formData.pincode) {
            setError('Please provide all required address fields.');
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('department', formData.department);
        data.append('address', formData.address);
        data.append('village', formData.village);
        data.append('taluk', formData.taluk);
        data.append('district', formData.district);
        data.append('pincode', formData.pincode);
        if (formData.lat) data.append('lat', formData.lat);
        if (formData.lng) data.append('lng', formData.lng);
        data.append('isAnonymous', formData.isAnonymous);
        data.append('category', formData.category);

        if (image) {
            data.append('image', image);
        }

        try {
            const res = await api.post('/complaints', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSuccess(`Success! Your Complaint ID is: ${res.data.complaintId}`);

            // Auto redirect to dashboard after 3 seconds
            setTimeout(() => {
                if (user) {
                    navigate('/dashboard');
                } else {
                    navigate(`/track-complaint?id=${res.data.complaintId}`);
                }
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit complaint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='complaint-form-container'>
            <div className='card'>
                <h2>Submit a Complaint</h2>
                <p className='text-muted' style={{ marginBottom: '2rem' }}>
                    Report an issue to the relevant public utility department.
                </p>

                {error && <div className='alert alert-danger'>{error}</div>}
                {success && <div className='alert alert-success'><CheckCircle size={18} /> {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label className='form-label'>Complaint Title</label>
                        <input
                            type='text'
                            className='form-control'
                            name='title'
                            placeholder='Brief title of the issue (e.g., Pothole on Main St)'
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='form-group'>
                        <label className='form-label'>Description</label>
                        <textarea
                            className='form-control'
                            name='description'
                            rows='4'
                            placeholder='Provide details about the issue...'
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className='form-row'>
                        <div className='form-group half-width'>
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

                        <div className='form-group half-width'>
                            <label className='form-label'>Category (Severity)</label>
                            <select
                                className='form-control'
                                name='category'
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value='General'>General</option>
                                <option value='Critical'>Critical (Urgent)</option>
                            </select>
                        </div>
                    </div>

                    <div className='form-row'>
                        <div className='form-group half-width upload-group'>
                            <label className='form-label'>Upload Evidence (Image)</label>
                            <input
                                type='file'
                                accept='image/*'
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                            <button
                                type='button'
                                className='btn btn-outline upload-btn'
                                onClick={() => fileInputRef.current.click()}
                            >
                                <UploadCloud size={18} /> Choose Image
                            </button>
                            {image && <span className='file-name'>{image.name}</span>}
                        </div>
                    </div>

                    {preview && (
                        <div className='image-preview'>
                            <img src={preview} alt='Preview' />
                        </div>
                    )}

                    <div className='location-section'>
                        <h4 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem' }}>Location Details</h4>

                        <div className='form-group'>
                            <label className='form-label'>Building / Street Address</label>
                            <input type='text' className='form-control' name='address' placeholder='e.g., 123 Main St' value={formData.address} onChange={handleChange} required />
                        </div>

                        <div className='form-row'>
                            <div className='form-group half-width'>
                                <label className='form-label'>Village / Area (Optional)</label>
                                <input type='text' className='form-control' name='village' placeholder='e.g., Bellandur' value={formData.village} onChange={handleChange} />
                            </div>
                            <div className='form-group half-width'>
                                <label className='form-label'>Taluk</label>
                                <input type='text' className='form-control' name='taluk' placeholder='e.g., Bengaluru South' value={formData.taluk} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className='form-row'>
                            <div className='form-group half-width'>
                                <label className='form-label'>District (Karnataka)</label>
                                <select className='form-control' name='district' value={formData.district} onChange={handleChange} required>
                                    <option value='Bengaluru Urban'>Bengaluru Urban</option>
                                    <option value='Bengaluru Rural'>Bengaluru Rural</option>
                                    <option value='Mysuru'>Mysuru</option>
                                    <option value='Mangaluru'>Mangaluru</option>
                                    <option value='Hubballi-Dharwad'>Hubballi-Dharwad</option>
                                    <option value='Belagavi'>Belagavi</option>
                                    <option value='Kalaburagi'>Kalaburagi</option>
                                    <option value='Other'>Other</option>
                                </select>
                            </div>
                            <div className='form-group half-width'>
                                <label className='form-label'>Pincode</label>
                                <input type='text' className='form-control' name='pincode' placeholder='e.g., 560103' value={formData.pincode} onChange={handleChange} required />
                            </div>
                        </div>

                        <label className='form-label' style={{ marginTop: '1rem' }}>Map Coordinates (Optional)</label>
                        <div className='location-inputs'>
                            <input
                                type='number'
                                step='any'
                                className='form-control'
                                name='lat'
                                placeholder='Latitude'
                                value={formData.lat}
                                onChange={handleChange}
                            />
                            <input
                                type='number'
                                step='any'
                                className='form-control'
                                name='lng'
                                placeholder='Longitude'
                                value={formData.lng}
                                onChange={handleChange}
                            />
                            <button
                                type='button'
                                className='btn btn-secondary get-location-btn'
                                onClick={getLocation}
                                disabled={gettingLocation}
                            >
                                <MapPin size={18} /> {gettingLocation ? 'Locating...' : 'Get My Location'}
                            </button>
                        </div>
                    </div>

                    <div className='form-group checkbox-group'>
                        <label className='checkbox-container'>
                            <input
                                type='checkbox'
                                name='isAnonymous'
                                checked={formData.isAnonymous}
                                onChange={handleChange}
                            />
                            <span className='checkmark'></span>
                            Submit Anonymously (Your identity will be hidden)
                        </label>
                    </div>

                    <button
                        type='submit'
                        className='btn btn-primary btn-block submit-btn'
                        disabled={loading || success}
                    >
                        {loading ? 'Submitting...' : 'Submit Complaint'}
                    </button>
                </form>
            </div >
        </div >
    );
};

export default SubmitComplaint;
