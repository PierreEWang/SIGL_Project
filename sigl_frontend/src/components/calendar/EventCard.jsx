import React from 'react';
import { useNavigate } from 'react-router-dom';
import CalendarService from '../../services/calendarService';

/**
 * Composant EventCard - Affiche un événement individuel
 * @param {Object} event - Données de l'événement
 * @param {boolean} isPreview - Mode aperçu (pour hover)
 * @param {string} size - Taille du composant ('small', 'medium', 'large')
 */
const EventCard = ({ event, isPreview = false, size = 'medium' }) => {
  const navigate = useNavigate();

  if (!event) return null;

  const colors = CalendarService.getCategoryColor(event.category);
  
  // Classes CSS selon la taille
  const sizeClasses = {
    small: {
      container: 'p-2 text-xs',
      title: 'font-medium truncate',
      time: 'text-xs',
      location: 'text-xs truncate'
    },
    medium: {
      container: 'p-3 text-sm',
      title: 'font-semibold',
      time: 'text-sm',
      location: 'text-sm'
    },
    large: {
      container: 'p-4 text-base',
      title: 'font-bold text-lg',
      time: 'text-base',
      location: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  // Gestion du clic sur l'événement
  const handleClick = (e) => {
    e.stopPropagation();
    if (!isPreview) {
      // Si c'est un événement entretien, naviguer vers la page d'entretien
      if (event.entretienId) {
        navigate(`/entretiens/${event.entretienId}`);
      } else {
        navigate(`/calendar/event/${event.id}`);
      }
    }
  };

  // Formatage de l'heure
  const formattedTime = CalendarService.formatTime(event.time);

  return (
    <div
      className={`
        ${colors.bg} ${colors.border} ${colors.text}
        border-l-4 rounded-r-md shadow-sm
        ${classes.container}
        ${isPreview ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}
        transition-all duration-200
        ${!isPreview ? 'hover:scale-105' : ''}
      `}
      onClick={handleClick}
      role={isPreview ? 'tooltip' : 'button'}
      tabIndex={isPreview ? -1 : 0}
      onKeyDown={(e) => {
        if (!isPreview && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick(e);
        }
      }}
    >
      {/* Indicateur de catégorie */}
      <div className="flex items-start gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${colors.dot} flex-shrink-0 mt-1`} />
        <div className="flex-1 min-w-0">
          {/* Titre de l'événement */}
          <h3 className={`${classes.title} leading-tight`}>
            {event.title}
          </h3>
        </div>
      </div>

      {/* Heure */}
      {event.time && (
        <div className={`${classes.time} opacity-80 mb-1 flex items-center gap-1`}>
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span>{formattedTime}</span>
        </div>
      )}

      {/* Lieu (affiché selon la taille) */}
      {event.location && size !== 'small' && (
        <div className={`${classes.location} opacity-70 flex items-start gap-1`}>
          <svg className="w-3 h-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="leading-tight">{event.location}</span>
        </div>
      )}

      {/* Description (uniquement en mode large ou preview) */}
      {event.description && (size === 'large' || isPreview) && (
        <div className="mt-2 pt-2 border-t border-current border-opacity-20">
          <p className={`${classes.container} opacity-80 leading-relaxed`}>
            {event.description.length > 100 && size !== 'large' 
              ? `${event.description.substring(0, 100)}...`
              : event.description
            }
          </p>
        </div>
      )}

      {/* Badge catégorie (uniquement en mode large) */}
      {size === 'large' && (
        <div className="mt-3 flex justify-between items-center">
          <span className={`
            px-2 py-1 rounded-full text-xs font-medium
            ${colors.bg} ${colors.text} border ${colors.border}
          `}>
            {event.category}
          </span>
          
          {/* Date formatée */}
          <span className="text-xs opacity-60">
            {CalendarService.formatDate(event.date)}
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Composant EventCardSkeleton - Placeholder pendant le chargement
 */
export const EventCardSkeleton = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-16',
    medium: 'h-20',
    large: 'h-32'
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      bg-gray-100 border-l-4 border-gray-300 rounded-r-md
      p-3 animate-pulse
    `}>
      <div className="flex items-start gap-2 mb-2">
        <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0 mt-1" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-1" />
          <div className="h-3 bg-gray-300 rounded w-1/2" />
        </div>
      </div>
      {size !== 'small' && (
        <div className="h-3 bg-gray-300 rounded w-2/3" />
      )}
    </div>
  );
};

/**
 * Composant EventCardList - Liste d'événements
 */
export const EventCardList = ({ events, loading = false, size = 'medium', emptyMessage = "Aucun événement" }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, index) => (
          <EventCardSkeleton key={index} size={size} />
        ))}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event} 
          size={size}
        />
      ))}
    </div>
  );
};

export default EventCard;