const admin = require('./adminRoute');
const paper = require('./paperRoutes');

/**
 * Concat other route files 
 * e.g. admin.concat(user);
 */
const routes = admin.concat(paper);

module.exports = routes