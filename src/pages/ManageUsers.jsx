import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Plus, Trash2, Camera, Upload, Video, Search, X, CheckCircle, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [formData, setFormData] = useState({
    name: '', roll_number: '', role: 'student',
    class_id: '', department: '', year_of_study: '',
    image: null, image_base64: ''
  });
  const [captureMode, setCaptureMode] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const webcamRef = useRef(null);

  useEffect(() => { fetchUsers(); fetchClasses(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) searchUsers();
      else fetchUsers(filterClass);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, filterClass]);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async (classId = '') => {
    try {
      const url = classId ? `${API_URL}/api/users?class_id=${classId}` : `${API_URL}/api/users`;
      const res = await axios.get(url);
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/classes`);
      setClasses(res.data);
    } catch (err) { console.error(err); }
  };

  const searchUsers = async () => {
    try {
      let url = `${API_URL}/api/users/search?q=${encodeURIComponent(searchQuery)}`;
      if (filterClass) url += `&class_id=${filterClass}`;
      const res = await axios.get(url);
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const captureFace = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setFormData(prev => ({ ...prev, image_base64: imageSrc, image: null }));
    }
  }, [webcamRef]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (captureMode === 'camera' && !formData.image_base64) { showToast('Please capture a face first', 'error'); setLoading(false); return; }
    if (captureMode === 'upload' && !formData.image) { showToast('Please upload an image first', 'error'); setLoading(false); return; }

    const data = new FormData();
    ['name','role','roll_number','department','year_of_study'].forEach(k => data.append(k, formData[k]));
    if (formData.class_id) data.append('class_id', formData.class_id);
    if (formData.image) data.append('image', formData.image);
    if (formData.image_base64) data.append('image_base64', formData.image_base64);

    try {
      await axios.post(`${API_URL}/api/users`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Student registered successfully!', 'success');
      setFormData({ name:'', roll_number:'', role:'student', class_id:'', department:'', year_of_study:'', image:null, image_base64:'' });
      fetchUsers(filterClass);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to register user', 'error');
    }
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/api/users/${id}`);
      showToast('User deleted.', 'success');
      if (searchQuery.trim()) searchUsers(); else fetchUsers(filterClass);
    } catch (err) { showToast('Failed to delete user', 'error'); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">Register students &amp; staff with face recognition</p>
      </div>

      {/* Registration Form */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Register New User</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Full Name *</label>
              <input type="text" className="form-control" required placeholder="e.g. Harsha Boindla"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Roll Number</label>
              <input type="text" className="form-control" placeholder="e.g. 22CS001"
                value={formData.roll_number} onChange={e => setFormData({ ...formData, roll_number: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Role *</label>
              <select className="form-control" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Class</label>
              <select className="form-control" value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value })}>
                <option value="">Select a class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.department ? ` — ${c.department}` : ''}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Department</label>
              <input type="text" className="form-control" placeholder="e.g. Computer Science"
                value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Year of Study</label>
              <select className="form-control" value={formData.year_of_study} onChange={e => setFormData({ ...formData, year_of_study: e.target.value })}>
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Face capture */}
            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label style={{ marginBottom: '0.75rem', display: 'block' }}>Face Registration Method *</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                {['upload','camera'].map(mode => (
                  <button key={mode} type="button"
                    className={`btn ${captureMode === mode ? 'btn-primary' : ''}`}
                    style={{ background: captureMode !== mode ? 'rgba(255,255,255,0.05)' : '', color: captureMode !== mode ? 'var(--text-muted)' : '' }}
                    onClick={() => setCaptureMode(mode)}>
                    {mode === 'upload' ? <><Upload size={15}/> Upload Photo</> : <><Video size={15}/> Live Camera</>}
                  </button>
                ))}
              </div>
              {captureMode === 'upload' ? (
                <input type="file" accept="image/*" className="form-control" onChange={e => setFormData({ ...formData, image: e.target.files[0], image_base64: '' })} />
              ) : (
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div className="webcam-container" style={{ maxWidth: '280px', margin: 0 }}>
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                      videoConstraints={{ width: 280, height: 210, facingMode: 'user' }}
                      style={{ width: '100%', borderRadius: '14px', display: 'block' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button type="button" className="btn btn-primary" onClick={captureFace}><Camera size={15}/> Capture Face</button>
                    {formData.image_base64 && (
                      <div>
                        <p style={{ fontSize: '0.8rem', color: '#10b981', marginBottom: '0.5rem' }}>✓ Face captured</p>
                        <img src={formData.image_base64} alt="Captured" style={{ width: '90px', borderRadius: '10px', border: '2px solid #10b981' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.5rem', width: '100%', padding: '0.9rem' }}>
            {loading ? <><span className="spinner" /> Processing face (may take ~10s)...</> : 'Register User'}
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3>User List <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>({users.length})</span></h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="form-control" style={{ width: '170px' }} value={filterClass}
              onChange={e => { setFilterClass(e.target.value); setSearchQuery(''); }}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="search-bar-wrapper" style={{ width: '230px', position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input type="text" className="form-control" style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2rem' : '1rem' }}
                placeholder="Name or roll no..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); fetchUsers(filterClass); }}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th><th>Roll No.</th><th>Role</th><th>Class</th><th>Year</th><th>Face</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ fontFamily: 'monospace', color: '#a5b4fc', fontSize: '0.9rem' }}>{u.roll_number || '—'}</td>
                  <td><span className={`badge ${u.role === 'staff' ? 'badge-primary' : 'badge-success'}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{u.class_name || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{u.year_of_study || '—'}</td>
                  <td>{u.has_face ? <span className="badge badge-success"><Camera size={11}/> Registered</span> : <span className="badge badge-danger">Missing</span>}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteUser(u.id)} style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}>
                      <Trash2 size={14}/> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                  {searchQuery ? `No users found matching "${searchQuery}"` : 'No users registered yet.'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} color="#10b981"/> : <AlertCircle size={18} color="#ef4444"/>}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
