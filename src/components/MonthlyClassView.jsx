import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Calendar } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function PctBadge({ pct }) {
  const cls = pct >= 85 ? 'high' : pct >= 75 ? 'medium' : 'low';
  return <span className={`att-pct ${cls}`}>{pct}%</span>;
}

export default function MonthlyClassView({ classItem, onClose }) {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classItem) fetchMonthlyData();
  }, [classItem, year, month]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/attendance/monthly?class_id=${classItem.id}&year=${year}&month=${month}`
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!classItem) return null;

  const daysArray = data ? Array.from({ length: data.days_in_month }, (_, i) => i + 1) : [];

  // Class-wide average
  const avgPct = data && data.students.length > 0
    ? Math.round(data.students.reduce((sum, s) => sum + s.percentage, 0) / data.students.length)
    : null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass-card" style={{ width: '97%', maxWidth: '1500px', maxHeight: '92vh', overflowY: 'auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
              {classItem.name} — Monthly Attendance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {MONTH_NAMES[month - 1]} {year}
              {data && <> &nbsp;·&nbsp; <strong style={{ color: '#e2e8f0' }}>{data.working_days}</strong> working days</>}
              {avgPct !== null && <> &nbsp;·&nbsp; Class avg: <strong><PctBadge pct={avgPct}/></strong></>}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
            <X size={22}/>
          </button>
        </div>

        {/* Month / Year selectors */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
          <Calendar size={18} color="#94a3b8"/>
          <select className="form-control" value={month} onChange={e => setMonth(+e.target.value)} style={{ width: '150px' }}>
            {MONTH_NAMES.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>
          <select className="form-control" value={year} onChange={e => setYear(+e.target.value)} style={{ width: '110px' }}>
            {[year-1, year, year+1].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto', fontSize: '0.8rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="att-pct high" style={{ fontSize: '0.7rem' }}>≥85%</span> Good
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="att-pct medium" style={{ fontSize: '0.7rem' }}>75–84%</span> At Risk
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="att-pct low" style={{ fontSize: '0.7rem' }}>&lt;75%</span> Shortage
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}/>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading attendance matrix...</p>
          </div>
        ) : (
          <div className="table-container" style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <table className="attendance-matrix" style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <th style={{ minWidth: '90px', position: 'sticky', left: 0, zIndex: 2, background: 'rgba(15,15,25,0.98)', padding: '0.8rem 0.75rem' }}>Roll No.</th>
                  <th style={{ minWidth: '160px', position: 'sticky', left: '90px', zIndex: 2, background: 'rgba(15,15,25,0.98)', padding: '0.8rem 1rem' }}>Name</th>
                  {daysArray.map(day => (
                    <th key={day} style={{ width: '32px', textAlign: 'center', padding: '0.8rem 0.1rem', borderLeft: '1px solid rgba(255,255,255,0.04)', fontSize: '0.75rem' }}>
                      {day}
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.06)', minWidth: '60px' }}>Days</th>
                  <th style={{ textAlign: 'center', padding: '0.8rem', borderLeft: '1px solid rgba(255,255,255,0.06)', minWidth: '70px' }}>%</th>
                </tr>
              </thead>
              <tbody>
                {data && data.students.map((student, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                    <td style={{ position: 'sticky', left: 0, zIndex: 1, background: idx % 2 === 0 ? 'rgba(20,20,30,0.98)' : 'rgba(25,25,38,0.98)', fontFamily: 'monospace', color: '#a5b4fc', fontSize: '0.82rem', padding: '0.6rem 0.75rem' }}>
                      {student.roll_number || '—'}
                    </td>
                    <td style={{ position: 'sticky', left: '90px', zIndex: 1, background: idx % 2 === 0 ? 'rgba(20,20,30,0.98)' : 'rgba(25,25,38,0.98)', fontWeight: 500, padding: '0.6rem 1rem' }}>
                      {student.name}
                    </td>
                    {daysArray.map(day => {
                      const status = student.attendance[day];
                      return (
                        <td key={day} style={{ textAlign: 'center', padding: '0.25rem 0.05rem', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                          {status === 'Present'
                            ? <span className="att-cell-present">P</span>
                            : <span className="att-cell-absent">—</span>
                          }
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)', color: '#10b981', fontWeight: 600 }}>
                      {student.present_count}/{student.working_days}
                    </td>
                    <td style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
                      <PctBadge pct={student.percentage}/>
                    </td>
                  </tr>
                ))}
                {(!data || data.students.length === 0) && (
                  <tr>
                    <td colSpan={daysArray.length + 4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
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
