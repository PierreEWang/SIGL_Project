import React from 'react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
              <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-2xl">I</span>
            </div>
            <h1 className="text-2xl font-bold text-white">IZIA</h1>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-white/80 hover:text-white transition duration-300 font-medium">Accueil</a>
            <a href="#" className="text-white/80 hover:text-white transition duration-300 font-medium">À propos</a>
            <a href="#" className="text-white/80 hover:text-white transition duration-300 font-medium">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
