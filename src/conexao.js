const { Pool } = require("pg");

const conexao = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "dindin"
});

module.exports = conexao;