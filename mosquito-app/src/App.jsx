import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import DataIntegration from './pages/DataIntegration';
import FacilityDetail from './pages/FacilityDetail';
import { DashboardHome } from './pages/Mosquito_Density/DashboardHome';
import { ForecastChart } from './pages/Mosquito_Density/ForecastChart';
import { SpatialMap } from './pages/Mosquito_Density/SpatialMap';
import { Reports } from './pages/Mosquito_Density/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/data-integration" element={<DataIntegration />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />

        {/* mosquito density */}
        <Route path="/dashboardHome" element={<DashboardHome />} />
        <Route path="/forecast" element={<ForecastChart />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/map" element={<SpatialMap />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
