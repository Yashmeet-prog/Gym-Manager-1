import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMember, createMember, updateMember } from '../api';
import { Save, ArrowLeft } from 'lucide-react';

const MemberForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    join_date: new Date().toISOString().split('T')[0],
    plan_months: 1,
    plan_days: 0,
    fee: 50,
    amount_paid: 0
  });

  useEffect(() => {
    if (isEditMode) {
      fetchMember();
    }
  }, [id]);

  const fetchMember = async () => {
    try {
      const data = await getMember(id);
      setFormData(data);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch member details');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const calculatePreviewExpiry = (joinStr, months, days) => {
    if (!joinStr) return '';
    const date = new Date(joinStr);
    date.setMonth(date.getMonth() + parseInt(months || 0, 10));
    date.setDate(date.getDate() + parseInt(days || 0, 10));
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateMember(id, formData);
      } else {
        await createMember(formData);
      }
      navigate('/members');
    } catch (err) {
      alert('Failed to save member details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="fade-in mt-4" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button className="btn" style={{ padding: '0.5rem 0', marginBottom: '1rem', background: 'transparent' }} onClick={() => navigate('/members')}>
        <ArrowLeft size={20} />
        Back to Members
      </button>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem' }}>{isEditMode ? 'Edit Member' : 'Add New Member'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              required 
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              required 
              placeholder="+1 234 567 890"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Join Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={formData.join_date}
                onChange={e => setFormData({...formData, join_date: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Plan Duration</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <select className="form-input" style={{ width: '100%' }} value={formData.plan_months} onChange={e => setFormData({...formData, plan_months: parseInt(e.target.value)})}>
                    <option value={0}>0 Months</option>
                    {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1} Month{i > 0 ? 's' : ''}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input type="number" className="form-input" style={{ width: '100%' }} value={formData.plan_days} onChange={e => setFormData({...formData, plan_days: parseInt(e.target.value) || 0})} min="0" max="30" placeholder="Extra Days" />
                  <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', fontSize: '0.875rem' }}>days</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{ padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ color: '#34d399', fontWeight: 600 }}>Live Preview: </span>
            <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 700 }}>Expiry: {calculatePreviewExpiry(formData.join_date, formData.plan_months, formData.plan_days)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total Fee Paid (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={formData.fee !== undefined ? formData.fee : 50}
                onChange={e => setFormData({...formData, fee: parseFloat(e.target.value) || 0})}
                required 
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Amount Paid (₹)</label>
              <input 
                type="number"
                className="form-input"
                value={formData.amount_paid !== undefined ? formData.amount_paid : 0}
                onChange={e => setFormData({...formData, amount_paid: parseFloat(e.target.value) || 0})}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={submitting}>
            <Save size={20} />
            {submitting ? 'Saving...' : 'Save Member'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MemberForm;
