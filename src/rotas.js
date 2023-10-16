const express = require("express");
const rotas = express();

const {
    cadastrarUsuario,
    login,
    detalharUsuario,
    atualizarUsuario
} = require("./controladores/usuarios");

const {
    listarTransacoes,
    obterTransacaoPorId,
    criarTransacao,
    atualizarTransacao,
    excluirTransacao,
    obterExtrato,
} = require('./controladores/transacoes')

const verificarToken = require("./intermediarios/token");
const listarCategorias = require("./controladores/categorias");

rotas.post("/usuario", cadastrarUsuario);
rotas.post("/login", login);

rotas.use(verificarToken);

rotas.get("/usuario", detalharUsuario);
rotas.put("/usuario", atualizarUsuario);
rotas.get("/categoria", listarCategorias);

rotas.get("/transacao", listarTransacoes);
rotas.post("/transacao", criarTransacao);
rotas.get("/transacao/extrato", obterExtrato);
rotas.get("/transacao/:id", obterTransacaoPorId);
rotas.put("/transacao/:id", atualizarTransacao);
rotas.delete("/transacao/:id", excluirTransacao);

module.exports = rotas;