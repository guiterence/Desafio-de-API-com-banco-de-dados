const conexao = require("../conexao");
const bcrypt = require("bcrypt");
const token = require("jsonwebtoken");
const senhaJwt = require("../senhaJwt");
const { verificarEmail } = require("../utilidades");

async function cadastrarUsuario(req, res) {
    const { nome, email, senha } = req.body;

    try {
        if (!nome) {
            return res.status(400).json({ mensagem: "Por favor, preencha o campo nome " });
        }

        if (!email) {
            return res.status(400).json({ mensagem: "Por favor, preencha o campo email " });
        }

        if (!senha) {
            return res.status(400).json({ mensagem: "Por favor, preencha o campo senha " });
        }

        const emailUnico = await verificarEmail(email);

        if (emailUnico === 1) {
            return res.status(400).json({ mensagem: "Já existe usuário cadastrado com o e-mail informado." });
        }

        const senhaCripto = await bcrypt.hash(senha, 10);

        const { rows } = await conexao.query(`
        insert into usuarios
        (nome, email, senha)
        values
        ($1, $2, $3) returning id, nome, email;
        `, [nome, email, senhaCripto]);

        return res.status(201).json(rows[0]);

    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

async function login(req, res) {
    const { email, senha } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ mensagem: "Por favor, insira o email." });
        }

        if (!senha) {
            return res.status(400).json({ mensagem: "Por favor, insira a senha." });
        }

        const { rowCount, rows } = await conexao.query(`
        select * from usuarios where email = $1;
        `, [email]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: "Email e/ou senha incorretos." });
        }

        const verificacaoSenha = await bcrypt.compare(senha, rows[0].senha);

        if (!verificacaoSenha) {
            return res.status(401).json({ mensagem: "Email e/ou senha incorretos." });
        }

        const tokenUsuario = await token.sign({ id: rows[0].id }, senhaJwt, { expiresIn: "8h" });

        const retorno = {
            usuario: {
                id: rows[0].id,
                nome: rows[0].nome,
                email: rows[0].email
            },
            token: tokenUsuario
        }

        return res.status(200).json(retorno);

    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

async function detalharUsuario(req, res) {
    const { id, nome, email } = req.usuario;

    try {
        const usuario = {
            id,
            nome,
            email
        }

        return res.status(200).json(usuario);

    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

async function atualizarUsuario(req, res) {
    const { nome, email, senha } = req.body;
    const { id } = req.usuario;

    try {
        if (!nome) {
            return res.status(400).json({ mensagem: "Por favor, insira o nome." });
        }

        if (!email) {
            return res.status(400).json({ mensagem: "Por favor, insira o email." });
        }

        if (!senha) {
            return res.status(400).json({ mensagem: "Por favor, insira a senha." });
        }

        const emailUnico = await verificarEmail(email);

        if (emailUnico !== 0) {
            return res.status(400).json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." });
        }

        const senhaCripto = await bcrypt.hash(senha, 10);

        await conexao.query(`
        update usuarios set
        nome = $1,
        email = $2,
        senha = $3
        where id = $4;
        `, [nome, email, senhaCripto, id]);

        return res.status(204).json();

    } catch (error) {
        return res.status(500).json({ mensagem: error.message });
    }
}

module.exports = {
    cadastrarUsuario,
    login,
    detalharUsuario,
    atualizarUsuario
}