import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, UserCheck, UserX, BookOpen, ChevronRight } from 'lucide-react';
import MonthlyClassView from '../components/MonthlyClassView';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_classes: 0,
    present_today: 0,
    absent_today: 0
  });
  
  const [classesStats, setClassesStats] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchStats();
    fetchClassesStats();
  }, []);

  const fetchStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/dashboard`);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  const fetchClassesStats = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/dashboard/classes`);
      setClassesStats(res.data);
    } catch (err) {
      console.error("Failed to fetch classes stats", err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of today's attendance</p>
      </div>

      <div className="dashboard-stats" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card stat-card">
          <div className="stat-icon primary">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.total_users}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon success">
            <UserCheck size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.present_today}</h3>
            <p>Present Today</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon danger">
            <UserX size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.absent_today}</h3>
            <p>Absent Today</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)' }}>
            <BookOpen size={28} />
          </div>
          <div className="stat-info">
            <h3>{stats.total_classes}</h3>
            <p>Total Classes</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e2e8f0' }}>
          <BookOpen size={20} color="#a5b4fc" /> Class Wise Status
        </h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Click a class for monthly details</span>
      </div>
      
      <div className="classes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {classesStats.map(c => (
          <div 
            key={c.id} 
            className="glass-card class-monitor-card" 
            onClick={() => setSelectedClass(c)}
            style={{ cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
              e.currentTarget.style.borderColor = 'rgba(165, 180, 252, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{c.name}</h3>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={18} color="#a5b4fc" />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Total</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>{c.total_students}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Present</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#10b981' }}>{c.present_today}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Absent</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#ef4444' }}>{c.absent_today}</span>
              </div>
            </div>
            
            {/* Progress bar */}
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  height: '100%', 
                  background: c.total_students > 0 && (c.present_today / c.total_students) >= 0.5 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                  width: `${c.total_students > 0 ? (c.present_today / c.total_students) * 100 : 0}%`,
                  transition: 'width 1s ease-out'
                }} 
              />
            </div>
          </div>
        ))}
        {classesStats.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>No classes available yet. Create classes to see monitoring stats.</p>
          </div>
        )}
      </div>

      {selectedClass && (
        <MonthlyClassView 
          classItem={selectedClass} 
          onClose={() => setSelectedClass(null)} 
        />
      )}
    </div>
  );
}
