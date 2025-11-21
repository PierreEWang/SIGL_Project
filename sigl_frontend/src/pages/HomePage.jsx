import React from 'react';
import LoginForm from '../components/LoginForm';

const HomePage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Section gauche - Formulaire de connexion */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo et titre */}
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
            <p className="text-gray-600">
              Connectez-vous pour accéder à votre espace étudiant
            </p>
          </div>

          {/* Formulaire */}
          <LoginForm />

          {/* Informations supplémentaires */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Besoin d'aide ? Contactez le support à{' '}
              <a href="mailto:support@izia.fr" className="text-primary-600 hover:underline">
                support@izia.fr
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Section droite - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        {/* Image de fond 
        <div className="absolute inset-0">
          <img
            src="public/images/image_accueil.jpg"
            alt="Étudiants IZIA"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
          */}
        {/* Overlay avec contenu */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6">
              Gérez votre parcours d'apprentissage
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Accédez à tous vos outils en un seul endroit : journaux, entretiens, évaluations et soutenances.
            </p>

            {/* Points clés */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg">Suivi en temps réel de votre progression</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-lg">Gestion simplifiée de vos documents</span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-lg">Communication avec vos tuteurs</span>
              </div>
            </div>

            {/* Citation */}
            <div className="mt-12 p-6 bg-white bg-opacity-10 backdrop-blur-sm rounded-xl border border-white border-opacity-20">
              <p className="text-lg italic mb-2">
                "Une plateforme intuitive qui facilite le suivi de mon alternance au quotidien."
              </p>
              <p className="text-sm text-blue-100">
                - Marie D., Étudiante ESEO 2024
              </p>
            </div>
          </div>
        </div>

        {/* Motifs décoratifs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-48 -mb-48"></div>
      </div>
    </div>
  );
};

export default HomePage;
