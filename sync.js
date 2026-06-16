(function () {

    const CHAVES_FIXAS = [
        'custosFixos', 'produtosCadastrados', 'clientesCadastrados',
        'orcamentoProdutos', 'orcamentosSalvos', 'tempoProducaoTotal',
        'nomeCliente', 'produtoFinal', 'mesPedidoOrcamento',
        'statusPedidoOrcamento', 'pagamentoPedidoOrcamento',
        'empresaNome', 'whatsappEmpresa', 'instagramEmpresa',
        'chavePix', 'pixCode', 'logoEmpresa'
    ];

    const setItemOriginal = localStorage.setItem.bind(localStorage);
    const removeItemOriginal = localStorage.removeItem.bind(localStorage);

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

    async function enviarParaServidor() {
        try {
            const dados = getDadosLocais();
            if (Object.keys(dados).length === 0) return;
            await fetch('/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            console.log('[sync] Enviado.');
        } catch (err) {
            console.warn('[sync] Erro ao enviar:', err);
        }
    }

   async function baixarDoServidor() {
    try {
        const resp = await fetch('/sync');
        if (!resp.ok) throw new Error('Falha GET /sync');
        const dados = await resp.json();

        let mudou = false;
        Object.entries(dados).forEach(([chave, item]) => {
            const valor = item?.valor ?? item;
            if (valor !== null && valor !== undefined) {
                const atual = localStorage.getItem(chave);
                if (atual !== valor) {
                    setItemOriginal(chave, valor);
                    mudou = true;
                }
            }
        });

        console.log('[sync] Baixado do servidor. Mudou:', mudou);
        if (mudou) {
            console.log('[sync] Dados novos detectados, recarregando...');
            location.reload();
        }
    } catch (err) {
        console.warn('[sync] Erro ao baixar:', err);
    }
}

    // Interceptar setItem
    let enviandoTimeout = null;
    localStorage.setItem = function (chave, valor) {
        setItemOriginal(chave, valor);
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(enviarParaServidor, 1500);
    };

    localStorage.removeItem = function (chave) {
        removeItemOriginal(chave);
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(enviarParaServidor, 1500);
    };

    // Envia ao sair
    window.addEventListener('beforeunload', () => {
        const dados = getDadosLocais();
        const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
        navigator.sendBeacon('/sync', blob);
    });

    // Envio periódico a cada 4 segundos (para iOS)
    setInterval(enviarParaServidor, 4000);

    // Inicialização: primeiro envia, depois baixa
    window.syncPronto = enviarParaServidor().then(baixarDoServidor);

})();