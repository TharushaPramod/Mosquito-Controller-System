import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import DataIntegration from './pages/DataIntegration';
import FacilityDetail from './pages/FacilityDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/data-integration" element={<DataIntegration />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
