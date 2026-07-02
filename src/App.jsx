import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Camera, FileBarChart, LogOut } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import ManageClasses from './pages/ManageClasses';
import LiveAttendance from './pages/LiveAttendance';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { AuthProvider, AuthContext } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useContext(AuthContext);
  
  if (isLoading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}><span className="spinner"></span></div>;
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function MainLayout({ children }) {
  const { logout } = useContext(AuthContext);
  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>
          <Camera size={28} color="#a5b4fc" />
          SmartAttend
        </h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/attendance" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Camera size={20} /> Live Attendance
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <Users size={20} /> Manage Users
          </NavLink>
          <NavLink to="/classes" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <BookOpen size={20} /> Manage Classes
          </NavLink>
          <NavLink to="/reports" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
            <FileBarChart size={20} /> Reports
          </NavLink>
        </nav>
        <button onClick={logout} className="nav-link" style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'var(--danger)', marginTop: 'auto' }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/attendance" element={<LiveAttendance />} />
                  <Route path="/users" element={<ManageUsers />} />
                  <Route path="/classes" element={<ManageClasses />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
