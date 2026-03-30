import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MembersList from './pages/MembersList';
import MemberForm from './pages/MemberForm';
import { Menu } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content fade-in">
        <div className="flex-between mobile-toggle">
           <button onClick={() => setSidebarOpen(true)} className="btn btn-primary" style={{ padding: '0.5rem' }}>
              <Menu size={24} />
           </button>
           <div className="logo d-flex align-items-center" style={{ fontWeight: 700, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              GymFlex
           </div>
        </div>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
        <Route path="/members" element={<PrivateRoute><AppLayout><MembersList /></AppLayout></PrivateRoute>} />
        <Route path="/members/new" element={<PrivateRoute><AppLayout><MemberForm /></AppLayout></PrivateRoute>} />
        <Route path="/members/edit/:id" element={<PrivateRoute><AppLayout><MemberForm /></AppLayout></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
