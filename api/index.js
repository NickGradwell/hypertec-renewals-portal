const { app } = require('@azure/functions');

// Import all functions
require('./src/functions/health');
require('./src/functions/auth');
require('./src/functions/companies');
require('./src/functions/users');
require('./src/functions/records');
require('./src/functions/emails');
require('./src/functions/email-logs');

module.exports = app;
