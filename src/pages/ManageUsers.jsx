import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import { Plus, Trash2, Camera, Upload, Video } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    role: 'student',
    class_id: '',
    image: null,
    image_base64: ''
  });
  const [captureMode, setCaptureMode] = useState('upload'); // 'upload' or 'camera'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const webcamRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, []);

  const fetchUsers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClasses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/classes`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0], image_base64: '' });
  };

  const captureFace = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setFormData({ ...formData, image_base64: imageSrc, image: null });
    }
  }, [webcamRef, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (captureMode === 'camera' && !formData.image_base64) {
      setMessage({ text: 'Please capture a face first', type: 'error' });
      setLoading(false);
      return;
    }

    if (captureMode === 'upload' && !formData.image) {
      setMessage({ text: 'Please upload an image first', type: 'error' });
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('role', formData.role);
    if (formData.class_id) data.append('class_id', formData.class_id);
    if (formData.image) data.append('image', formData.image);
    if (formData.image_base64) data.append('image_base64', formData.image_base64);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/users`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ text: 'User added successfully', type: 'success' });
      setFormData({ name: '', role: 'student', class_id: '', image: null, image_base64: '' });
      fetchUsers();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to add user', type: 'error' });
    }
    setLoading(false);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="page-subtitle">Register robust face data via Upload or Live Camera</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3>Add New User</h3>
        {message.text && (
          <div className={`toast ${message.type}`} style={{ position: 'relative', bottom: 'auto', right: 'auto', marginTop: '1rem', animation: 'none' }}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                className="form-control" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Role</label>
              <select 
                className="form-control" 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Class (Optional)</label>
              <select 
                className="form-control" 
                value={formData.class_id}
                onChange={e => setFormData({...formData, class_id: e.target.value})}
              >
                <option value="">Select a class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ marginBottom: '1rem', display: 'block' }}>Face Registration Method</label>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button 
                  type="button"
                  className={`btn ${captureMode === 'upload' ? 'btn-primary' : ''}`}
                  style={{ background: captureMode !== 'upload' ? 'rgba(255,255,255,0.05)' : '' }}
                  onClick={() => setCaptureMode('upload')}
                >
                  <Upload size={18}/> Upload Image
                </button>
                <button 
                  type="button"
                  className={`btn ${captureMode === 'camera' ? 'btn-primary' : ''}`}
                  style={{ background: captureMode !== 'camera' ? 'rgba(255,255,255,0.05)' : '' }}
                  onClick={() => setCaptureMode('camera')}
                >
                  <Video size={18}/> Live Camera
                </button>
              </div>

              {captureMode === 'upload' ? (
                <input 
                  type="file" 
                  accept="image/*" 
                  className="form-control" 
                  onChange={handleImageChange}
                  required={!formData.image_base64}
                />
              ) : (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div className="webcam-container" style={{ maxWidth: '320px', margin: 0 }}>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ width: 320, height: 240, facingMode: "user" }}
                      style={{ width: '100%', borderRadius: '15px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button type="button" className="btn btn-primary" onClick={captureFace}>
                      <Camera size={18} /> Capture
                    </button>
                    {formData.image_base64 && (
                      <div style={{ border: '2px solid var(--success)', borderRadius: '15px', overflow: 'hidden' }}>
                        <img src={formData.image_base64} alt="Captured face" style={{ width: '120px', display: 'block' }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }}>
            {loading ? 'Running Robust AI Processing... (This takes longer)' : 'Register User'}
          </button>
        </form>
      </div>

      <div className="glass-card">
        <h3>User List</h3>
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Face Data</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>
                    <span className={`badge ${u.role === 'staff' ? 'badge-primary' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.has_face ? (
                      <span className="badge badge-success" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center'}}>
                        <Camera size={12}/> Registered
                      </span>
                    ) : (
                      <span className="badge badge-danger">Missing</span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteUser(u.id)} style={{ padding: '0.5rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
