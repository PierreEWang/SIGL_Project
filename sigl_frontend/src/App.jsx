import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TutorDashboard from './pages/dashboard/TutorDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import DashboardRedirect from './components/DashboardRedirect';

import CreateJournalPage from './pages/journal/CreateJournalPage';
import JournalDetailPage from './pages/journal/JournalDetailPage';

import ProfilePage from './pages/profile/ProfilePage';
import CalendarPage from './pages/calendar/CalendarPage';
import EventDetailPage from './pages/calendar/EventDetailPage';

import DocumentsPage from './pages/documents/DocumentsPage';
import DocumentDetailPage from './pages/documents/DocumentDetailPage';
import DocumentCreatePage from './pages/documents/DocumentCreatePage';

import EntretienPage from './pages/entretien/EntretienPage';
import PlanificationEntretienPage from './pages/entretien/PlanificationEntretienPage';
import CreerEntretienPage from './pages/entretien/CreerEntretienPage';
import DetailEntretienPage from './pages/entretien/DetailEntretienPage';

import DemandeEntretienPage from './pages/entretien/DemandeEntretienPage';
import MesEntretiensPage from './pages/entretien/MesEntretiensPage';
import PlanifierSoutenancePage from './pages/soutenance/PlanifierSoutenancePage';
import MaSoutenancePage from './pages/soutenance/MaSoutenancePage';
import GestionSoutenancesPage from './pages/soutenance/GestionSoutenancesPage';

import EvaluationForm from './pages/evaluation/EvaluationForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Espace apprenti */}
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard />
            </ProtectedAdminRoute>
          }
        />
        <Route path="/tuteur-dashboard" element={<TutorDashboard />} />
        <Route path="/journal/create" element={<CreateJournalPage />} />
        <Route path="/journal/:id" element={<JournalDetailPage />} />

        {/* Profil utilisateur */}
        <Route path="/profile" element={<ProfilePage />} />

        {/* Calendrier global */}
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/calendar/event/:id" element={<EventDetailPage />} />

        {/* Documents */}
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/documents/create" element={<DocumentCreatePage />} />
        <Route path="/documents/:id" element={<DocumentDetailPage />} />

        {/* Entretiens */}
        <Route path="/entretiens" element={<EntretienPage />} />
        <Route path="/entretien/demander" element={<DemandeEntretienPage />} />
        <Route path="/entretiens/creer" element={<CreerEntretienPage />} />
        <Route path="/entretiens/:entretienId" element={<DetailEntretienPage />} />
        <Route path="/entretiens/:entretienId/planification" element={<PlanificationEntretienPage />} />

        {/* Évaluations */}
        <Route path="/evaluations/create" element={<EvaluationForm />} />
        <Route path="/evaluations/create/:entretienId" element={<EvaluationForm />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;