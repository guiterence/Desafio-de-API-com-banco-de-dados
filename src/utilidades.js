const conexao = require("./conexao");

async function verificarEmail(email) {
    const { rowCount } = await conexao.query(`
        select * from usuarios where email = $1;
        `, [email]);

    return rowCount;
}

module.exports = {
    verificarEmail
}