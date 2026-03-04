import { Link, Navigate } from 'react-router-dom';
import { AlertCircle, FileText, Smartphone, ShieldCheck } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const { user } = useContext(AuthContext);

    // STRICT: Prevent Department/Admin users from using Home as landing page
    if (user) {
        if (user.role === 'Admin') return <Navigate to='/admin-dashboard' replace />;
        if (user.role === 'Department') {
            if (!user.departmentInfo || !user.departmentInfo.officeLocation) {
                return <Navigate to='/department-setup' replace />;
            }
            return <Navigate to='/department-dashboard' replace />;
        }
    }
    return (
        <div className='home-container'>
            <header className='hero-section'>
                <div className='hero-content'>
                    <h1 className='hero-title'>
                        Smart Public Utility Complaint <br /> & Anonymous Reporting System
                    </h1>
                    <p className='hero-subtitle'>
                        Report issues related to water, electricity, roads, and sanitation instantly.
                        Track your complaints in real-time or report anonymously to protect your identity.
                    </p>
                    <div className='hero-actions'>
                        <Link to='/submit-complaint' className='btn btn-primary btn-lg'>
                            Submit a Complaint
                        </Link>
                        <Link to='/track-complaint' className='btn btn-outline btn-lg'>
                            Track Status
                        </Link>
                    </div>
                </div>
            </header>

            <section className='features-section'>
                <h2 className='section-title'>How It Works</h2>
                <div className='features-grid'>
                    <div className='feature-card card'>
                        <FileText className='feature-icon' />
                        <h3>1. Submit</h3>
                        <p>Upload a photo, enter details, and pin the location. You can choose to remain anonymous.</p>
                    </div>
                    <div className='feature-card card'>
                        <AlertCircle className='feature-icon' />
                        <h3>2. Assigned</h3>
                        <p>The system routes your complaint to the correct department automatically.</p>
                    </div>
                    <div className='feature-card card'>
                        <Smartphone className='feature-icon' />
                        <h3>3. Track</h3>
                        <p>Use your unique tracking ID to monitor progress until resolution.</p>
                    </div>
                    <div className='feature-card card'>
                        <ShieldCheck className='feature-icon' />
                        <h3>4. Resolved</h3>
                        <p>Departments update status transparently, resulting in faster community improvements.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
