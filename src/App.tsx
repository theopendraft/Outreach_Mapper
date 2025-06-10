// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '././pages/dashboard';
import MapPage from '././pages/map';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Navigate to="/map" />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    
  );
}

export default App;
