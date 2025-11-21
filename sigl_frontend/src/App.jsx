import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage'; 
import StudentDashboard from './pages/dashboard/StudentDashboard';
import CreateJournalPage from './pages/journal/CreateJournalPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />  {}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/journal/create" element={<CreateJournalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

