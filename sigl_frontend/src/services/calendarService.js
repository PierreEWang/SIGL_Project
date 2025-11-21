import axios from 'axios';

// Configuration de base pour l'API calendrier
const CALENDAR_API_BASE_URL = 'http://localhost:3000/api/calendar';

// Instance axios spécifique pour le calendrier
const calendarApi = axios.create({
  baseURL: CALENDAR_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour gérer les erreurs
calendarApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erreur API Calendrier:', error);
    
    // Gestion des erreurs réseau
    if (!error.response) {
      throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
    }
    
    // Gestion des erreurs HTTP
    switch (error.response.status) {
      case 404:
        throw new Error('Ressource non trouvée.');
      case 500:
        throw new Error('Erreur interne du serveur. Veuillez réessayer plus tard.');
      default:
        throw new Error(error.response.data?.message || 'Une erreur est survenue.');
    }
  }
);

/**
 * Service pour la gestion des événements du calendrier
 */
class CalendarService {
  
  /**
   * Récupère tous les événements
   * @param {string} category - Catégorie optionnelle pour filtrer les événements
   * @returns {Promise<Array>} Liste des événements
   */
  static async getAllEvents(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await calendarApi.get('/events', { params });
      
      if (response.data.success) {
        return response.data.data;
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
   * @param {number} id - ID de l'événement
   * @returns {Promise<Object>} Données de l'événement
   */
  static async getEventById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('ID d\'événement invalide');
      }

      const response = await calendarApi.get(`/events/${id}`);
      
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
   * Récupère les événements d'un mois spécifique
   * @param {number} year - Année
   * @param {number} month - Mois (1-12)
   * @returns {Promise<Array>} Liste des événements du mois
   */
  static async getEventsByMonth(year, month) {
    try {
      if (!year || !month || isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        throw new Error('Paramètres de date invalides');
      }

      const response = await calendarApi.get(`/events/month/${year}/${month}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des événements du mois');
      }
    } catch (error) {
      console.error('Erreur getEventsByMonth:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les catégories disponibles
   * @returns {Promise<Array>} Liste des catégories
   */
  static async getCategories() {
    try {
      const response = await calendarApi.get('/categories');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erreur lors de la récupération des catégories');
      }
    } catch (error) {
      console.error('Erreur getCategories:', error);
      throw error;
    }
  }

  /**
   * Formate une date pour l'affichage en français
   * @param {string} dateString - Date au format ISO
   * @returns {string} Date formatée
   */
  static formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return dateString;
    }
  }

  /**
   * Formate une heure pour l'affichage
   * @param {string} timeString - Heure au format HH:MM
   * @returns {string} Heure formatée
   */
  static formatTime(timeString) {
    try {
      if (!timeString) return '';
      
      const [hours, minutes] = timeString.split(':');
      return `${hours}h${minutes}`;
    } catch (error) {
      console.error('Erreur formatage heure:', error);
      return timeString;
    }
  }

  /**
   * Obtient la couleur associée à une catégorie
   * @param {string} category - Catégorie de l'événement
   * @returns {Object} Objet contenant les classes CSS pour la couleur
   */
  static getCategoryColor(category) {
    const colors = {
      'réunion': {
        bg: 'bg-blue-100',
        border: 'border-blue-500',
        text: 'text-blue-800',
        dot: 'bg-blue-500'
      },
      'rendez-vous': {
        bg: 'bg-green-100',
        border: 'border-green-500',
        text: 'text-green-800',
        dot: 'bg-green-500'
      },
      'culturel': {
        bg: 'bg-purple-100',
        border: 'border-purple-500',
        text: 'text-purple-800',
        dot: 'bg-purple-500'
      },
      'formation': {
        bg: 'bg-orange-100',
        border: 'border-orange-500',
        text: 'text-orange-800',
        dot: 'bg-orange-500'
      }
    };

    return colors[category?.toLowerCase()] || {
      bg: 'bg-gray-100',
      border: 'border-gray-500',
      text: 'text-gray-800',
      dot: 'bg-gray-500'
    };
  }

  /**
   * Groupe les événements par date
   * @param {Array} events - Liste des événements
   * @returns {Object} Événements groupés par date
   */
  static groupEventsByDate(events) {
    return events.reduce((grouped, event) => {
      const date = event.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
      return grouped;
    }, {});
  }

  /**
   * Cache simple pour éviter les appels API répétés
   */
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère les événements avec mise en cache
   * @param {number} year - Année
   * @param {number} month - Mois
   * @returns {Promise<Array>} Événements du mois
   */
  static async getCachedEventsByMonth(year, month) {
    const cacheKey = `events-${year}-${month}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const events = await this.getEventsByMonth(year, month);
      this.cache.set(cacheKey, {
        data: events,
        timestamp: Date.now()
      });
      return events;
    } catch (error) {
      // Si erreur et cache disponible, retourner le cache
      if (cached) {
        console.warn('Utilisation du cache en raison d\'une erreur API');
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Vide le cache
   */
  static clearCache() {
    this.cache.clear();
  }
}

export default CalendarService;