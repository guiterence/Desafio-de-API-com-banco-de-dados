const conexao = require("../conexao");
const { compare, hash } = require("bcrypt");
const token = require("jsonwebtoken");
const senhaJwt = require("../senhaJwt");

async function listarTransacoes(req, res) {
  const { id } = req.usuario;

  try {
    const { rows } = await conexao.query(
      'SELECT * FROM transacoes WHERE usuario_id = $1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(204).json();
    }

    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}



async function obterTransacaoPorId(req, res) {
  const { id } = req.params;
  const {id:usuario_id} = req.usuario;

  try {
    
    const { rows } = await conexao.query(
      'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensagem: 'Transação não encontrada.' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}


async function criarTransacao(req, res) {
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const { id } = req.usuario;


  try {
    if (!descricao) {
      return res.status(400).json({ mensagem: "Por favor, insira a descrição da transação." });
    }

    if (!valor) {
      return res.status(400).json({ mensagem: "Por favor, insira o valor da transação." });
    }

    if (!data) {
      return res.status(400).json({ mensagem: "Por favor, insira a data da transação." });
    }

    if (!categoria_id) {
      return res.status(400).json({ mensagem: "Por favor, insira a categoria da transação." });
    }

    if (!tipo) {
      return res.status(400).json({ mensagem: "Por favor, insira o tipo da transação." });
    }

    const { rowCount } = await conexao.query(`
    select * from categorias where id = $1;
    `, [categoria_id]);

    if (rowCount < 1) {
      return res.status(404).json({ mensagem: "A categoria informada não existe, informe uma categoria válida." });
    }

    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({ mensagem: "Por favor, informe se a transação é do tipo entrada ou saida." });
    }

    const { rows } = await conexao.query(`
    insert into transacoes
    (descricao, valor, data, categoria_id, usuario_id, tipo)
    values
    ($1, $2, $3, $4, $5, $6) 
    returning *;
    `, [descricao, valor, data, categoria_id, id, tipo]);

    return res.status(201).json(rows[0]);
  }

  catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}


async function atualizarTransacao(req, res) {
  const {id} = req.params;
  const { descricao, valor, data, categoria_id, tipo } = req.body;
  const {id:usuario_id} = req.usuario

  try {
    
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
      return res.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser informados.' });
    }

    
    const { rowCount } = await conexao.query(
      'SELECT * FROM transacoes WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id ]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: 'Transação não encontrada.' });
    }

    
    await conexao.query(
      'UPDATE transacoes SET descricao = $1, valor = $2, data = $3, categoria_id = $4, tipo = $5 WHERE id = $6',
      [descricao, valor, data, categoria_id, tipo, id]
    );

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}


async function excluirTransacao(req, res) {
  const {id} = req.params;
  const {id:usuario_id} = req.usuario
  try {
    const { rowCount } = await conexao.query(
      'DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ mensagem: 'Transação não encontrada.' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}




async function obterExtrato(req, res) {
  const { id } = req.usuario;

  try {
    const { rows: entrada } = await conexao.query(`
    select sum(t.valor) from transacoes t right join usuarios u on u.id = t.usuario_id
    where u.id = $1 and t.tipo = 'entrada'; 
    `, [id])

    const { rows: saida } = await conexao.query(`
    select sum(t.valor) from transacoes t right join usuarios u on u.id = t.usuario_id
    where u.id = $1 and t.tipo = 'saida'; 
    `, [id])

    if (entrada[0].sum === null) {
      entrada[0].sum = 0;
    }

    if (saida[0].sum === null) {
      saida[0].sum = 0;
    }


    const extrato = {
      entrada: entrada[0].sum,
      saida: saida[0].sum
    }

    return res.status(200).json(extrato);


  } catch (error) {
    return res.status(500).json({ mensagem: error.message });
  }
}

module.exports = {
  listarTransacoes,
  obterTransacaoPorId,
  criarTransacao,
  atualizarTransacao,
  excluirTransacao,
  obterExtrato,
};
