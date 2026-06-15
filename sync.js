(function () {

    const CHAVES_FIXAS = [
        'custosFixos',
        'produtosCadastrados',
        'clientesCadastrados',
        'orcamentoProdutos',
        'orcamentosSalvos',
        'tempoProducaoTotal',
        'nomeCliente',
        'produtoFinal',
        'mesPedidoOrcamento',
        'statusPedidoOrcamento',
        'pagamentoPedidoOrcamento',
        'empresaNome',
        'whatsappEmpresa',
        'instagramEmpresa',
        'chavePix',
        'pixCode',
        'logoEmpresa'
    ];

    function getTodasAsChaves() {
        const chaves = new Set(CHAVES_FIXAS);
        Object.keys(localStorage)
            .filter(k => k.startsWith('pedidos-'))
            .forEach(k => chaves.add(k));
        return [...chaves];
    }

    function getDadosLocais() {
        const dados = {};
        getTodasAsChaves().forEach(chave => {
            const valor = localStorage.getItem(chave);
            if (valor !== null) dados[chave] = valor;
        });
        return dados;
    }

    // ── Enviar dados locais para o servidor ──
    let enviandoTimeout = null;

    function enviarParaServidor() {
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(async () => {
            try {
                const dados = getDadosLocais();
                const resp = await fetch('/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });
if (!resp.ok) throw new Error('Falha no POST /sync: ' + resp.status);
console.log('[sync] Dados enviados ao servidor.');
alert('✅ Sync enviado com sucesso!');
  } catch (err) {
                console.warn('[sync] Falha ao enviar:', err);
alert('❌ Erro sync: ' + err.message);
}
        }, 1500);
    }

    // ── Baixar dados do servidor e fazer merge ──
    async function sincronizarComServidor() {
        try {
            // 1. Pega dados locais antes de qualquer coisa
            const dadosLocais = getDadosLocais();
            const temDadosLocais = Object.keys(dadosLocais).length > 0;

            // 2. Busca dados do servidor
            const resp = await fetch('/sync');
            if (!resp.ok) throw new Error('Falha ao buscar /sync');
            const dadosServidor = await resp.json();
            const temDadosServidor = Object.keys(dadosServidor).length > 0;

            if (!temDadosServidor) {
                // Servidor vazio — envia dados locais
                console.log('[sync] Servidor vazio, enviando dados locais.');
                enviarParaServidor();
                return;
            }

            if (!temDadosLocais) {
                // Local vazio — baixa dados do servidor
                console.log('[sync] Local vazio, carregando dados do servidor.');
                Object.entries(dadosServidor).forEach(([chave, valor]) => {
                    if (valor !== null && valor !== undefined) {
                        localStorage.setItem(chave, valor);
                    }
                });
                return;
            }

            // Ambos têm dados — merge: servidor ganha em chaves que existem nos dois,
            // mas mantém dados locais que não estão no servidor
            Object.entries(dadosServidor).forEach(([chave, valor]) => {
                if (valor !== null && valor !== undefined) {
                    localStorage.setItem(chave, valor);
                }
            });

            // Envia para o servidor as chaves locais que o servidor não tinha
            const chavesNovas = Object.keys(dadosLocais).filter(k => !(k in dadosServidor));
            if (chavesNovas.length > 0) {
                console.log('[sync] Enviando chaves novas ao servidor:', chavesNovas);
                enviarParaServidor();
            }

            console.log('[sync] Dados carregados do servidor.');
        } catch (err) {
            console.warn('[sync] Erro na sincronização:', err);
        }
    }

    // ── Interceptar localStorage.setItem ──
    const setItemOriginal = localStorage.setItem.bind(localStorage);
localStorage.setItem = function (chave, valor) {
    setItemOriginal(chave, valor);
    enviarParaServidor();
    alert('setItem interceptado: ' + chave);
};

    const removeItemOriginal = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = function (chave) {
        removeItemOriginal(chave);
        enviarParaServidor();
    };

    // ── Envia ao sair da página ──
    window.addEventListener('beforeunload', () => {
        const dados = getDadosLocais();
        const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
        navigator.sendBeacon('/sync', blob);
    });

    // ── Inicialização ──
    window.syncPronto = sincronizarComServidor();
    
    // Botão manual de sync para debug
window.syncManual = function() {
    const dados = getDadosLocais();
    alert('Enviando ' + Object.keys(dados).length + ' chaves...');
    fetch('/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    }).then(r => alert('Resultado: ' + r.status))
      .catch(e => alert('Erro: ' + e.message));
};
})();