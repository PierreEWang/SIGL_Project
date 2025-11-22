import React from 'react';

/**
 * Composant CalendarNavigation - Navigation pour le calendrier
 * @param {Date} currentDate - Date actuellement affichée
 * @param {Function} onDateChange - Callback appelé lors du changement de date
 * @param {boolean} loading - État de chargement
 */
const CalendarNavigation = ({ currentDate, onDateChange, loading = false }) => {
  
  // Noms des mois en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // Navigation vers le mois précédent
  const goToPreviousMonth = () => {
    if (loading) return;
    
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  // Navigation vers le mois suivant
  const goToNextMonth = () => {
    if (loading) return;
    
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  // Navigation vers le mois actuel
  const goToToday = () => {
    if (loading) return;
    onDateChange(new Date());
  };

  // Navigation vers une année spécifique
  const goToYear = (year) => {
    if (loading) return;
    
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    onDateChange(newDate);
  };

  // Navigation vers un mois spécifique
  const goToMonth = (monthIndex) => {
    if (loading) return;
    
    const newDate = new Date(currentDate);
    newDate.setMonth(monthIndex);
    onDateChange(newDate);
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // Génération des années (5 ans avant et après l'année courante)
  const currentYearNum = new Date().getFullYear();
  const years = [];
  for (let i = currentYearNum - 5; i <= currentYearNum + 5; i++) {
    years.push(i);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Navigation principale */}
      <div className="flex items-center justify-between mb-4">
        {/* Bouton mois précédent */}
        <button
          onClick={goToPreviousMonth}
          disabled={loading}
          className={`
            flex items-center justify-center w-10 h-10 rounded-full
            transition-all duration-200
            ${loading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
            }
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          `}
          aria-label="Mois précédent"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Affichage du mois et année actuels */}
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          
          {/* Bouton "Aujourd'hui" */}
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              disabled={loading}
              className={`
                px-3 py-1 text-sm rounded-full border
                transition-all duration-200
                ${loading
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              `}
            >
              Aujourd'hui
            </button>
          )}
        </div>

        {/* Bouton mois suivant */}
        <button
          onClick={goToNextMonth}
          disabled={loading}
          className={`
            flex items-center justify-center w-10 h-10 rounded-full
            transition-all duration-200
            ${loading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900'
            }
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          `}
          aria-label="Mois suivant"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Navigation rapide par mois */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {monthNames.map((monthName, index) => (
          <button
            key={index}
            onClick={() => goToMonth(index)}
            disabled={loading}
            className={`
              px-2 py-1 text-xs rounded transition-all duration-200
              ${index === currentMonth
                ? 'bg-primary-500 text-white'
                : loading
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
            `}
          >
            {monthName.substring(0, 3)}
          </button>
        ))}
      </div>

      {/* Navigation rapide par année */}
      <div className="flex items-center justify-center space-x-1">
        <span className="text-sm text-gray-500 mr-2">Année:</span>
        <div className="flex flex-wrap gap-1">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => goToYear(year)}
              disabled={loading}
              className={`
                px-2 py-1 text-xs rounded transition-all duration-200
                ${year === currentYear
                  ? 'bg-primary-500 text-white'
                  : loading
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
              `}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            <span>Chargement des événements...</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Composant CalendarNavigationMobile - Version mobile simplifiée
 */
export const CalendarNavigationMobile = ({ currentDate, onDateChange, loading = false }) => {
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const goToPreviousMonth = () => {
    if (loading) return;
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    if (loading) return;
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    if (loading) return;
    onDateChange(new Date());
  };

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const today = new Date();
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
      <div className="flex items-center justify-between">
        {/* Bouton précédent */}
        <button
          onClick={goToPreviousMonth}
          disabled={loading}
          className={`
            flex items-center justify-center w-8 h-8 rounded-full
            ${loading 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Titre et bouton aujourd'hui */}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              disabled={loading}
              className={`
                text-xs px-2 py-1 rounded-full mt-1
                ${loading
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-primary-50 text-primary-700'
                }
              `}
            >
              Aujourd'hui
            </button>
          )}
        </div>

        {/* Bouton suivant */}
        <button
          onClick={goToNextMonth}
          disabled={loading}
          className={`
            flex items-center justify-center w-8 h-8 rounded-full
            ${loading 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }
          `}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {loading && (
        <div className="mt-2 flex items-center justify-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default CalendarNavigation;