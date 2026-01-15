const { authenticate } = require('./authenticate');
const { authorizeRoles } = require('./authorize');

// Helper pour créer un middleware d'autorisation
const authorize = (roles) => {
  return authorizeRoles(...roles);
};

module.exports = {
  authenticate,
  authorize,
  authorizeRoles
};
