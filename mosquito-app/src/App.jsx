
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import DataIntegration from './pages/DataIntegration';
import FacilityDetail from './pages/FacilityDetail';
import Alerts from './pages/Alerts';
import Map from './pages/Map';
import ReportsAndVerification from './pages/ReportsAndVerification';
import MosquitoDashboard from './pages/MosquitoDashboard';

import DeviceControll from './pages/DeviceControll';
import MosquitoDensityDashboard from './pages/Mosquito_Density/MosquitoDensityDashboard';
import MosquitoInstructions from './pages/Mosquito_Density/MosquitoInstructions';
import { Table } from './pages/Mosquito_Density/Table';
import { M_Reports } from './pages/Mosquito_Density/Reports';
import { SpatialMap } from './pages/Mosquito_Density/SpatialMap';
import { Analysis } from './pages/Mosquito_Density/Analysis';


function App() {
  return (


    <Router>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/data-integration" element={<DataIntegration />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/map" element={<Map />} />
        <Route path="/reports-verification" element={<ReportsAndVerification />} />

        <Route path='/mosquito-dashboard' element={<MosquitoDashboard />} />

        <Route path="/analysis" element={<Analysis />} />
        <Route path="/table" element={<Table />} />
        <Route path="/m_reports" element={<M_Reports />} />
        <Route path="/spatialmap" element={<SpatialMap />} />
        <Route path="/mosquito-density-dashboard" element={<MosquitoDensityDashboard />} />
        <Route path="/mosquito-instructions" element={<MosquitoInstructions />} />
        <Route path = '/mosquito-dashboard' element={<MosquitoDashboard/>} />
        <Route path = '/deviceControll-dashboard' element={<DeviceControll/>} />

      </Routes>
    </Router>

  );
}

export default App;

