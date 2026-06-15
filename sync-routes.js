const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

function getSupabase() {
    return createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_KEY,
        {
            realtime: { transport: ws }
        }
    );
}

function registrarRotasSync(app) {

    app.get('/sync', async (req, res) => {
        try {
            const { data, error } = await getSupabase()
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

    app.post('/sync', async (req, res) => {
        try {
            const dados = req.body;
            console.log('POST /sync recebido, chaves:', Object.keys(dados).length);

            if (!dados || typeof dados !== 'object') {
                return res.status(400).json({ erro: 'Corpo inválido' });
            }

            const linhas = Object.entries(dados).map(([chave, valor]) => ({
                chave,
                valor,
                atualizado_em: new Date().toISOString()
            }));

            const { error } = await getSupabase()
                .from('app_data')
                .upsert(linhas, { onConflict: 'chave' });

            if (error) {
                console.log('Erro Supabase:', JSON.stringify(error));
                throw error;
            }

            res.json({ ok: true, total: linhas.length });
        } catch (err) {
            console.error('Erro ao salvar dados:', err);
            res.status(500).json({ erro: 'Erro ao salvar dados' });
        }
    });
}

module.exports = registrarRotasSync;