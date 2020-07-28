const { Pool} = require("pg");
require("dotenv").config();

const pool = new Pool({
    user :process.env.USER_NAME,
    host :'deviceregistrationdb.postgres.database.azure.com',
    database :'device-reg_db',
    password :process.env.PASSWORD,
    port :'5432',
    ssl: true

});

module.exports = {pool};
