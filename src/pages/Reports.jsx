import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchReports(selectedClass);
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/classes`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async (classId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      let url = `${API_URL}/api/attendance/reports`;
      if (classId) {
        url += `?class_id=${classId}`;
      }
      const res = await axios.get(url);
      setReports(res.data);
      processChartData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const processChartData = (data) => {
    // Group by date to show attendance per day
    const grouped = data.reduce((acc, curr) => {
      acc[curr.date] = (acc[curr.date] || 0) + 1;
      return acc;
    }, {});

    const chartArr = Object.keys(grouped).map(date => ({
      date,
      count: grouped[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    setChartData(chartArr);
  };

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Name,Role,Class ID,Date,Time,Status\n";
    
    reports.forEach(r => {
      csvContent += `${r.id},${r.user_name},${r.role},${r.class_id || 'N/A'},${r.date},${r.time},${r.status}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report${selectedClass ? '_class_'+selectedClass : ''}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Attendance Reports</h1>
          <p className="page-subtitle">Last 7 days overview</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            className="form-control" 
            style={{ width: '200px' }}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          
          <button className="btn btn-primary" onClick={downloadCSV}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card" style={{ marginBottom: '2rem', height: '400px' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Weekly Attendance Trend {selectedClass && `(Class: ${classes.find(c => c.id == selectedClass)?.name || selectedClass})`}</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" allowDecimals={false} />
            <Tooltip 
              contentStyle={{ background: 'rgba(20,20,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Present" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="glass-card">
        <h3>Detailed Logs</h3>
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>{r.time}</td>
                  <td style={{ fontWeight: 500 }}>{r.user_name}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.role}</td>
                  <td>
                    <span className={`badge ${r.status === 'Present' ? 'badge-success' : 'badge-danger'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
