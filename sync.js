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
    let _btnSync = null;
    let enviandoTimeout = null;

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

    function mostrarBotao() {
        if (_btnSync) _btnSync.style.display = 'block';
    }

    async function enviarParaServidor() {
        if (!_alteracaoPendente) return;
        try {
            if (_btnSync) _btnSync.textContent = '⏳ Salvando...';
            const dados = getDadosLocais();
            await fetch('/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
            _alteracaoPendente = false;
            console.log('[sync] Enviado.');
            if (_btnSync) {
                _btnSync.textContent = '✅ Salvo!';
                setTimeout(() => {
                    if (_btnSync) {
                        _btnSync.textContent = '☁️ Salvar na nuvem';
                        _btnSync.style.display = 'none';
                    }
                }, 2000);
            }
        } catch (err) {
            console.warn('[sync] Erro ao enviar:', err);
            if (_btnSync) _btnSync.textContent = '❌ Erro - tente novamente';
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

    // Interceptar setItem
    localStorage.setItem = function (chave, valor) {
        setItemOriginal(chave, valor);
        _alteracaoPendente = true;
        mostrarBotao();
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(enviarParaServidor, 1500);
    };

    localStorage.removeItem = function (chave) {
        removeItemOriginal(chave);
        _alteracaoPendente = true;
        mostrarBotao();
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

    // Cria botão após DOM carregar
    window.addEventListener('DOMContentLoaded', function () {
        _btnSync = document.createElement('button');
        _btnSync.textContent = '☁️ Salvar na nuvem';
        _btnSync.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;background:#10b981;color:white;border:none;padding:12px 16px;border-radius:10px;font-size:14px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);display:none;';
        _btnSync.onclick = function () {
            _alteracaoPendente = true;
            enviarParaServidor();
        };
        document.body.appendChild(_btnSync);
    });

    // Inicialização: só baixa
    window.syncPronto = baixarDoServidor();

})();