import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import { AuthContext } from './context/AuthContext';
import { lazy, Suspense, useContext } from 'react';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/ManagerDashboard'));
const ManagerTeam = lazy(() => import('./pages/ManagerTeam'));
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'));
const InvestigatorDashboard = lazy(() => import('./pages/InvestigatorDashboard'));
const SubmitComplaint = lazy(() => import('./pages/SubmitComplaint'));
const ManageUsers = lazy(() => import('./pages/ManageUsers'));
const CreateUser = lazy(() => import('./pages/CreateUser'));
const CaseDetails = lazy(() => import('./pages/CaseDetails'));
const AssignInvestigators = lazy(() => import('./pages/AssignInvestigators'));
const Profile = lazy(() => import('./pages/Profile'));
const ManageCases = lazy(() => import('./pages/ManageCases'));
const MyComplaints = lazy(() => import('./pages/MyComplaints'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Support = lazy(() => import('./pages/Support'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const ManageDepartments = lazy(() => import('./pages/ManageDepartments'));
const ComplaintDetails = lazy(() => import('./pages/ComplaintDetails'));
const CreateCase = lazy(() => import('./pages/CreateCase'));
const Settings = lazy(() => import('./pages/Settings'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AnonymousPortal = lazy(() => import('./pages/AnonymousPortal'));
const AnonymousSubmit = lazy(() => import('./pages/AnonymousSubmit'));
const AnonymousSuccess = lazy(() => import('./pages/AnonymousSuccess'));
const AnonymousTrack = lazy(() => import('./pages/AnonymousTrack'));
const AnonymousView = lazy(() => import('./pages/AnonymousView'));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  if (!user) return <Navigate to="/" state={{ from: location }} replace />;
  if (allowedRoles && !allowedRoles.includes(user.roleName)) return <Navigate to="/access-denied" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-600">Loading page…</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
          <Route path="/manage-complaints" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><MyComplaints /></ProtectedRoute>} />
          <Route path="/manage-departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageDepartments /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><Settings /></ProtectedRoute>} />
          <Route path="/activity-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><ActivityLogs /></ProtectedRoute>} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="/manager/team" element={<ProtectedRoute allowedRoles={['MANAGER']}><ManagerTeam /></ProtectedRoute>} />
          
          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['USER']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/my-complaints" element={<ProtectedRoute allowedRoles={['USER']}><MyComplaints /></ProtectedRoute>} />
          <Route path="/complaint/:id" element={<ProtectedRoute allowedRoles={['USER', 'MANAGER', 'ADMIN', 'INVESTIGATOR']}><ComplaintDetails /></ProtectedRoute>} />
          <Route path="/complaint/:id/create-case" element={<ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}><CreateCase /></ProtectedRoute>} />
          <Route path="/submit-complaint" element={<ProtectedRoute allowedRoles={['USER']}><SubmitComplaint /></ProtectedRoute>} />
          
          {/* Shared Auth Routes */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/manage-cases" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'INVESTIGATOR']}><ManageCases /></ProtectedRoute>} />

          {/* Investigator Routes */}
          <Route path="/investigator" element={<ProtectedRoute allowedRoles={['INVESTIGATOR']}><InvestigatorDashboard /></ProtectedRoute>} />
          <Route path="/case/:id" element={<ProtectedRoute allowedRoles={['INVESTIGATOR', 'ADMIN', 'MANAGER']}><CaseDetails /></ProtectedRoute>} />
          <Route path="/case/:id/assign-investigators" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><AssignInvestigators /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
export default App;
