import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Camera, RefreshCw } from 'lucide-react';

export default function LiveAttendance() {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, success, error
  const [message, setMessage] = useState('');
  const [markedUsers, setMarkedUsers] = useState([]);

  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  // Setup auto-capture interval when scanning
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        captureAndSend();
      }, 3000); // scan every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isScanning, selectedClass]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/classes`);
        setClasses(res.data);
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };
    fetchClasses();
  }, []);

  const captureAndSend = useCallback(async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setScanStatus('scanning');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const payload = { image: imageSrc };
      if (selectedClass) {
        payload.class_id = selectedClass;
      }
      
      const res = await axios.post(`${API_URL}/api/attendance/mark`, payload);
      
      setScanStatus('success');
      setMessage(res.data.message);
      
      // Add to marked users list if not already there
      const userName = res.data.user.name;
      setMarkedUsers(prev => {
        if (!prev.find(u => u.name === userName)) {
          return [{name: userName, role: res.data.user.role, time: new Date().toLocaleTimeString()}, ...prev];
        }
        return prev;
      });

      // Reset to scanning after 2 seconds
      setTimeout(() => setScanStatus(isScanning ? 'scanning' : 'idle'), 2000);
      
    } catch (err) {
      // If error is 403 (unknown face) or 400 (no face), just show error briefly
      setScanStatus('error');
      setMessage(err.response?.data?.error || 'Failed to process image');
      setTimeout(() => setScanStatus(isScanning ? 'scanning' : 'idle'), 1500);
    }
  }, [webcamRef, isScanning, selectedClass]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    setScanStatus(!isScanning ? 'scanning' : 'idle');
    setMessage(!isScanning ? 'Scanning for faces...' : 'Scanner paused.');
  };

  const [manualRoll, setManualRoll] = useState('');
  const [manualStatus, setManualStatus] = useState(null);
  
  const handleManualMark = async (e) => {
    e.preventDefault();
    setManualStatus(null);
    if (!manualRoll) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/attendance/manual`, { 
        roll_number: manualRoll,
        class_id: selectedClass 
      });
      
      setManualStatus({ type: 'success', message: res.data.message });
      setManualRoll('');
      
      // Add to marked users list
      const userName = res.data.user.name;
      setMarkedUsers(prev => {
        if (!prev.find(u => u.name === userName)) {
          return [{name: userName, role: res.data.user.role, time: new Date().toLocaleTimeString()}, ...prev];
        }
        return prev;
      });

      setTimeout(() => setManualStatus(null), 3000);
    } catch (err) {
      setManualStatus({ type: 'error', message: err.response?.data?.error || 'Failed to mark attendance manually' });
      setTimeout(() => setManualStatus(null), 3000);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Live Attendance</h1>
        <p className="page-subtitle">Automatic face recognition & manual check-in</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        
        {/* Camera Section */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontWeight: 500, minWidth: 'max-content' }}>Filter by Class (Optional):</label>
            <select 
              className="form-control" 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={isScanning}
            >
              <option value="">All Classes (Scan entire database)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.department ? `- ${c.department}` : ''} {c.section ? `(${c.section})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="webcam-container">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div className={`webcam-overlay ${scanStatus}`}>
              {isScanning && <div className="scan-line"></div>}
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              className={`btn ${isScanning ? 'btn-danger' : 'btn-primary'}`} 
              onClick={toggleScanning}
              style={{ width: '200px' }}
            >
              {isScanning ? 'Stop Scanner' : 'Start Scanner'}
            </button>
            <p style={{ marginTop: '1rem', color: scanStatus === 'error' ? 'var(--danger)' : scanStatus === 'success' ? 'var(--success)' : 'var(--text-muted)' }}>
              {message || 'Ready to scan'}
            </p>
          </div>
        </div>

        {/* Right Column: Manual + Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Manual Attendance Card */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>Manual Attendance</h3>
            <form onSubmit={handleManualMark}>
              <div className="form-group">
                <label>Roll Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Enter Roll Number"
                  value={manualRoll}
                  onChange={(e) => setManualRoll(e.target.value)}
                  disabled={isScanning}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isScanning || !manualRoll}>
                Mark Present
              </button>
              {manualStatus && (
                <p style={{ marginTop: '1rem', color: manualStatus.type === 'error' ? 'var(--danger)' : 'var(--success)', textAlign: 'center', fontSize: '0.9rem' }}>
                  {manualStatus.message}
                </p>
              )}
            </form>
          </div>

          {/* Live Logs Section */}
          <div className="glass-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <RefreshCw size={18} /> Live Check-ins
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto' }}>
              {markedUsers.map((user, idx) => (
                <div key={idx} style={{ 
                  padding: '1rem', 
                  background: 'rgba(255,255,255,0.03)', 
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--success)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  animation: 'slideIn 0.3s ease'
                }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{user.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {user.time}
                  </div>
                </div>
              ))}
              {markedUsers.length === 0 && (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                  No recent check-ins.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
