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
            title: "BIP! API",
            version: "1.0.0",
            contact: {
                name: "the Sknow Lab",
                email: "bip@athenarc.gr"
            }
        },
        schemes: ["http", "https"],
    },
    constants: {
        passwordLength: 8,
        bcryptSaltRounds: 10,
        jwtKey: "@E#223D$FdafEW$342sa22sds",
        deviceType: {
            ANDROID: "Android",
            IOS: "Ios"
        }
    }
}

module.exports = config
