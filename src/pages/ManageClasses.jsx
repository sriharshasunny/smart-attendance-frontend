import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2 } from 'lucide-react';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${API_URL}/api/classes`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addClass = async (e) => {
    e.preventDefault();
    if (!className) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${API_URL}/api/classes`, { name: className });
      setClassName('');
      fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteClass = async (id) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/classes/${id}`);
      fetchClasses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Classes</h1>
        <p className="page-subtitle">Create and remove class groups</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Class</h3>
        <form onSubmit={addClass} style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Class Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. CSE-A" 
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Plus size={18} /> Add Class
          </button>
        </form>
      </div>

      <div className="glass-card">
        <h3>Class List</h3>
        <div className="table-container" style={{ marginTop: '1rem' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Class Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteClass(c.id)} style={{ padding: '0.5rem' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No classes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
