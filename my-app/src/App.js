import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import TaskList from './components/TaskList';
import HabitsPage from './components/HabitsPage';
import Home from './components/Home';

function AppContent() {
  const location = useLocation();
  return (
    <>
      <Navbar />  
      
      <div className="container mx-auto p-4">
        <Routes>  
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/habits" element={<HabitsPage />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;