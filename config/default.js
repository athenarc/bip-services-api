const Libs = require('../modules/libs/commFunctions');
const Joi = require('joi');

// load env variables
const dotenv = require('dotenv');
dotenv.config();

const config = {
    serverSetupConfig: {
        host: process.env.HOSTNAME,
        port: 4000,
        routes: {
            cors: {
                origin: ['*']
            },
            validate: {
                validator: Joi,
                failAction: async (request, h, err) => {
                    const error = Libs.failActionFunction(err)
                    throw error;
                }
            }
        }
    },
    version: "/v1",
    swaggerSetupConfig: {
        info: {
            title: "BIP! Services API",
            version: "2.0.0",
            description: "RESTful API for accessing citation-based impact indicators from the BIP! Services.",
            contact: {
                name: "the Sknow Lab",
                email: "bip@athenarc.gr"
            }
        },
        host: process.env.SWAGGER_HOST,
        schemes: (process.env.SWAGGER_SCHEMES).split(',').map(s => s.trim()),
        grouping: 'tags',
        tags: [
            { name: 'Citation-based impact indicators', description: 'Main category for citation-based impact indicators' },
            { name: 'RA-SKG', description: 'API endpoints compliant with the [RA-SKG extension](https://skg-if.github.io/ext-ra-skg/) of the [SKG Interoperability Framework (SKG-IF)](https://skg-if.github.io/)' },
        ]
    },
    constants: {
        bcryptSaltRounds: 10,
        jwtKey: process.env.JWT_SECRET,
        bipApiBaseUrl: process.env.BIP_API_BASE_URL
    }
}

module.exports = config
