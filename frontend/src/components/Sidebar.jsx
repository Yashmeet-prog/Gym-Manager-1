import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="flex-between">
          <div className="logo">
            <Dumbbell size={28} />
            GymFlex
          </div>
          <button className="mobile-toggle lg-hidden" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="nav-links">
          <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} end onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>
          <NavLink to="/members" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => window.innerWidth <= 768 && toggleSidebar()}>
            <Users size={20} />
            Members
          </NavLink>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 lg-hidden z-40" 
          onClick={toggleSidebar}
          style={{ position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}
    </>
  );
};

export default Sidebar;
