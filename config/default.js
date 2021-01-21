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
            title: "BIP! Finder API",
            version: "0.0.1",
            contact: {
                name: "diwis",
                email: "bip@imsi.athenarc.gr"
            }
        },
        schemes: ["https"],
        grouping: "paper/scores",
        documentationPage: true,
        jsonEditor: true,
        tags: [
            {
                "name": "Paper Scores",
                "description": "Get scores for papers"
            }
        ]
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
