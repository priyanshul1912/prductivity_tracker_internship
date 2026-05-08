import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [busy, setBusy]   = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      nav('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo text-grad">⚡ ProTrack</div>
        <p className="auth-tagline">Your AI-powered productivity companion</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input" name="email" type="email"
              placeholder="you@example.com" value={form.email}
              onChange={handle} required autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input" name="password" type="password"
              placeholder="Enter your password" value={form.password}
              onChange={handle} required
            />
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }} disabled={busy}>
            {busy ? <span className="spinner spinner-sm" /> : '🚀 Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
