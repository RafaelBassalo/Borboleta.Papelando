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

            if (!dados || typeof dados !== 'object') {
                return res.status(400).json({ erro: 'Corpo inválido' });
            }

            // Busca dados atuais do servidor para fazer merge por timestamp
            const { data: dadosAtuais } = await getSupabase()
                .from('app_data')
                .select('chave, valor');

            const mapaAtual = {};
            (dadosAtuais || []).forEach(row => {
                mapaAtual[row.chave] = row.valor;
            });

            // Monta linhas para upsert — só atualiza se timestamp local for mais recente
            const linhas = [];
            Object.entries(dados).forEach(([chave, item]) => {
                if (chave === '__sync_timestamps__') return;

                const valorNovo = item?.valor ?? item;
                const tsNovo = item?.ts || 0;
                const atual = mapaAtual[chave];
                const tsAtual = atual?.ts || 0;

                if (tsNovo >= tsAtual) {
                    linhas.push({
                        chave,
                        valor: { valor: valorNovo, ts: tsNovo },
                        atualizado_em: new Date().toISOString()
                    });
                }
            });

            if (linhas.length > 0) {
                const { error } = await getSupabase()
                    .from('app_data')
                    .upsert(linhas, { onConflict: 'chave' });

                if (error) {
                    console.log('Erro Supabase:', JSON.stringify(error));
                    throw error;
                }
            }

            console.log(`POST /sync: ${linhas.length} linhas atualizadas`);
            res.json({ ok: true, total: linhas.length });
        } catch (err) {
            console.error('Erro ao salvar dados:', err);
            res.status(500).json({ erro: 'Erro ao salvar dados' });
        }
    });
}

module.exports = registrarRotasSync;