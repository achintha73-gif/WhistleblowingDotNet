import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import InvestigatorDashboard from './pages/InvestigatorDashboard';
import { useContext } from 'react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (allowedRoles && !allowedRoles.includes(user.roleName)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['USER']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/investigator" element={<ProtectedRoute allowedRoles={['INVESTIGATOR']}><InvestigatorDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;