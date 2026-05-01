import { Link, useLocation } from 'react-router-dom';
import React from 'react';

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="navbar navbar-expand-lg shadow navbar-light bg-white px-5 d-flex align-items-center justify-content-between" style={{ minHeight: 72 }}>
      <div className="d-flex align-items-center gap-3">
        <img src="/consistent-logo.png" alt="Consistency Logo" style={{ height: 80, width: 80, objectFit: 'contain' }} />
      </div>
      <div className="d-flex align-items-center gap-2">
        <Link
          to="/tasks"
          className={`px-4 py-2 btn btn-outline-primary${location.pathname === '/tasks' ? ' active' : ''}`}
        >
          Tasks
        </Link>
        <Link
          to="/habits"
          className={`px-4 py-2 btn btn-outline-primary${location.pathname === '/habits' ? ' active' : ''}`}
        >
          Habits
        </Link>
      </div>
    </nav>
  );
}