import React, { useState, useEffect } from 'react';
import { getDashboard } from '../api';
import { Users, AlertTriangle, MessageCircle, Activity, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({ totalMembers: 0, expiringCount: 0, expiringMembers: [], counts: { paid: 0, partial: 0, pending: 0, overdue: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemind = (member) => {
    const message = `Hi ${member.name}, your gym membership expires on ${member.expiry_date}. Please renew your plan.`;
    const phone = member.phone.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return 0;
    return Number.isInteger(val) ? val.toString() : val.toFixed(2);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="page-header flex-between mb-4">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="text-muted" style={{color: 'var(--text-muted)'}}>Welcome back, Admin</p>
        </div>
      </div>

      <div className="dash-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card glass-panel fade-in">
          <div className="flex-between">
             <span className="stat-title">Total Members</span>
             <Users size={24} color="var(--primary)" />
          </div>
          <div className="stat-value">{data.totalMembers || 0}</div>
        </div>
        
        <div className="stat-card glass-panel fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex-between">
             <span className="stat-title">Active Members</span>
             <Activity size={24} color="#10b981" />
          </div>
          <div className="stat-value">{data.activeMembers || 0}</div>
        </div>

        <div className="stat-card glass-panel fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex-between">
             <span className="stat-title">Expiring Soon</span>
             <AlertTriangle size={24} color="var(--danger)" />
          </div>
          <div className="stat-value">{data.expiringCount || 0}</div>
        </div>

        <div className="stat-card glass-panel fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex-between">
             <span className="stat-title">Monthly Revenue</span>
             <DollarSign size={24} color="#fbbf24" />
          </div>
          <div className="stat-value">₹{formatCurrency(data.monthlyRevenue)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="stat-card fade-in" style={{ animationDelay: '0.2s', borderLeft: '4px solid #10b981' }}>
          <div className="stat-title">Paid Members</div>
          <div className="stat-value" style={{ color: '#10b981' }}>{data.counts?.paid || 0}</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.3s', borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-title">Partial Payments</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{data.counts?.partial || 0}</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.4s', borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-title">Pending</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{data.counts?.pending || 0}</div>
        </div>
        <div className="stat-card fade-in" style={{ animationDelay: '0.5s', borderLeft: '4px solid #ef4444' }}>
          <div className="stat-title">Overdue Members</div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{data.counts?.overdue || 0}</div>
        </div>
      </div>

      <div className="glass-panel fade-in" style={{ animationDelay: '0.4s', padding: '1.5rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={20} color="var(--primary)" /> Members Growth
        </h3>
        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.growthData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--text-main)', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="members" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Message removed in favor of direct WhatsApp redirect */}

      <div className="glass-panel fade-in" style={{ animationDelay: '0.5s' }}>
        <div className="flex-between" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h3>Expiring Members</h3>
          <Link to="/members" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>View All</Link>
        </div>
        
        {data.expiringMembers.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No members expiring soon.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.expiringMembers.map(member => (
                  <tr key={member.id}>
                    <td style={{ fontWeight: 500 }}>{member.name}</td>
                    <td>{member.phone}</td>
                    <td>{member.expiry_date}</td>
                    <td>
                       <span className={`status-badge ${new Date(member.expiry_date) < new Date() ? 'status-expired' : 'status-pending'}`}>
                          {new Date(member.expiry_date) < new Date() ? 'Expired' : 'Expiring Soon'}
                       </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.875rem' }}
                        onClick={() => handleRemind(member)}
                      >
                        <MessageCircle size={16} />
                        Remind
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
