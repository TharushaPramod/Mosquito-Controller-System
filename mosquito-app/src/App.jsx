import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Mosquito_Dashboard from './Pages/Mosquito_Dashboard';
import Home from './Pages/Home';


function App() {
  return (
    <div >
      <Routes>
        <Route path="/" element={< Home/>}></Route>
         <Route path="/dashboard" element={< Mosquito_Dashboard/>}></Route>

      </Routes>
    
    </div>
  )
}

export default App
