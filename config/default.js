const Libs = require('../modules/libs/commFunctions');

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
        schemes: ["https"],
        grouping: "paper/scores",
        documentationPage: true,
        jsonEditor: true,
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
