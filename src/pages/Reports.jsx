import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Calendar, BarChart2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function AttPct({ pct }) {
  const cls = pct >= 85 ? 'high' : pct >= 75 ? 'medium' : 'low';
  return <span className={`att-pct ${cls}`}>{pct}%</span>;
}

export default function Reports() {
  const [period, setPeriod] = useState('weekly');          // weekly | monthly | overall
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);            // { period, working_dates, students }
  const [dailyLogs, setDailyLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchClasses(); }, []);

  useEffect(() => {
    if (selectedClass) fetchSummary();
    else { setSummary(null); }
  }, [period, selectedClass, month, year]);

  useEffect(() => { fetchDailyLogs(); }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/classes`);
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSummary = async () => {
    if (!selectedClass) return;
    setLoading(true);
    try {
      let url = `${API_URL}/api/attendance/summary?class_id=${selectedClass}&period=${period}`;
      if (period === 'monthly') url += `&year=${year}&month=${month}`;
      const res = await axios.get(url);
      setSummary(res.data);
    } catch (err) { console.error(err); setSummary(null); }
    setLoading(false);
  };

  const fetchDailyLogs = async () => {
    try {
      let url = `${API_URL}/api/attendance/reports`;
      if (selectedClass) url += `?class_id=${selectedClass}`;
      const res = await axios.get(url);
      setDailyLogs(res.data);
    } catch (err) { console.error(err); }
  };

  // Bar chart data from daily logs
  const chartData = (() => {
    const grouped = dailyLogs.reduce((acc, r) => {
      acc[r.date] = (acc[r.date] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(grouped)
      .map(date => ({ date: date.slice(5), count: grouped[date] }))
      .sort((a, b) => a.date.localeCompare(b.date));
  })();

  const downloadCSV = () => {
    if (!summary) return;
    const { students, working_dates } = summary;
    let csv = 'Roll No,Name,Present Days,Total Days,Attendance %\n';
    if (working_dates && working_dates.length > 0) {
      csv = `Roll No,Name,${working_dates.join(',')},Present Days,Total Days,Attendance %\n`;
      students.forEach(s => {
        const row = working_dates.map(d => s.daily?.[d] === 'Present' ? 'P' : 'A').join(',');
        csv += `${s.roll_number || ''},${s.name},${row},${s.present_days},${s.total_days},${s.percentage}%\n`;
      });
    } else {
      students.forEach(s => {
        csv += `${s.roll_number || ''},${s.name},${s.present_days},${s.total_days},${s.percentage}%\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${period}_${selectedClass || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const className = classes.find(c => c.id === selectedClass)?.name || '';

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Attendance Reports</h1>
          <p className="page-subtitle">Class-wise attendance analytics</p>
        </div>
        <button className="btn btn-primary" onClick={downloadCSV} disabled={!summary}>
          <Download size={16}/> Export CSV
        </button>
      </div>

      {/* Controls */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Period tabs */}
        <div className="period-tabs">
          {['weekly','monthly','overall'].map(p => (
            <button key={p} className={`period-tab ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {/* Class selector */}
        <select className="form-control" style={{ width: '200px' }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        {/* Month/Year for monthly */}
        {period === 'monthly' && (
          <>
            <select className="form-control" style={{ width: '140px' }} value={month} onChange={e => setMonth(+e.target.value)}>
              {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select className="form-control" style={{ width: '110px' }} value={year} onChange={e => setYear(+e.target.value)}>
              {[year-1, year, year+1].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Attendance Summary Table */}
      {selectedClass && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#a5b4fc"/>
              {className} — {period.charAt(0).toUpperCase() + period.slice(1)} Attendance
            </h3>
            {summary && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Working days: <strong style={{ color: '#e2e8f0' }}>{summary.working_dates?.length || 0}</strong>
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }}/>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading attendance data...</p>
            </div>
          ) : !summary || summary.students.length === 0 ? (
            <div className="empty-state">
              <Calendar size={40}/>
              <p>No attendance data for this period.</p>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1rem', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="att-pct high" style={{ fontSize: '0.72rem' }}>≥85%</span> Good
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="att-pct medium" style={{ fontSize: '0.72rem' }}>75–84%</span> At Risk
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="att-pct low" style={{ fontSize: '0.72rem' }}>&lt;75%</span> Shortage
                </span>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Roll No.</th>
                      <th>Name</th>
                      {period !== 'overall' && summary.working_dates?.map(d => (
                        <th key={d} style={{ textAlign: 'center', minWidth: '40px', padding: '0.5rem 0.25rem', fontSize: '0.72rem' }}>
                          {d.slice(5)}
                        </th>
                      ))}
                      <th style={{ textAlign: 'center' }}>Present</th>
                      <th style={{ textAlign: 'center' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.students.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontFamily: 'monospace', color: '#a5b4fc', fontSize: '0.88rem' }}>{s.roll_number || '—'}</td>
                        <td style={{ fontWeight: 500 }}>{s.name}</td>
                        {period !== 'overall' && summary.working_dates?.map(d => {
                          const status = s.daily?.[d];
                          return (
                            <td key={d} style={{ textAlign: 'center', padding: '0.4rem 0.15rem' }}>
                              {status === 'Present'
                                ? <span className="att-cell-present">P</span>
                                : <span className="att-cell-absent">A</span>
                              }
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center', fontWeight: 600, color: '#10b981' }}>{s.present_days}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{s.total_days}</td>
                        <td style={{ textAlign: 'center' }}><AttPct pct={s.percentage}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="glass-card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem' }}>
          <BarChart2 size={40} style={{ opacity: 0.3, marginBottom: '1rem' }}/>
          <p style={{ color: 'var(--text-muted)' }}>Select a class above to view attendance summary.</p>
        </div>
      )}

      {/* Bar Chart - Last 7 days overview */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>
          Last 7 Days — Daily Check-ins {className && `(${className})`}
        </h3>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }}/>
              <YAxis stroke="#94a3b8" allowDecimals={false} tick={{ fontSize: 12 }}/>
              <Tooltip
                contentStyle={{ background: 'rgba(15,15,25,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[5, 5, 0, 0]} name="Present"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Logs */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Detailed Logs — Last 7 Days</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th><th>Time</th><th>Roll No.</th><th>Name</th><th>Role</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dailyLogs.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}>{r.date}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{r.time}</td>
                  <td style={{ fontFamily: 'monospace', color: '#a5b4fc', fontSize: '0.88rem' }}>{r.roll_number || '—'}</td>
                  <td style={{ fontWeight: 500 }}>{r.user_name}</td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{r.role}</td>
                  <td><span className={`badge ${r.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>{r.status}</span></td>
                </tr>
              ))}
              {dailyLogs.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
