import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import CalendarService from '../../services/calendarService';

/**
 * Composant CalendarGrid - Grille mensuelle du calendrier
 * @param {Date} currentDate - Date actuellement affichée
 * @param {Array} events - Liste des événements du mois
 * @param {boolean} loading - État de chargement
 */
const CalendarGrid = ({ currentDate, events = [], loading = false }) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoveredPosition, setHoveredPosition] = useState({ x: 0, y: 0 });

  // Noms des jours de la semaine en français (lundi en premier)
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const dayNamesFull = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  // Génération des jours du mois
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Premier jour du mois
    const firstDay = new Date(year, month, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, month + 1, 0);
    
    // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
    // Ajustement pour que lundi soit 0
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    const daysInMonth = lastDay.getDate();
    const days = [];
    
    // Jours du mois précédent pour compléter la première semaine
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        fullDate: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        isPrevMonth: false,
        fullDate: new Date(year, month, day)
      });
    }
    
    // Jours du mois suivant pour compléter la dernière semaine
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    
    for (let i = days.length; i < totalCells; i++) {
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isPrevMonth: false,
        fullDate: new Date(year, month + 1, nextMonthDay)
      });
      nextMonthDay++;
    }
    
    return days;
  };

  // Groupement des événements par date
  const eventsByDate = CalendarService.groupEventsByDate(events);

  // Obtenir les événements d'une date spécifique
  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return eventsByDate[dateString] || [];
  };

  // Vérifier si une date est aujourd'hui
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Gestion du survol des événements
  const handleEventHover = (event, mouseEvent) => {
    setHoveredEvent(event);
    setHoveredPosition({
      x: mouseEvent.clientX,
      y: mouseEvent.clientY
    });
  };

  const handleEventLeave = () => {
    setHoveredEvent(null);
  };

  // Mise à jour de la position du tooltip lors du mouvement de la souris
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (hoveredEvent) {
        setHoveredPosition({
          x: e.clientX,
          y: e.clientY
        });
      }
    };

    if (hoveredEvent) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [hoveredEvent]);

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="animate-pulse">
          {/* En-têtes des jours */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day, index) => (
              <div key={index} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
          
          {/* Grille des jours */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, index) => (
              <div key={index} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* En-têtes des jours de la semaine */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {dayNames.map((day, index) => (
          <div
            key={index}
            className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            <span className="hidden sm:inline">{dayNamesFull[index]}</span>
            <span className="sm:hidden">{day}</span>
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.fullDate);
          const isCurrentDay = isToday(day.fullDate);
          
          return (
            <div
              key={index}
              className={`
                min-h-24 sm:min-h-32 p-2 border-r border-b border-gray-200 
                last:border-r-0 relative
                ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                ${isCurrentDay ? 'bg-blue-50' : ''}
              `}
            >
              {/* Numéro du jour */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-sm font-medium
                    ${day.isCurrentMonth 
                      ? isCurrentDay 
                        ? 'text-blue-600 font-bold' 
                        : 'text-gray-900'
                      : 'text-gray-400'
                    }
                  `}
                >
                  {day.date}
                </span>
                
                {/* Indicateur du nombre d'événements */}
                {dayEvents.length > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-800 px-1 rounded-full">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Liste des événements */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded cursor-pointer
                      ${CalendarService.getCategoryColor(event.category).bg}
                      ${CalendarService.getCategoryColor(event.category).text}
                      border-l-2 ${CalendarService.getCategoryColor(event.category).border}
                      hover:shadow-sm transition-shadow duration-200
                    `}
                    onMouseEnter={(e) => handleEventHover(event, e)}
                    onMouseLeave={handleEventLeave}
                    onClick={() => {
                      // Navigation vers la page de détail de l'événement
                      window.location.href = `/calendar/event/${event.id}`;
                    }}
                  >
                    <div className="font-medium truncate">
                      {event.title}
                    </div>
                    {event.time && (
                      <div className="opacity-75">
                        {CalendarService.formatTime(event.time)}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Indicateur d'événements supplémentaires */}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{dayEvents.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tooltip pour l'aperçu des événements */}
      {hoveredEvent && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: hoveredPosition.x + 10,
            top: hoveredPosition.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
            <EventCard 
              event={hoveredEvent} 
              isPreview={true} 
              size="medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Composant CalendarGridMobile - Version mobile du calendrier
 */
export const CalendarGridMobile = ({ currentDate, events = [], loading = false }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  // Génération des jours du mois pour mobile
  const generateMobileDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      days.push({
        date: day,
        fullDate,
        events: CalendarService.groupEventsByDate(events)[fullDate.toISOString().split('T')[0]] || []
      });
    }

    return days;
  };

  const mobileDays = generateMobileDays();

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-gray-100 h-16 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {mobileDays.map((day) => {
        const isToday = day.fullDate.toDateString() === new Date().toDateString();
        const hasEvents = day.events.length > 0;

        return (
          <div
            key={day.date}
            className={`
              bg-white rounded-lg border p-3
              ${isToday ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
              ${hasEvents ? 'shadow-sm' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span
                  className={`
                    text-lg font-bold
                    ${isToday ? 'text-blue-600' : 'text-gray-900'}
                  `}
                >
                  {day.date}
                </span>
                <span className="text-sm text-gray-500">
                  {day.fullDate.toLocaleDateString('fr-FR', { weekday: 'long' })}
                </span>
              </div>
              
              {hasEvents && (
                <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                  {day.events.length} événement{day.events.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {hasEvents && (
              <div className="space-y-1">
                {day.events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    size="small"
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;