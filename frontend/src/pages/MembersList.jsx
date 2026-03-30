import React, { useState, useEffect } from 'react';
import { getMembers, deleteMember } from '../api';
import { Plus, Edit2, Trash2, Search, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MembersList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await deleteMember(id);
        fetchMembers();
      } catch (err) {
        console.error(err);
        alert('Failed to delete member');
      }
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.phone.includes(searchTerm)
  );

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return 0;
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  };

  const handleRemindClick = (member) => {
      let msg = "";
      if (member.computed_status === 'Overdue') {
          msg = `Hi ${member.name}, your gym membership has expired. Please renew as soon as possible to continue training.`;
      } else if (member.computed_status === 'Pending' || member.computed_status === 'Partial') {
          msg = `Hi ${member.name}, your gym membership payment is pending. Please complete it to continue your access.`;
      } else {
          msg = `Hi ${member.name}, your gym membership expires on ${member.expiry_date}. Renew soon to avoid interruption 💪`;
      }
      
      let phone = member.phone.replace(/[^\d+]/g, '');
      if (!phone.startsWith('+')) phone = '+91' + phone.replace(/^0+/, ''); // Default country code if pure numeric

      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="fade-in">
      <div className="page-header flex-between mb-4" style={{ marginBottom: '2rem' }}>
        <h2>Members Directory</h2>
        <Link to="/members/new" className="btn btn-primary">
          <Plus size={20} />
          Add Member
        </Link>
      </div>

      <div className="glass-panel">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search members by name or phone..." 
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Join Date</th>
                <th>Plan</th>
                <th>Expiry Date</th>
                <th>Total Fee (₹)</th>
                <th>Monthly Cont. (₹)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => {
                  const isExpired = new Date(member.expiry_date) < new Date();
                  const isExpiringSoon = !isExpired && new Date(member.expiry_date) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                  const showRemind = isExpired || isExpiringSoon;
                  const rowStyle = isExpired ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' } : (isExpiringSoon ? { backgroundColor: 'rgba(245, 158, 11, 0.1)' } : {});
                  
                  return (
                  <tr key={member.id} style={rowStyle}>
                    <td>#{member.id}</td>
                    <td style={{ fontWeight: 500 }}>{member.name}</td>
                    <td>{member.phone}</td>
                    <td>{member.join_date}</td>
                    <td>{(() => {
                        const m = member.plan_months || 0;
                        const d = member.plan_days || 0;
                        let str = "";
                        if (m > 0) str += `${m}M `;
                        if (d > 0) str += `${d}D`;
                        return str.trim() || 'Custom';
                    })()}</td>
                    <td>{member.expiry_date}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{formatCurrency(member.fee)}</td>
                    <td style={{ color: '#fbbf24' }}>₹{formatCurrency(member.monthly_revenue)}</td>
                    <td>
                      {(() => {
                          const status = member.computed_status;
                          let bg = 'transparent', color = 'inherit';
                          if (status === 'Paid') { bg = 'rgba(16, 185, 129, 0.15)'; color = '#10b981'; }
                          else if (status === 'Partial') { bg = 'rgba(59, 130, 246, 0.15)'; color = '#3b82f6'; }
                          else if (status === 'Pending') { bg = 'rgba(245, 158, 11, 0.15)'; color = '#f59e0b'; }
                          else if (status === 'Overdue') { bg = 'rgba(239, 68, 68, 0.15)'; color = '#ef4444'; }
                          return (
                              <span style={{ backgroundColor: bg, color, padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600 }}>
                                  {status}
                              </span>
                          );
                      })()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {showRemind && (
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }} 
                            onClick={() => handleRemindClick(member)}
                          >
                            <MessageCircle size={14} /> Remind
                          </button>
                        )}
                        <Link to={`/members/edit/${member.id}`} className="btn" style={{ padding: '0.4rem', background: 'rgba(255,255,255,0.1)' }}>
                          <Edit2 size={16} />
                        </Link>
                        <button className="btn" style={{ padding: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }} onClick={() => handleDelete(member.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembersList;
