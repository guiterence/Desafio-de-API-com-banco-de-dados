create table usuarios(
    id serial primary key,
    nome varchar(200) not null,
    email text unique not null,
    senha text not null
);

create table categorias(
    id serial primary key,
    descricao text
);

create table transacoes(
    id serial primary key,
    descricao text,
    valor integer,
    data timestamp,
    categoria_id integer references categorias(id),
    usuario_id integer references usuarios(id),
    tipo text
);