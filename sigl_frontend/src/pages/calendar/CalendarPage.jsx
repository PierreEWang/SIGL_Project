import React, { useState, useEffect } from 'react';
import CalendarNavigation, { CalendarNavigationMobile } from '../../components/calendar/CalendarNavigation';
import CalendarGrid, { CalendarGridMobile } from '../../components/calendar/CalendarGrid';
import { EventCardList } from '../../components/calendar/EventCard';
import CalendarService from '../../services/calendarService';

/**
 * Page principale du calendrier
 */
const CalendarPage = () => {
  // États du composant
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Détection de la taille d'écran
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Chargement des catégories au montage du composant
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await CalendarService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    };

    loadCategories();
  }, []);

  // Chargement des événements lors du changement de date ou de catégorie
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;

        // Utilisation du cache pour optimiser les performances
        let eventsData = await CalendarService.getCachedEventsByMonth(year, month);

        // Filtrage par catégorie si sélectionnée
        if (selectedCategory) {
          eventsData = eventsData.filter(event => 
            event.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        setEvents(eventsData);
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        setError(error.message);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentDate, selectedCategory]);

  // Gestion du changement de date
  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  // Gestion du changement de catégorie
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Gestion du changement de mode d'affichage
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSelectedCategory('');
    CalendarService.clearCache();
  };

  // Statistiques des événements
  const eventStats = {
    total: events.length,
    byCategory: categories.reduce((acc, category) => {
      acc[category] = events.filter(event => event.category === category).length;
      return acc;
    }, {})
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête de la page */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendrier</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gérez et consultez vos événements
              </p>
            </div>

            {/* Contrôles de la page */}
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              {/* Sélecteur de catégorie */}
              <div className="flex items-center space-x-2">
                <label htmlFor="category-select" className="text-sm font-medium text-gray-700">
                  Catégorie:
                </label>
                <select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                  disabled={loading}
                >
                  <option value="">Toutes</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category} ({eventStats.byCategory[category] || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélecteur de mode d'affichage (desktop uniquement) */}
              {!isMobile && (
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-l-md border
                      ${viewMode === 'grid'
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`
                      px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b
                      ${viewMode === 'list'
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                    `}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Bouton de réinitialisation */}
              {selectedCategory && (
                <button
                  onClick={resetFilters}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={loading}
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              <strong>{eventStats.total}</strong> événement{eventStats.total > 1 ? 's' : ''} ce mois
            </span>
            {selectedCategory && (
              <span>
                Catégorie: <strong>{selectedCategory}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erreur de chargement
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation du calendrier */}
        {isMobile ? (
          <CalendarNavigationMobile
            currentDate={currentDate}
            onDateChange={handleDateChange}
            loading={loading}
          />
        ) : (
          <CalendarNavigation
            currentDate={currentDate}
            onDateChange={handleDateChange}
            loading={loading}
          />
        )}

        {/* Affichage du calendrier */}
        {isMobile ? (
          <CalendarGridMobile
            currentDate={currentDate}
            events={events}
            loading={loading}
          />
        ) : viewMode === 'grid' ? (
          <CalendarGrid
            currentDate={currentDate}
            events={events}
            loading={loading}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Événements de {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <EventCardList
              events={events}
              loading={loading}
              size="large"
              emptyMessage={`Aucun événement${selectedCategory ? ` dans la catégorie "${selectedCategory}"` : ''} pour ce mois.`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;