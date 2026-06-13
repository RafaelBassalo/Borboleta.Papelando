const fs = require('fs');
const envPath = require('path').join(__dirname, '.env');
fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...rest] = line.trim().split('=');
    if (key) process.env[key] = rest.join('=');
});

const express = require('express');
const path = require('path');
const registrarRotasSync = require('./sync-routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos (HTML, CSS, JS, imagens)
app.use(express.static(path.join(__dirname)));

// Necessário para receber JSON grande (logo em base64)
app.use(express.json({ limit: '10mb' }));

// Rotas de sincronização com Supabase
registrarRotasSync(app);

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});