import api from './api';

// Instance Axios spécifique pour le calendrier
const calendarApi = api;

/**
 * Service de gestion du calendrier
 * Gère les événements, catégories et cache
 */
class CalendarService {
  // Cache pour optimiser les requêtes
  static cache = {
    events: {},
    categories: null,
    timestamp: {}
  };

  // Durée de validité du cache (5 minutes)
  static CACHE_DURATION = 5 * 60 * 1000;

  /**
   * Vide le cache
   */
  static clearCache() {
    this.cache = {
      events: {},
      categories: null,
      timestamp: {}
    };
  }

  /**
   * Récupère tous les événements
   */
  static async getAllEvents(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await calendarApi.get('/calendar/events', { params });
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des événements');
      }
    } catch (error) {
      console.error('Erreur getAllEvents:', error);
      throw error;
    }
  }

  /**
   * Récupère un événement par son ID
   */
  static async getEventById(id) {
    try {
      const response = await calendarApi.get(`/calendar/events/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Événement non trouvé');
      }
    } catch (error) {
      console.error('Erreur getEventById:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les catégories disponibles
   */
  static async getCategories() {
    try {
      // Utiliser le cache si disponible
      if (this.cache.categories) {
        return this.cache.categories;
      }

      const response = await calendarApi.get('/calendar/categories');
      
      if (response.data.success) {
        this.cache.categories = response.data.data || [];
        return this.cache.categories;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des catégories');
      }
    } catch (error) {
      console.error('Erreur getCategories:', error);
      return ['réunion', 'rendez-vous', 'culturel', 'formation'];
    }
  }

  /**
   * Récupère les événements d'un mois spécifique
   */
  static async getEventsByMonth(year, month) {
    try {
      const response = await calendarApi.get(`/calendar/events/month/${year}/${month}`);
      
      if (response.data.success) {
        return response.data.data || [];
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des événements du mois');
      }
    } catch (error) {
      console.error('Erreur getEventsByMonth:', error);
      throw error;
    }
  }

  /**
   * Récupère les événements avec cache
   */
  static async getCachedEventsByMonth(year, month) {
    const cacheKey = `${year}-${month}`;
    const now = Date.now();

    if (
      this.cache.events[cacheKey] &&
      this.cache.timestamp[cacheKey] &&
      (now - this.cache.timestamp[cacheKey] < this.CACHE_DURATION)
    ) {
      return this.cache.events[cacheKey];
    }

    const events = await this.getEventsByMonth(year, month);
    this.cache.events[cacheKey] = events;
    this.cache.timestamp[cacheKey] = now;

    return events;
  }

  /**
   * Crée un nouvel événement pour l'utilisateur connecté
   */
  static async createEvent(eventData) {
    try {
      const response = await calendarApi.post('/calendar/my-events', eventData);
      if (response.data.success) {
        this.clearCache(); // Vider le cache
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erreur lors de la création de l\'événement');
      }
    } catch (error) {
      console.error('Erreur createEvent:', error);
      throw error;
    }
  }

  /**
   * Récupère les événements de l'utilisateur connecté
   */
  static async getMyEvents() {
    try {
      const response = await calendarApi.get('/calendar/my-events');
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erreur lors de la récupération des événements');
      }
    } catch (error) {
      console.error('Erreur getMyEvents:', error);
      throw error;
    }
  }

  /**
   * Met à jour un événement
   */
  static async updateEvent(eventId, eventData) {
    try {
      const response = await calendarApi.put(`/calendar/my-events/${eventId}`, eventData);
      if (response.data.success) {
        this.clearCache();
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur updateEvent:', error);
      throw error;
    }
  }

  /**
   * Supprime un événement
   */
  static async deleteEvent(eventId) {
    try {
      const response = await calendarApi.delete(`/calendar/my-events/${eventId}`);
      if (response.data.success) {
        this.clearCache();
        return true;
      } else {
        throw new Error(response.data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur deleteEvent:', error);
      throw error;
    }
  }

  /**
   * Groupe les événements par date
   */
  static groupEventsByDate(events) {
    return events.reduce((acc, event) => {
      const dateKey = event.date; // Format YYYY-MM-DD
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(event);
      return acc;
    }, {});
  }

  /**
   * Formate une date au format français
   */
  static formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Formate une heure au format français
   */
  static formatTime(timeString) {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}h${minutes}`;
    } catch (error) {
      return timeString;
    }
  }

  /**
   * Retourne les couleurs pour une catégorie
   */
  static getCategoryColor(category) {
    const colors = {
      'réunion': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-300',
        dot: 'bg-blue-500'
      },
      'rendez-vous': {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-300',
        dot: 'bg-purple-500'
      },
      'culturel': {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-300',
        dot: 'bg-pink-500'
      },
      'formation': {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        dot: 'bg-green-500'
      }
    };

    return colors[category?.toLowerCase()] || colors['formation'];
  }
}

export default CalendarService;