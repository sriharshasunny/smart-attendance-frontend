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

  // Setup auto-capture interval when scanning
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        captureAndSend();
      }, 3000); // scan every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const captureAndSend = useCallback(async () => {
    if (!webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setScanStatus('scanning');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${API_URL}/api/attendance/mark`, {
        image: imageSrc
      });
      
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
  }, [webcamRef, isScanning]);

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    setScanStatus(!isScanning ? 'scanning' : 'idle');
    setMessage(!isScanning ? 'Scanning for faces...' : 'Scanner paused.');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Live Attendance</h1>
        <p className="page-subtitle">Automatic face recognition attendance</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        
        {/* Camera Section */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

        {/* Live Logs Section */}
        <div className="glass-card" style={{ height: 'fit-content' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <RefreshCw size={18} /> Live Check-ins
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
            {markedUsers.map((user, idx) => (
              <div key={idx} style={{ 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '10px',
                borderLeft: '4px solid var(--success)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
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
  );
}
