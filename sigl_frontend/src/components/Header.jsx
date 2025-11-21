import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">I</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">IZIA</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-primary-600 transition">Accueil</a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition">À propos</a>
            <a href="#" className="text-gray-600 hover:text-primary-600 transition">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
