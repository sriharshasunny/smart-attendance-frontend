import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState({ name: '', department: '', section: '', year: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { fetchClasses(); }, []);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/classes`);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addClass = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/classes`, form, { timeout: 15000 });
      setForm({ name: '', department: '', section: '', year: '' });
      showToast('Class created successfully!', 'success');
      fetchClasses();
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        showToast('Request timed out. The backend might be starting up or unresponsive.', 'error');
      } else {
        showToast(err.response?.data?.error || 'Failed to create class', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id) => {
    if (!window.confirm('Delete this class? Students assigned to it will become unclassed.')) return;
    try {
      await axios.delete(`${API_URL}/api/classes/${id}`);
      showToast('Class deleted.', 'success');
      fetchClasses();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete class', 'error');
    }
  };

  const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Classes</h1>
        <p className="page-subtitle">Create and manage class groups for your college</p>
      </div>

      {/* Add Class Form */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <BookOpen size={20} color="#a5b4fc" /> Add New Class
        </h3>
        <form onSubmit={addClass}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Class Name <span style={{ color: '#ef4444' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CSE-A, ECE-B"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Department</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Computer Science"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Section</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. A, B, C"
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Year of Study</label>
              <select
                className="form-control"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
              >
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: '1.5rem', minWidth: '160px' }}
          >
            {loading ? <span className="spinner" /> : <Plus size={18} />}
            {loading ? 'Creating...' : 'Add Class'}
          </button>
        </form>
      </div>

      {/* Class List */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>
          Class List <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>({classes.length})</span>
        </h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Department</th>
                <th>Section</th>
                <th>Year</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.department || '—'}</td>
                  <td>
                    {c.section
                      ? <span className="badge badge-primary">{c.section}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.year || '—'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteClass(c.id)} style={{ padding: '0.45rem 0.85rem' }}>
                      <Trash2 size={15} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {classes.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    No classes found. Add your first class above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}
