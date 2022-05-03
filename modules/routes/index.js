const paper = require('./paperRoutes');
const scholar = require('./scholarRoutes');

/**
 * Concat other route files 
 * e.g. admin.concat(user);
 */
const routes = paper.concat(scholar);

// console.log(routes);

module.exports = routes;