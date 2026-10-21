import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';

import Login from './pages/Login';
import AccessDenied from './pages/AccessDenied';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import InvestigatorDashboard from './pages/InvestigatorDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ManageUsers from './pages/ManageUsers';
import CreateUser from './pages/CreateUser';
import CaseDetails from './pages/CaseDetails';
import Profile from './pages/Profile';
import ManageCases from './pages/ManageCases';
import MyComplaints from './pages/MyComplaints';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import ActivityLogs from './pages/ActivityLogs';
import ManageDepartments from './pages/ManageDepartments';
import ComplaintDetails from './pages/ComplaintDetails'; // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“Ãƒâ€¹Ã¢â‚¬Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶Ãƒâ€šÃ‚Â½ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â·ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â·ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶Ãƒâ€šÃ‚Â±ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â·Ãƒâ€¦Ã‚Â  ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶Ãƒâ€šÃ‚Â­ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â·ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â¶Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â·ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã‚Â Ãƒâ€šÃ‚Â·Ãƒâ€šÃ‚Â

// Anonymous Pages
import AnonymousPortal from './pages/AnonymousPortal';
import AnonymousSubmit from './pages/AnonymousSubmit';
import AnonymousSuccess from './pages/AnonymousSuccess';
import AnonymousTrack from './pages/AnonymousTrack';
import AnonymousView from './pages/AnonymousView';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.roleName)) return <Navigate to="/access-denied" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
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
          <Route path="/my-complaints" element={<ProtectedRoute allowedRoles={['USER']}><MyComplaints /></ProtectedRoute>} />
          <Route path="/complaint/:id" element={<ProtectedRoute allowedRoles={['USER']}><ComplaintDetails /></ProtectedRoute>} />
          <Route path="/submit-complaint" element={<ProtectedRoute allowedRoles={['USER']}><SubmitComplaint /></ProtectedRoute>} />
          
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