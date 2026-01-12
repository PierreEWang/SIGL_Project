import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';

import CreateJournalPage from './pages/journal/CreateJournalPage';
import CalendarPage from './pages/calendar/CalendarPage';
import EventDetailPage from './pages/calendar/EventDetailPage';
// Entretiens
import MesEntretiensPage from './pages/entretien/MesEntretiensPage';
import DemandeEntretienPage from './pages/entretien/DemandeEntretienPage';
// Soutenances
import MaSoutenancePage from './pages/soutenance/MaSoutenancePage';
import GestionSoutenancesPage from './pages/soutenance/GestionSoutenancesPage';
import PlanifierSoutenancePage from './pages/soutenance/PlanifierSoutenancePage';
import JournalDetailPage from './pages/journal/JournalDetailPage';

import ProfilePage from './pages/profile/ProfilePage'; // ta page profil (branche KC)

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}<Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
        {/* Espace apprenti */}        <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/journal/create" element={<CreateJournalPage />} />
                <Route path="/journal/:id" element={<JournalDetailPage />} />

        {/* Profil utilisateur */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Calendrier global */}
        <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/calendar/event/:id" element={<EventDetailPage />} />
                {/* Entretiens */}
                <Route path="/entretien/liste" element={<MesEntretiensPage />} />
                <Route path="/entretien/demande" element={<DemandeEntretienPage />} />
                {/* Soutenances */}
                <Route path="/soutenance/ma-soutenance" element={<MaSoutenancePage />} />
                <Route path="/soutenance/gestion" element={<GestionSoutenancesPage />} />
                <Route path="/soutenance/planifier" element={<PlanifierSoutenancePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

