import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Esses dois comandos criam o equivalente de __dirname
// Serve como caminho para um arquivo, por exemplo, C:/crud_db/
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do servidor Express
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//Route para exibição do formulário HTML
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

//Função para criar um banco de dados:
async function abrirBanco() {
    return open({
        filename: 'crud_db/banco.db',
        driver: sqlite3.Database
    });
}

//Função para criar uma tabela no banco de dados:
async function criarTbUser(){
    const db = await abrirBanco();
    db.run(`CREATE TABLE IF NOT EXISTS usuario (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, sobrenome TEXT NOT NULL)`);
}
criarTbUser();

// Insersão de dados no banco:
app.post('/add', async (req, res) => {
    const { nome, sobrenome } = req.body;

    const db = await abrirBanco();
    try {
        await db.run('INSERT INTO usuario (nome, sobrenome) VALUES (?, ?)', [nome, sobrenome]);
        res.send('Dados inseridos com sucesso!');
    } catch (err) {
        console.error('Erro ao inserir dados:', err.message);
        res.status(500).send('Erro ao inserir dados no banco de dados.');
    } finally {
        await db.close();
    }
});

// Remoção de dados do banco:
app.post('/remover', async (req, res) => {
    const { id } = req.body;

    const db = await abrirBanco();
    try {
        const result = await db.run('DELETE FROM usuario WHERE id = ?', [id]);
        
        // Verifica se algum usuário foi removido
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

// Atualiza um usuário no dados através do ID:
app.post('/att', async (req, res) => {
    const { id, nome, sobrenome } = req.body;

    const db = await abrirBanco();
    try {
        const result = await db.run(
            'UPDATE usuario SET nome = ?, sobrenome = ? WHERE id = ?',
            [nome, sobrenome, id]
        );
        
        // Verifica se algum usuário foi atualizado
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

// Lista todos usuários do banco de dados:
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

// Inicia o servidor localhost com porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});