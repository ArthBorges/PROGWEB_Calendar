import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Esses dois comandos criam o equivalente de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

async function abrirBanco() {
    return open({
        filename: './banco.db',
        driver: sqlite3.Database
    });
}

async function criarTbUser(){
    const db = await abrirBanco();
    db.run(`CREATE TABLE IF NOT EXISTS usuario (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, sobrenome TEXT NOT NULL)`);
}
criarTbUser();

app.post('/add', async (req, res) => {
    const { nome, sobrenome } = req.body;

    const db = await abrirBanco();
    try {
        // Insere os dados no banco de dados
        await db.run('INSERT INTO usuario (nome, sobrenome) VALUES (?, ?)', [nome, sobrenome]);
        res.send('Dados inseridos com sucesso!');
    } catch (err) {
        console.error('Erro ao inserir dados:', err.message);
        res.status(500).send('Erro ao inserir dados no banco de dados.');
    } finally {
        await db.close();
    }
});

app.post('/remover', async (req, res) => {
    const { id } = req.body;

    const db = await abrirBanco();
    try {
        const result = await db.run('DELETE FROM usuario WHERE id = ?', [id]);
        
        // Verifica se algum registro foi deletado
        if (result.changes > 0) {
            res.send(`Usuário com ID ${id} removido com sucesso!`);
        } else {
            res.send(`Nenhum usuário encontrado com o ID ${id}.`);
        }
    } catch (err) {
        console.error('Erro ao remover usuário:', err.message);
        res.status(500).send('Erro ao remover usuário do banco de dados.');
    } finally {
        await db.close();
    }
});

app.post('/att', async (req, res) => {
    const { id, nome, sobrenome } = req.body;

    const db = await abrirBanco();
    try {
        const result = await db.run(
            'UPDATE usuario SET nome = ?, sobrenome = ? WHERE id = ?',
            [nome, sobrenome, id]
        );
        
        // Verifica se algum registro foi atualizado
        if (result.changes > 0) {
            res.send(`Usuário com ID ${id} atualizado com sucesso!`);
        } else {
            res.send(`Nenhum usuário encontrado com o ID ${id}.`);
        }
    } catch (err) {
        console.error('Erro ao atualizar usuário:', err.message);
        res.status(500).send('Erro ao atualizar usuário no banco de dados.');
    } finally {
        await db.close();
    }
});

app.get('/users', async (req, res) => {
    const db = await abrirBanco();
    try {
        const usuarios = await db.all('SELECT * FROM usuario');
        
        let html = '<h2>Usuários Cadastrados</h2><ul>';
        usuarios.forEach(usuario => {
            html += `<li>ID: ${usuario.id}| Nome Completo: ${usuario.nome} ${usuario.sobrenome}</li>`;
        });
        html += '</ul><a href="/">Voltar</a>';
        
        res.send(html);
    } catch (err) {
        console.error('Erro ao listar usuários:', err.message);
        res.status(500).send('Erro ao listar usuários do banco de dados.');
    } finally {
        await db.close();
    }
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});