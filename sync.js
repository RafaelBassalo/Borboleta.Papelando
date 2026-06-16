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

    let _alteracaoPendente = false;

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
        if (!_alteracaoPendente) return;
        try {
            const dados = getDadosLocais();
            await fetch('/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            _alteracaoPendente = false;
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
                    if (atual !== String(valor)) {
                        setItemOriginal(chave, valor);
                        mudou = true;
                    }
                }
            });

            console.log('[sync] Baixado. Mudou:', mudou);
            if (mudou) location.reload();
        } catch (err) {
            console.warn('[sync] Erro ao baixar:', err);
        }
    }

    // Interceptar setItem — marca que houve alteração
    let enviandoTimeout = null;
    localStorage.setItem = function (chave, valor) {
        setItemOriginal(chave, valor);
        _alteracaoPendente = true;
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(enviarParaServidor, 1500);
    };

    localStorage.removeItem = function (chave) {
        removeItemOriginal(chave);
        _alteracaoPendente = true;
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(enviarParaServidor, 1500);
    };

    // Envia ao sair da página
    window.addEventListener('beforeunload', () => {
        if (!_alteracaoPendente) return;
        const dados = getDadosLocais();
        const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
        navigator.sendBeacon('/sync', blob);
    });

    // Inicialização: só baixa, não envia
    window.syncPronto = baixarDoServidor();

})();