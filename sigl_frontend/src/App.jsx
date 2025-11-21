import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import CreateJournalPage from './pages/journal/CreateJournalPage';
import JournalDetailPage from './pages/journal/JournalDetailPage';
import ProfilePage from './pages/profile/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Dashboard étudiant */}
        <Route path="/dashboard" element={<StudentDashboard />} />

        {/* Journal de formation */}
        <Route path="/journal/create" element={<CreateJournalPage />} />
        <Route path="/journal/:id" element={<JournalDetailPage />} />

        {/* Profil utilisateur */}
        <Route path="/profile" element={<ProfilePage />} />  {/* ⬅️ ajout */}

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;