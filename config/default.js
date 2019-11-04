const Libs = require('../modules/libs/commFunctions');
const config = {
    serverSetupConfig: {
        port: 3000,
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
    databaseSettings: {
        MYSQL_HOST: "127.0.0.1",
        MYSQL_USER: "apache_bip_user",
        MYSQL_PASS: "b1p1$@w3s0m3",
        MYSQL_DBNAME: "bcn_papers",
        MYSQL_PORT: 3306
    },
    swaggerSetupConfig: {
        info: {
            title: "BIP! Finder API",
            version: "0.0.1",
            contact: {
                name: "diwis",
                email: "bip@imsi.athenarc.gr"
            }
        },
        grouping: "paper",
        documentationPage: true,
        jsonEditor: true,
        tags: [
            {
                "name": "Paper",
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