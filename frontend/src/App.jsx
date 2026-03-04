import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import { lazy, Suspense } from 'react';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Loader from './components/Loader';
import AppLayout from './components/AppLayout';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SubmitComplaint = lazy(() => import('./pages/SubmitComplaint'));
import TrackComplaint from './pages/TrackComplaint';
import ComplaintDetail from './pages/ComplaintDetail';
const CitizenDashboard = lazy(() => import('./pages/CitizenDashboard'));
const DepartmentDashboard = lazy(() => import('./pages/DepartmentDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const DepartmentSetup = lazy(() => import('./pages/DepartmentSetup'));
const Departments = lazy(() => import('./pages/Departments'));
const SmartPriority = lazy(() => import('./pages/SmartPriority'));
const Profile = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className='app-container'>
          <Navbar />
          <main className='main-content'>
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Public Routes without Sidebar */}
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />

                {/* Layout Routes (Sidebar visible if authenticated) */}
                <Route element={<AppLayout />}>
                  <Route path='/track-complaint' element={<TrackComplaint />} />
                  <Route path='/submit-complaint' element={<SubmitComplaint />} />
                  <Route path='/complaint/:id' element={<ComplaintDetail />} />

                  {/* Protected Routes directly under Layout */}
                  <Route
                    path='/dashboard'
                    element={
                      <ProtectedRoute allowedRoles={['Citizen']}>
                        <CitizenDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path='/departments'
                    element={
                      <ProtectedRoute allowedRoles={['Citizen']}>
                        <Departments />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path='/department-dashboard'
                    element={
                      <ProtectedRoute allowedRoles={['Department']}>
                        <DepartmentDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path='/department-priority'
                    element={
                      <ProtectedRoute allowedRoles={['Department']}>
                        <SmartPriority />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path='/profile'
                    element={
                      <ProtectedRoute allowedRoles={['Citizen', 'Department']}>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path='/admin-dashboard'
                    element={
                      <ProtectedRoute allowedRoles={['Admin']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route
                  path='/department-setup'
                  element={
                    <ProtectedRoute allowedRoles={['Department']} requireSetup={false}>
                      <DepartmentSetup />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
