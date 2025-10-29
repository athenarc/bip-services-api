const paperController = require('./paperController');
const scholarController = require('./scholarController');

// RA-SKG Controllers
const productController = require('./ra-skg/productController');
const personController = require('./ra-skg/personController');
const ndrController = require('./ra-skg/ndrController');

module.exports = {
    paperController,
    scholarController,
    productController,
    personController,
    ndrController
}