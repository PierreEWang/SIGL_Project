// sigl_frontend/src/pages/HomePage.jsx
import React from 'react';
import LoginForm from '../components/LoginForm';

const HomePage = () => {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Colonne gauche : login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo + titre */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">I</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">IZIA</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Bienvenue sur votre plateforme
            </h2>
            <p className="text-sm text-gray-600">
              Connectez-vous pour accéder à vos informations d&apos;apprenti,
              votre journal de bord et le suivi avec vos encadrants.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

      {/* Colonne droite (visuel / texte) */}
      <div className="hidden lg:flex w-1/2 bg-primary-600 text-white items-center justify-center p-8">
        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-bold">Suivi simplifié de votre alternance</h2>
          <p className="text-sm text-primary-100">
            Retrouvez vos journaux de bord, vos évaluations, vos soutenances et vos
            échanges avec vos encadrants au même endroit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;