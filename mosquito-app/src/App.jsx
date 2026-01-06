
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import DataIntegration from './pages/DataIntegration';
import FacilityDetail from './pages/FacilityDetail';
import Alerts from './pages/Alerts';
//import Map from './pages/Map';
import Reports from './pages/Reports';
import MosquitoDashboard from './pages/MosquitoDashboard';
import Sidebar from './components/Layout/Sidebar';

function App() {
  return (
   
      
    <Router>
      <Sidebar/>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/data-integration" element={<DataIntegration />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />
        <Route path="/alerts" element={<Alerts />} />
        //<Route path="/map" element={<Map />} />
        <Route path="/reports" element={<Reports />} />

        <Route path = '/mosquito-dashboard' element={<MosquitoDashboard/>} />
      </Routes>
    </Router>
   
  );
}

export default App;

