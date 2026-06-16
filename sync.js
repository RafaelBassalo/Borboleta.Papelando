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


    // Botão de sync fixo na tela
window.addEventListener('DOMContentLoaded', function() {
    const btn = document.createElement('button');
    btn.textContent = '☁️ Salvar na nuvem';
    btn.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;background:#10b981;color:white;border:none;padding:12px 16px;border-radius:10px;font-size:14px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    btn.onclick = async function() {
        btn.textContent = '⏳ Salvando...';
        _alteracaoPendente = true;
        await enviarParaServidor();
        btn.textContent = '✅ Salvo!';
        setTimeout(() => { btn.textContent = '☁️ Salvar na nuvem'; }, 2000);
    };
    document.body.appendChild(btn);
});
})();