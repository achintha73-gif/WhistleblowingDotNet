import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Register from './pages/Register';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import InvestigatorDashboard from './pages/InvestigatorDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ManageUsers from './pages/ManageUsers';
import ManageCases from './pages/ManageCases';
import CaseDetails from './pages/CaseDetails';
import Profile from './pages/Profile';
import MyComplaints from './pages/MyComplaints';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import ActivityLogs from './pages/ActivityLogs';
import ComplaintDetails from './pages/ComplaintDetails';
import ManageDepartments from './pages/ManageDepartments';
import CreateUser from './pages/CreateUser';

// Anonymous Pages
import AnonymousPortal from './pages/AnonymousPortal';
import AnonymousSubmit from './pages/AnonymousSubmit';
import AnonymousSuccess from './pages/AnonymousSuccess';
import AnonymousTrack from './pages/AnonymousTrack';
import AnonymousView from './pages/AnonymousView';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>; 
  
  if (!user) return <Navigate to="/" />;
  
  // Role එක uppercase කරලා compare කරමු
  const userRole = user.roleName ? user.roleName.toUpperCase() : '';
  const hasPermission = allowedRoles ? allowedRoles.map(r => r.toUpperCase()).includes(userRole) : true;
  
  if (!hasPermission) return <Navigate to="/access-denied" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          
          {/* Anonymous Routes */}
          <Route path="/anonymous" element={<AnonymousPortal />} />
          <Route path="/anonymous/submit" element={<AnonymousSubmit />} />
          <Route path="/anonymous/success" element={<AnonymousSuccess />} />
          <Route path="/anonymous/track" element={<AnonymousTrack />} />
          <Route path="/anonymous/view" element={<AnonymousView />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageUsers /></ProtectedRoute>} />
          <Route path="/manage-users/create" element={<ProtectedRoute allowedRoles={['ADMIN']}><CreateUser /></ProtectedRoute>} />
          <Route path="/manage-departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageDepartments /></ProtectedRoute>} />
          <Route path="/activity-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><ActivityLogs /></ProtectedRoute>} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
          
          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['USER']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/submit-complaint" element={<ProtectedRoute allowedRoles={['USER']}><SubmitComplaint /></ProtectedRoute>} />
          <Route path="/my-complaints" element={<ProtectedRoute allowedRoles={['USER']}><MyComplaints /></ProtectedRoute>} />
          <Route path="/complaint/:id" element={<ProtectedRoute allowedRoles={['USER']}><ComplaintDetails /></ProtectedRoute>} />
          
          {/* Shared Auth Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/manage-cases" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'INVESTIGATOR']}><ManageCases /></ProtectedRoute>} />

          {/* Investigator Routes */}
          <Route path="/investigator" element={<ProtectedRoute allowedRoles={['INVESTIGATOR']}><InvestigatorDashboard /></ProtectedRoute>} />
          <Route path="/case/:id" element={<ProtectedRoute allowedRoles={['INVESTIGATOR', 'ADMIN', 'MANAGER']}><CaseDetails /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;