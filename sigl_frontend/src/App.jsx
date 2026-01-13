import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TutorDashboard from './pages/dashboard/TutorDashboard';

import CreateJournalPage from './pages/journal/CreateJournalPage';
import JournalDetailPage from './pages/journal/JournalDetailPage';

import ProfilePage from './pages/profile/ProfilePage'; // ta page profil (branche KC)
import CalendarPage from './pages/calendar/CalendarPage'; // branche calendrier
import EventDetailPage from './pages/calendar/EventDetailPage'; // branche calendrier

import DemandeEntretienPage from './pages/entretien/DemandeEntretienPage';
import MesEntretiensPage from './pages/entretien/MesEntretiensPage';
import PlanifierSoutenancePage from './pages/soutenance/PlanifierSoutenancePage';
import MaSoutenancePage from './pages/soutenance/MaSoutenancePage';
import GestionSoutenancesPage from './pages/soutenance/GestionSoutenancesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Espace apprenti */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        
        {/* Espace tuteur */}
        <Route path="/dashboard/tuteur" element={<TutorDashboard />} />
        
        <Route path="/journal/create" element={<CreateJournalPage />} />
        <Route path="/journal/:id" element={<JournalDetailPage />} />

        {/* Profil utilisateur */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Calendrier global */}
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/calendar/event/:id" element={<EventDetailPage />} />

        {/* Entretien routes */}
        <Route path="/entretien/demande" element={<DemandeEntretienPage />} />
        <Route path="/entretien/mes-entretiens" element={<MesEntretiensPage />} />

        {/* Soutenance routes */}
        <Route path="/soutenance/planifier" element={<PlanifierSoutenancePage />} />
        <Route path="/soutenance/ma-soutenance" element={<MaSoutenancePage />} />
        <Route path="/soutenance/gestion" element={<GestionSoutenancesPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
