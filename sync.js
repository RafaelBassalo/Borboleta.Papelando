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
        // 1. PRIMEIRO envia dados locais para o servidor
        const dadosLocais = getDadosLocais();
        if (Object.keys(dadosLocais).length > 0) {
            await fetch('/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dadosLocais)
            });
            console.log('[sync] Dados locais enviados primeiro.');
        }

        // 2. DEPOIS baixa dados do servidor (merge)
        const resp = await fetch('/sync');
        if (!resp.ok) throw new Error('Falha ao buscar /sync');
        const dadosServidor = await resp.json();

        Object.entries(dadosServidor).forEach(([chave, valor]) => {
            if (valor !== null && valor !== undefined) {
                setItemOriginal(chave, valor);
            }
        });

        console.log('[sync] Sincronização completa.');
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
    })
    .then(r => r.json()).then(j => alert('Resultado: ' + JSON.stringify(j)))
      .catch(e => alert('Erro: ' + e.message));
};

// Fallback para iOS: envia a cada 3 segundos automaticamente
setInterval(function() {
    const dados = getDadosLocais();
    fetch('/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    }).catch(() => {});
}, 3000);

})();