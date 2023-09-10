const mysql = require("mysql2");

const pool = mysql.createPool({
    host:'127.0.0.1',
    user:'root',
    password:'eventour2020',
    database:'railway_app'
}).promise();

const result = await pool.query("SELECT * FROM users");
console.log(result);