import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar } from 'lucide-react';

export default function MonthlyClassView({ classItem, onClose }) {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classItem) {
      fetchMonthlyData();
    }
  }, [classItem, year, month]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/attendance/monthly?class_id=${classItem.id}&year=${year}&month=${month}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!classItem) return null;

  const daysArray = data ? Array.from({ length: data.days_in_month }, (_, i) => i + 1) : [];

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="modal-content glass-card" style={{ width: '95%', maxWidth: '1400px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{classItem.name} - Monthly Monitor</h2>
            <p style={{ color: 'var(--text-muted)' }}>Detailed attendance view for students</p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <Calendar size={20} color="#94a3b8" />
          <select className="form-control" value={month} onChange={(e) => setMonth(parseInt(e.target.value))} style={{ width: '150px' }}>
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>
          <select className="form-control" value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ width: '120px' }}>
            <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
            <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1}</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</p>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <table className="attendance-matrix" style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ minWidth: '150px', position: 'sticky', left: 0, zIndex: 2, background: 'rgba(20,20,30,0.95)', padding: '1rem' }}>Student Name</th>
                  {daysArray.map(day => (
                    <th key={day} style={{ width: '35px', textAlign: 'center', padding: '1rem 0.5rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>{day}</th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>Total %</th>
                </tr>
              </thead>
              <tbody>
                {data && data.students.map((student, idx) => {
                  let presentCount = 0;
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                      <td style={{ position: 'sticky', left: 0, zIndex: 1, background: idx % 2 === 0 ? 'rgba(30,30,40,0.95)' : 'rgba(35,35,45,0.95)', fontWeight: 500, padding: '1rem' }}>{student.name}</td>
                      {daysArray.map(day => {
                        const status = student.attendance[day];
                        if (status === 'Present') presentCount++;
                        return (
                          <td key={day} style={{ textAlign: 'center', padding: '0.25rem', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                            {status === 'Present' ? (
                              <span style={{ display: 'inline-block', width: '24px', height: '24px', lineHeight: '24px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 'bold' }}>P</span>
                            ) : (
                              <span style={{ display: 'inline-block', width: '24px', height: '24px', lineHeight: '24px', borderRadius: '4px', color: '#ef4444', opacity: 0.5 }}>-</span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                        {data.days_in_month > 0 ? Math.round((presentCount / data.days_in_month) * 100) : 0}%
                      </td>
                    </tr>
                  )
                })}
                {(!data || data.students.length === 0) && (
                  <tr>
                    <td colSpan={daysArray.length + 2} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No students found in this class.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
