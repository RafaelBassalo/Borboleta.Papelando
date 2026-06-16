(function () {

    const CHAVES_FIXAS = [
        'custosFixos', 'produtosCadastrados', 'clientesCadastrados',
        'orcamentoProdutos', 'orcamentosSalvos', 'tempoProducaoTotal',
        'nomeCliente', 'produtoFinal', 'mesPedidoOrcamento',
        'statusPedidoOrcamento', 'pagamentoPedidoOrcamento',
        'empresaNome', 'whatsappEmpresa', 'instagramEmpresa',
        'chavePix', 'pixCode', 'logoEmpresa'
    ];

    const STORAGE_TS_KEY = '__sync_timestamps__';

    function getTimestamps() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_TS_KEY)) || {};
        } catch { return {}; }
    }

    function saveTimestamps(ts) {
        localStorage.setItem(STORAGE_TS_KEY, JSON.stringify(ts));
    }

    function getTodasAsChaves() {
        const chaves = new Set(CHAVES_FIXAS);
        Object.keys(localStorage)
            .filter(k => k.startsWith('pedidos-'))
            .forEach(k => chaves.add(k));
        return [...chaves];
    }

    function getDadosLocais() {
        const dados = {};
        const ts = getTimestamps();
        getTodasAsChaves().forEach(chave => {
            const valor = localStorage.getItem(chave);
            if (valor !== null) {
                dados[chave] = {
                    valor,
                    ts: ts[chave] || 0
                };
            }
        });
        return dados;
    }

    // Interceptar setItem para registrar timestamp
    const setItemOriginal = localStorage.setItem.bind(localStorage);
    const removeItemOriginal = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = function (chave, valor) {
        setItemOriginal(chave, valor);
        if (chave !== STORAGE_TS_KEY) {
            const ts = getTimestamps();
            ts[chave] = Date.now();
            saveTimestamps(ts);
            agendarEnvio();
        }
    };

    localStorage.removeItem = function (chave) {
        removeItemOriginal(chave);
        agendarEnvio();
    };

    // Envio com debounce
    let enviandoTimeout = null;
    function agendarEnvio() {
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(enviarParaServidor, 1500);
    }

    async function enviarParaServidor() {
        try {
            const dados = getDadosLocais();
            await fetch('/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            console.log('[sync] Dados enviados.');
        } catch (err) {
            console.warn('[sync] Erro ao enviar:', err);
        }
    }

    async function sincronizarComServidor() {
        try {
            // 1. Envia dados locais com timestamps
            const dadosLocais = getDadosLocais();
            if (Object.keys(dadosLocais).length > 0) {
                await fetch('/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosLocais)
                });
            }

            // 2. Baixa dados do servidor (já com merge por timestamp feito no servidor)
            const resp = await fetch('/sync');
            if (!resp.ok) throw new Error('Falha GET /sync');
            const dadosServidor = await resp.json();

            const tsLocal = getTimestamps();
            const novoTs = { ...tsLocal };

            Object.entries(dadosServidor).forEach(([chave, item]) => {
                if (!item || chave === STORAGE_TS_KEY) return;
                const valorServidor = item.valor ?? item;
                const tsServidor = item.ts || 0;
                const tsLocalChave = tsLocal[chave] || 0;

                if (tsServidor >= tsLocalChave) {
                    setItemOriginal(chave, valorServidor);
                    novoTs[chave] = tsServidor;
                }
            });

            saveTimestamps(novoTs);
            console.log('[sync] Sincronização completa.');
        } catch (err) {
            console.warn('[sync] Erro sync:', err);
        }
    }

    // Envia ao sair da página
    window.addEventListener('beforeunload', () => {
        const dados = getDadosLocais();
        const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
        navigator.sendBeacon('/sync', blob);
    });

    // Sync periódico a cada 5 segundos
    setInterval(enviarParaServidor, 5000);

    window.syncPronto = sincronizarComServidor();

})();