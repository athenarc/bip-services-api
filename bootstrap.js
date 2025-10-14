const MYSQL = require('mysql2');

// load env variables
const dotenv = require('dotenv');
dotenv.config();

var db_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DBNAME,
    port: process.env.MYSQL_PORT,
    multipleStatements: true
};

function initializeConnectionPool(db_config){

    console.log('DB CONFIG:');
    console.log(db_config);
    
    return MYSQL.createPool(db_config);
}


global.connection = initializeConnectionPool(db_config);
