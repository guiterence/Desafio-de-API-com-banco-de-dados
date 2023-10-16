const conexao = require("../conexao");

async function listarCategorias(req, res) {

    try {
        const { rows: categorias } = await conexao.query(`
        select * from categorias;
        `);

        return res.status(200).json(categorias);

    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

module.exports = listarCategorias;