const paper = require('./paperRoutes');
const scholar = require('./scholarRoutes');

// RA-SKG Routes
const productRaSkgRoutes = require('./ra-skg/productRoutes');
const personRaSkgRoutes = require('./ra-skg/personRoutes');
const ndrRoutes = require('./ra-skg/ndrRoutes');

/**
 * Concat other route files 
 * e.g. admin.concat(user);
 */
const routes = productRaSkgRoutes
    .concat(personRaSkgRoutes)
    .concat(ndrRoutes)
    .concat(paper)
    .concat(scholar);

// console.log(routes);

module.exports = routes;