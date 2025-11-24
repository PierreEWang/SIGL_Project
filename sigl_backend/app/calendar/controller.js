const events = require('./data');

/**
 * Contrôleur pour les événements du calendrier
 * Gère la logique métier pour l'API calendrier
 */

/**
 * GET /api/calendar/events
 * Récupère tous les événements du calendrier
 */
const getAllEvents = (req, res) => {
    try {
        console.log(`📅 Récupération de tous les événements - IP: ${req.ip}`);
        
        // Optionnel: filtrage par catégorie si fourni en query parameter
        const { category } = req.query;
        
        let filteredEvents = events;
        
        if (category) {
            filteredEvents = events.filter(event => 
                event.category.toLowerCase() === category.toLowerCase()
            );
            console.log(`🔍 Filtrage par catégorie: ${category} - ${filteredEvents.length} événements trouvés`);
        }
        
        // Tri par date croissante
        filteredEvents.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
        
        res.status(200).json({
            success: true,
            message: 'Événements récupérés avec succès',
            count: filteredEvents.length,
            data: filteredEvents
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des événements:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur interne du serveur',
            message: 'Impossible de récupérer les événements'
        });
    }
};

/**
 * GET /api/calendar/events/:id
 * Récupère un événement spécifique par son ID
 */
const getEventById = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        
        console.log(`📅 Récupération événement ID: ${eventId} - IP: ${req.ip}`);
        
        // Validation de l'ID
        if (isNaN(eventId) || eventId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'ID invalide',
                message: 'L\'ID de l\'événement doit être un nombre positif'
            });
        }
        
        // Recherche de l'événement
        const event = events.find(e => e.id === eventId);
        
        if (!event) {
            console.log(`🔍 Événement non trouvé - ID: ${eventId}`);
            return res.status(404).json({
                success: false,
                error: 'Événement non trouvé',
                message: `Aucun événement trouvé avec l'ID ${eventId}`
            });
        }
        
        console.log(`✅ Événement trouvé: ${event.title}`);
        res.status(200).json({
            success: true,
            message: 'Événement récupéré avec succès',
            data: event
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération de l\'événement:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur interne du serveur',
            message: 'Impossible de récupérer l\'événement'
        });
    }
};

/**
 * GET /api/calendar/categories
 * Récupère toutes les catégories d'événements disponibles
 */
const getCategories = (req, res) => {
    try {
        console.log(`📋 Récupération des catégories - IP: ${req.ip}`);
        
        // Extraction des catégories uniques
        const categories = [...new Set(events.map(event => event.category))];
        
        res.status(200).json({
            success: true,
            message: 'Catégories récupérées avec succès',
            count: categories.length,
            data: categories
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des catégories:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur interne du serveur',
            message: 'Impossible de récupérer les catégories'
        });
    }
};

/**
 * GET /api/calendar/events/month/:year/:month
 * Récupère les événements d'un mois spécifique
 */
const getEventsByMonth = (req, res) => {
    try {
        const { year, month } = req.params;
        
        console.log(`📅 Récupération événements pour ${month}/${year} - IP: ${req.ip}`);
        
        // Validation des paramètres
        const yearNum = parseInt(year);
        const monthNum = parseInt(month);
        
        if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({
                success: false,
                error: 'Paramètres invalides',
                message: 'L\'année et le mois doivent être des nombres valides (mois: 1-12)'
            });
        }
        
        // Filtrage par mois et année
        const monthEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getFullYear() === yearNum && 
                   eventDate.getMonth() + 1 === monthNum;
        });
        
        // Tri par date
        monthEvents.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
        
        console.log(`✅ ${monthEvents.length} événements trouvés pour ${month}/${year}`);
        
        res.status(200).json({
            success: true,
            message: `Événements de ${month}/${year} récupérés avec succès`,
            month: monthNum,
            year: yearNum,
            count: monthEvents.length,
            data: monthEvents
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des événements du mois:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur interne du serveur',
            message: 'Impossible de récupérer les événements du mois'
        });
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    getCategories,
    getEventsByMonth
};