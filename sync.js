// ============================================================
//  SYNC.JS — sincroniza localStorage com o servidor
// ============================================================
//
// Inclua este arquivo no <head> ou antes do </body> de TODAS as
// páginas HTML, ANTES dos outros scripts que usam localStorage:
//
//   <script src="sync.js"></script>
//   <script src="seu-script-principal.js"></script>
//
// Funcionamento:
//  1. Ao carregar a página, busca os dados do servidor (/sync) e
//     escreve no localStorage ANTES de qualquer outro script rodar.
//  2. Depois disso, fica "ouvindo" alterações no localStorage e
//     envia tudo para o servidor automaticamente (com um pequeno
//     atraso, para não enviar a cada tecla digitada).

(function () {

    // Mesma lista de chaves usada no exportarBackup() do seu app
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

    // ── 1. Baixar dados do servidor e popular o localStorage ──
    async function baixarDoServidor() {
        try {
            const resp = await fetch('/sync');
            if (!resp.ok) throw new Error('Falha ao buscar /sync');
            const dados = await resp.json();

            Object.entries(dados).forEach(([chave, valor]) => {
                if (valor === null || valor === undefined) return;
                // O valor já vem como veio salvo (string, já que localStorage só guarda string)
                localStorage.setItem(chave, valor);
            });

            console.log('[sync] Dados enviados ao servidor.');
document.title = '✅ Sync OK ' + new Date().toLocaleTimeString();
        } catch (err) {
            console.warn('[sync] Falha ao enviar dados ao servidor:', err);
document.title = '❌ Sync ERRO: ' + err.message;
            // Continua normalmente usando o que já está no localStorage local
        }
    }

    // ── 2. Enviar dados do localStorage para o servidor ──
    let enviandoTimeout = null;

    function enviarParaServidor() {
        clearTimeout(enviandoTimeout);
        enviandoTimeout = setTimeout(async () => {
            try {
                const dados = {};
                getTodasAsChaves().forEach(chave => {
                    const valor = localStorage.getItem(chave);
                    if (valor !== null) dados[chave] = valor;
                });

                await fetch('/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dados)
                });

                console.log('[sync] Dados enviados ao servidor.');
            } catch (err) {
                console.warn('[sync] Falha ao enviar dados ao servidor:', err);
            }
        }, 1500); // espera 1.5s de "silêncio" antes de enviar
    }

    // ── 3. Interceptar localStorage.setItem para disparar o envio ──
    const setItemOriginal = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (chave, valor) {
        setItemOriginal(chave, valor);
        enviarParaServidor();
    };

    const removeItemOriginal = localStorage.removeItem.bind(localStorage);
    localStorage.removeItem = function (chave) {
        removeItemOriginal(chave);
        enviarParaServidor();
    };

    // ── 4. Também envia ao sair/trocar de página, por garantia ──
    window.addEventListener('beforeunload', () => {
        // Envio síncrono usando sendBeacon (mais confiável ao fechar a aba)
        const dados = {};
        getTodasAsChaves().forEach(chave => {
            const valor = localStorage.getItem(chave);
            if (valor !== null) dados[chave] = valor;
        });
        const blob = new Blob([JSON.stringify(dados)], { type: 'application/json' });
        navigator.sendBeacon('/sync', blob);
    });

    // ── Inicialização ──
    // IMPORTANTE: como isso é assíncrono, os outros scripts podem rodar
    // ANTES dos dados chegarem do servidor na primeiríssima carga.
    // Por isso, expomos uma Promise que outros scripts podem aguardar
    // se quiserem (opcional).
    window.syncPronto = baixarDoServidor();

})();
