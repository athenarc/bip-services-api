const paper = require('./paperRoutes');
const scholar = require('./scholarRoutes');

// RA-SKG Routes
const productRaSkgRoutes = require('./ra-skg/productRoutes');
const agentRaSkgRoutes = require('./ra-skg/agentRoutes');

/**
 * Concat other route files 
 * e.g. admin.concat(user);
 */
const routes = productRaSkgRoutes.concat(paper)
    .concat(scholar);
    // .concat(agentRaSkgRoutes);

// console.log(routes);

module.exports = routes;