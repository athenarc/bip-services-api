const paperController = require('./paperController');
const scholarController = require('./scholarController');
const healthController = require('./healthController');

// RA-SKG Controllers
const productController = require('./ra-skg/productController');
const personController = require('./ra-skg/personController');
const ndrController = require('./ra-skg/ndrController');

module.exports = {
    paperController,
    scholarController,
    healthController,
    productController,
    personController,
    ndrController
}