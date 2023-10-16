const token = require("jsonwebtoken");
const senhaJwt = require("../senhaJwt");
const conexao = require("../conexao");


async function verificarToken(req, res, next) {
    const { authorization } = req.headers;

    try {
        if (!authorization) {
            return res.status(401).json({ mensagem: "Por favor, insira um token de autênticação válido." });
        }

        const tokenUsuario = authorization.split(" ");

        const { id } = token.verify(tokenUsuario[1], senhaJwt);

        const { rows } = await conexao.query(`
        select * from usuarios where id = $1;
        `, [id]);

        req.usuario = { ...rows[0] };

        next();

    } catch (error) {
        return res.status(401).json({ mensagem: "Token inválido." });
    }
}

module.exports = verificarToken;