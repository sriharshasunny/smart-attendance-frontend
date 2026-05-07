import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, Camera, FileBarChart } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import ManageClasses from './pages/ManageClasses';
import LiveAttendance from './pages/LiveAttendance';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2>
            <Camera size={28} color="#a5b4fc" />
            SmartAttend
          </h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
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
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<LiveAttendance />} />
            <Route path="/users" element={<ManageUsers />} />
            <Route path="/classes" element={<ManageClasses />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
