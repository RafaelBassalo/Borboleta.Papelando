// ============================================================
//  ROTAS DE SINCRONIZAÇÃO — adicione isso ao seu server.js
// ============================================================
//
// Pré-requisitos:
//   npm install @supabase/supabase-js
//
// No Supabase, crie a tabela "app_data" com este SQL (em SQL Editor):
//
//   create table app_data (
//     chave text primary key,
//     valor jsonb,
//     atualizado_em timestamptz default now()
//   );
//
// Pegue a URL e a Service Role Key do seu projeto Supabase
// (Project Settings > API) e configure como variáveis de ambiente.

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY // use a "service_role key" (não a anon)
);

// Exporta uma função que recebe o "app" do Express e registra as rotas
function registrarRotasSync(app) {

    // GET /sync — retorna todos os dados salvos no formato { chave: valor, ... }
    app.get('/sync', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('app_data')
                .select('chave, valor');

            if (error) throw error;

            const resultado = {};
            data.forEach(row => {
                resultado[row.chave] = row.valor;
            });

            res.json(resultado);
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            res.status(500).json({ erro: 'Erro ao buscar dados' });
        }
    });

    // POST /sync — recebe { chave: valor, ... } e salva/atualiza tudo (upsert)
    app.post('/sync', async (req, res) => {
        try {
            const dados = req.body;

            if (!dados || typeof dados !== 'object') {
                return res.status(400).json({ erro: 'Corpo inválido' });
            }

            const linhas = Object.entries(dados).map(([chave, valor]) => ({
                chave,
                valor,
                atualizado_em: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('app_data')
                .upsert(linhas, { onConflict: 'chave' });

            if (error) throw error;

            res.json({ ok: true, total: linhas.length });
        } catch (err) {
            console.error('Erro ao salvar dados:', err);
            res.status(500).json({ erro: 'Erro ao salvar dados' });
        }
    });
}

module.exports = registrarRotasSync;
