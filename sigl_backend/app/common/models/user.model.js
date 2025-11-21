const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format d\'email invalide']
    },
    // Email verification status for email verification flow
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    // Password field removed - stored separately in auth_credentials collection
    // Role system uses standardized English codes only (French roles no longer supported)
    role: {
        type: String,
        required: true,
        enum: [
            'APPRENTI',    // Apprentice/Student - Basic user access
            'MA',          // Maître d'Apprentissage (Mentor) - Mentor-level access
            'TP',          // Tuteur Pédagogique (Educational Tutor) - Educational oversight
            'CA',          // Chargé d'Affaires (Account Manager) - Business management
            'RC',          // Responsable de Centre (Center Manager) - Center administration
            'PROF',        // Professor/Instructor - Teaching and content management
            'ADMIN'        // System Administrator - Full system access
        ],
        default: 'APPRENTI'
    },
    // Role-specific fields (optional, based on user role)
    // For APPRENTI (Apprentice/Student)
    idApprenti: {
        type: mongoose.Schema.Types.ObjectId,
        sparse: true
    },
    numero: {
        type: String,
        sparse: true
    },
    // For MA (Maître d'Apprentissage/Mentor)
    fonction: {
        type: String,
        sparse: true
    },
    // For TP (Tuteur Pédagogique/Educational Tutor)
    specialite: {
        type: String,
        sparse: true
    },
    // For CA (Chargé d'Affaires/Account Manager)
    service: {
        type: String,
        sparse: true
    },
    // For RC (Responsable de Centre/Center Manager)
    departement: {
        type: String,
        sparse: true
    },
    // For PROF (Professor/Instructor)
    grade: {
        type: String,
        sparse: true
    },
    // For ADMIN (System Administrator)
    habilitations: {
        type: String,
        sparse: true
    }
}, {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    collection: 'utilisateurs'
});

// Index pour de meilleures performances de requête
// Note: email index is already created by unique: true constraint
utilisateurSchema.index({ role: 1 });

// Method to remove sensitive data before sending response
// Note: Passwords are stored in separate auth_credentials collection for security
utilisateurSchema.methods.toJSON = function() {
    const user = this.toObject();
    // Password field no longer exists in this model (stored separately for security)
    delete user.password;
    return user;
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;