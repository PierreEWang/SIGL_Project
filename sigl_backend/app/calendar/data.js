/**
 * Données d'événements français hardcodées pour l'API Calendrier
 * Contient des événements réalistes pour étudiants en apprentissage
 */

const events = [
    // Événements pour novembre 2025 (mois actuel)
    {
        id: 21,
        title: "Entretien tuteur entreprise",
        description: "Point mensuel avec le maître d'apprentissage sur l'avancement des missions",
        date: "2025-11-22",
        time: "14:00",
        location: "Entreprise d'accueil, Salle de réunion 3",
        category: "rendez-vous"
    },
    {
        id: 22,
        title: "Formation React avancé",
        description: "Atelier sur les hooks personnalisés et l'optimisation des performances",
        date: "2025-11-25",
        time: "09:00",
        location: "ESEO Angers, Amphithéâtre A",
        category: "formation"
    },
    {
        id: 23,
        title: "Soutenance projet semestre",
        description: "Présentation du projet développé en entreprise devant le jury",
        date: "2025-11-28",
        time: "10:30",
        location: "ESEO Angers, Salle de soutenance 2",
        category: "rendez-vous"
    },
    {
        id: 24,
        title: "Remise rapport d'activité",
        description: "Date limite pour remettre le rapport mensuel d'activités en entreprise",
        date: "2025-11-30",
        time: "23:59",
        location: "Plateforme numérique ESEO",
        category: "formation"
    },
    // Événements pour décembre 2025
    {
        id: 1,
        title: "Réunion équipe projet",
        description: "Sprint planning et répartition des tâches pour le développement de l'application mobile",
        date: "2025-12-02",
        time: "09:00",
        location: "Entreprise d'accueil, Open Space",
        category: "réunion"
    },
    {
        id: 2,
        title: "Entretien évaluation compétences",
        description: "Bilan semestriel avec le tuteur pédagogique et le maître d'apprentissage",
        date: "2025-12-05",
        time: "14:30",
        location: "ESEO Angers, Bureau des relations entreprises",
        category: "rendez-vous"
    },
    {
        id: 3,
        title: "Conférence IA et développement",
        description: "Intervention d'experts sur l'intelligence artificielle dans le développement logiciel",
        date: "2025-12-10",
        time: "16:00",
        location: "ESEO Angers, Grand Amphithéâtre",
        category: "culturel"
    },
    {
        id: 4,
        title: "Workshop DevOps",
        description: "Formation pratique sur Docker, Kubernetes et CI/CD",
        date: "2025-12-12",
        time: "10:00",
        location: "ESEO Angers, Laboratoire informatique",
        category: "formation"
    },
    {
        id: 5,
        title: "Présentation projet client",
        description: "Démonstration de l'avancement du projet devant le client final",
        date: "2025-12-15",
        time: "15:00",
        location: "Entreprise d'accueil, Salle de présentation",
        category: "réunion"
    },
    {
        id: 6,
        title: "Forum entreprises ESEO",
        description: "Rencontre avec les entreprises partenaires et présentation des projets étudiants",
        date: "2025-12-18",
        time: "09:00",
        location: "ESEO Angers, Hall principal",
        category: "culturel"
    },
    {
        id: 7,
        title: "Entretien suivi pédagogique",
        description: "Point individuel avec le responsable pédagogique sur le parcours d'apprentissage",
        date: "2025-12-20",
        time: "11:00",
        location: "ESEO Angers, Bureau pédagogique",
        category: "rendez-vous"
    },
    // Événements pour janvier 2026
    {
        id: 8,
        title: "Séminaire cybersécurité",
        description: "Formation obligatoire sur la sécurité informatique en entreprise",
        date: "2026-01-08",
        time: "09:30",
        location: "ESEO Angers, Salle de conférence",
        category: "formation"
    },
    {
        id: 9,
        title: "Réunion de service",
        description: "Participation à la réunion hebdomadaire de l'équipe de développement",
        date: "2026-01-10",
        time: "14:00",
        location: "Entreprise d'accueil, Salle de réunion principale",
        category: "réunion"
    },
    {
        id: 10,
        title: "Hackathon étudiant",
        description: "Compétition de développement sur 48h avec les autres apprentis",
        date: "2026-01-15",
        time: "18:00",
        location: "ESEO Angers, FabLab",
        category: "culturel"
    },
    {
        id: 11,
        title: "Entretien annuel apprenti",
        description: "Évaluation annuelle des compétences et définition des objectifs",
        date: "2026-01-20",
        time: "10:30",
        location: "Entreprise d'accueil, Bureau RH",
        category: "rendez-vous"
    },
    {
        id: 12,
        title: "Journée portes ouvertes",
        description: "Présentation du cursus apprentissage aux futurs étudiants",
        date: "2026-01-25",
        time: "14:00",
        location: "ESEO Angers, Campus principal",
        category: "culturel"
    },
    {
        id: 13,
        title: "Code review collectif",
        description: "Session de revue de code avec l'équipe senior de développement",
        date: "2026-01-28",
        time: "11:00",
        location: "Entreprise d'accueil, Salle de développement",
        category: "réunion"
    },
    // Événements pour février 2026
    {
        id: 14,
        title: "Soutenance mémoire technique",
        description: "Présentation du mémoire de fin d'études devant le jury",
        date: "2026-02-05",
        time: "14:30",
        location: "ESEO Angers, Salle de soutenance 1",
        category: "rendez-vous"
    },
    {
        id: 15,
        title: "Formation gestion de projet",
        description: "Méthodologies Agile et Scrum pour la gestion de projets informatiques",
        date: "2026-02-08",
        time: "09:00",
        location: "ESEO Angers, Salle de formation",
        category: "formation"
    },
    {
        id: 16,
        title: "Meetup développeurs",
        description: "Rencontre avec la communauté locale des développeurs web",
        date: "2026-02-12",
        time: "19:00",
        location: "La Cantine Numérique, Angers",
        category: "culturel"
    },
    {
        id: 17,
        title: "Bilan mi-parcours",
        description: "Évaluation intermédiaire du parcours d'apprentissage",
        date: "2026-02-15",
        time: "15:00",
        location: "ESEO Angers, Bureau des études",
        category: "rendez-vous"
    },
    {
        id: 18,
        title: "Sprint review",
        description: "Présentation des fonctionnalités développées lors du sprint",
        date: "2026-02-18",
        time: "16:30",
        location: "Entreprise d'accueil, Salle de démonstration",
        category: "réunion"
    },
    {
        id: 19,
        title: "Atelier soft skills",
        description: "Développement des compétences relationnelles et communication",
        date: "2026-02-22",
        time: "10:00",
        location: "ESEO Angers, Salle polyvalente",
        category: "formation"
    },
    {
        id: 20,
        title: "Entretien de fin de contrat",
        description: "Bilan final du contrat d'apprentissage et perspectives d'avenir",
        date: "2026-02-28",
        time: "14:00",
        location: "Entreprise d'accueil, Bureau direction",
        category: "rendez-vous"
    }
];

module.exports = events;