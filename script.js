// ============================================================
//  UTILITÁRIOS GERAIS
// ============================================================

function formatBRL(value) {
    const number = Number(value) || 0;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}


// ============================================================
//  STORAGE — CUSTOS FIXOS
// ============================================================

function loadCustosFixos() {
    return JSON.parse(localStorage.getItem('custosFixos')) || {
        salario: 0,
        agua: 0,
        luz: 0,
        telefone: 0,
        internet: 0,
        mei: 0,
        plano: 0,
        outros: 0,
        horasDia: 8,
        diasMes: 20,
        markup: 1.33,
        investimentoPercent: 0,
        lucroPercent: 0
    };
}

function saveCustosFixos(custos) {
    localStorage.setItem('custosFixos', JSON.stringify(custos));
}


// ============================================================
//  STORAGE — PRODUTOS CADASTRADOS (datalist)
// ============================================================

function loadProdutosCadastrados() {
    return JSON.parse(localStorage.getItem('produtosCadastrados')) || [];
}

function saveProdutosCadastrados(produtos) {
    localStorage.setItem('produtosCadastrados', JSON.stringify(produtos));
}

function updateProdutosDatalist() {
    const datalist = document.getElementById('produtosDatalist');
    if (!datalist) return;
    const produtos = loadProdutosCadastrados();
    datalist.innerHTML = '';
    produtos.forEach(p => {
        const option = document.createElement('option');
        option.value = p.nome;
        datalist.appendChild(option);
    });
}


// ============================================================
//  STORAGE — ORÇAMENTO (produtos do orçamento atual)
// ============================================================

function loadOrcamentoProdutos() {
    return JSON.parse(localStorage.getItem('orcamentoProdutos')) || [];
}

function saveOrcamentoProdutos(produtos) {
    localStorage.setItem('orcamentoProdutos', JSON.stringify(produtos));
}


// ============================================================
//  STORAGE — DADOS EXTRAS DO ORÇAMENTO
// ============================================================

function loadTempoProducaoTotal() {
    return Number(localStorage.getItem('tempoProducaoTotal')) || '';
}

function saveTempoProducaoTotal(tempo) {
    localStorage.setItem('tempoProducaoTotal', Number(tempo) || 0);
}

function loadNomeCliente() {
    return localStorage.getItem('nomeCliente') || '';
}

function saveNomeCliente(nome) {
    localStorage.setItem('nomeCliente', nome);
}

function loadProdutoFinal() {
    return localStorage.getItem('produtoFinal') || '';
}

function saveProdutoFinal(produto) {
    localStorage.setItem('produtoFinal', produto);
}

function loadMesPedidoOrcamento() {
    return localStorage.getItem('mesPedidoOrcamento') || '2026-05';
}

function saveMesPedidoOrcamento(mes) {
    localStorage.setItem('mesPedidoOrcamento', mes);
}

function loadStatusPedidoOrcamento() {
    return localStorage.getItem('statusPedidoOrcamento') || 'pendente';
}

function saveStatusPedidoOrcamento(status) {
    localStorage.setItem('statusPedidoOrcamento', status);
}

function loadPagamentoPedidoOrcamento() {
    return localStorage.getItem('pagamentoPedidoOrcamento') || 'nao_pago';
}

function savePagamentoPedidoOrcamento(pagamento) {
    localStorage.setItem('pagamentoPedidoOrcamento', pagamento);
}


// ============================================================
//  STORAGE — ORÇAMENTOS SALVOS
// ============================================================

function loadOrcamentosSalvos() {
    return JSON.parse(localStorage.getItem('orcamentosSalvos')) || [];
}

function saveOrcamentoSalvo(orcamento) {
    const orcamentos = loadOrcamentosSalvos();
    orcamentos.push(orcamento);
    localStorage.setItem('orcamentosSalvos', JSON.stringify(orcamentos));
}

function deleteOrcamentoSalvo(id) {
    const orcamentos = loadOrcamentosSalvos().filter(item => item.id !== id);
    localStorage.setItem('orcamentosSalvos', JSON.stringify(orcamentos));
    updateOrcamentosSalvosTable();
}


// ============================================================
//  STORAGE — PEDIDOS (por mês)
// ============================================================

function loadPedidos(month) {
    return JSON.parse(localStorage.getItem('pedidos-' + month)) || [];
}

function savePedidos(pedidos, month) {
    localStorage.setItem('pedidos-' + month, JSON.stringify(pedidos));
}

function removePedidoById(id, month) {
    const lista = loadPedidos(month).filter(item => String(item.id) !== String(id));
    savePedidos(lista, month);
}


// ============================================================
//  CÁLCULOS
// ============================================================

function calculateSpent(produto) {
    const valorPacote      = Number(produto.valorProduto)    || 0;
    const quantidadePacote = Number(produto.quantidadePacote) || 1;
    const quantidadeUsada  = Number(produto.quantidadeUtilizada) || 0;
    const valorUnitario    = quantidadePacote > 0 ? valorPacote / quantidadePacote : 0;
    return valorUnitario * quantidadeUsada;
}

function calculateCustoHora() {
    const custos = loadCustosFixos();
    const totalCustos = [
        custos.salario, custos.agua, custos.luz, custos.telefone,
        custos.internet, custos.mei, custos.plano, custos.outros
    ].map(v => Number(v) || 0).reduce((sum, v) => sum + v, 0);

    const horasPorDia = Number(custos.horasDia) || 8;
    const diasPorMes  = Number(custos.diasMes)  || 20;
    const totalHoras  = horasPorDia * diasPorMes || 160;
    return totalCustos / totalHoras;
}


// ============================================================
//  TABELA DE CONFECÇÃO (tempo de produção)
// ============================================================

function updateConfeccaoTable() {
    const tbody = document.getElementById('confeccaoTableBody');
    if (!tbody) return;

    const custos        = loadCustosFixos();
    const markup        = Number(custos.markup) || 1.33;
    const custoHora     = calculateCustoHora();
    const totalTempoMin = loadTempoProducaoTotal();
    const totalTempoHoras = totalTempoMin / 60;
    const totalValor    = custoHora * totalTempoHoras * markup;

    tbody.innerHTML = '';
    const row = tbody.insertRow();

    // Célula: input de tempo total
    const tempoInput = document.createElement('input');
    tempoInput.type        = 'number';
    tempoInput.min         = '0';
    tempoInput.step        = '1';
    tempoInput.value       = totalTempoMin || '';
    tempoInput.placeholder = 'Tempo total (min)';
    tempoInput.className   = 'small-input';
    tempoInput.addEventListener('change', () => {
        saveTempoProducaoTotal(tempoInput.value);
        updateConfeccaoTable();
    });
    row.insertCell(0).appendChild(tempoInput);

    row.insertCell(1).textContent = formatBRL(custoHora);
    row.insertCell(2).textContent = formatBRL(totalValor);

    updateResultadoTable();
}


// ============================================================
//  TABELA DE RESULTADO FINAL
// ============================================================

function updateResultadoTable() {
    const tbody = document.getElementById('resultadoTableBody');
    if (!tbody) return;

    const produtos             = loadOrcamentoProdutos();
    const custos               = loadCustosFixos();
    const markup               = Number(custos.markup)               || 1.33;
    const investimentoPercent  = Number(custos.investimentoPercent)  || 0;
    const lucroPercent         = Number(custos.lucroPercent)         || 0;

    const totalMaterial    = produtos.reduce((sum, p) => sum + calculateSpent(p), 0);
    const totalTempoMin    = loadTempoProducaoTotal();
    const totalTempoHoras  = totalTempoMin / 60;
    const totalProducao    = calculateCustoHora() * totalTempoHoras * markup;
    const totalBruto       = totalMaterial + totalProducao;
    const valorInvestimento = totalBruto * investimentoPercent / 100;
    const valorLucro        = totalBruto * lucroPercent / 100;
    const totalGeral        = totalBruto + valorInvestimento + valorLucro;

    tbody.innerHTML = '';
    const row = tbody.insertRow();

    // Input: nome do cliente
    const clienteInput       = document.createElement('input');
    clienteInput.type        = 'text';
    clienteInput.value       = loadNomeCliente();
    clienteInput.className   = 'small-input';
    clienteInput.placeholder = 'Nome do cliente';
    clienteInput.addEventListener('change', () => saveNomeCliente(clienteInput.value));
    row.insertCell(0).appendChild(clienteInput);

    // Input: nome do produto final
    const produtoInput       = document.createElement('input');
    produtoInput.type        = 'text';
    produtoInput.value       = loadProdutoFinal();
    produtoInput.className   = 'small-input';
    produtoInput.placeholder = 'Nome do produto';
    produtoInput.addEventListener('change', () => saveProdutoFinal(produtoInput.value));
    row.insertCell(1).appendChild(produtoInput);

    row.insertCell(2).textContent = formatBRL(totalMaterial);
    row.insertCell(3).textContent = formatBRL(totalProducao);
    row.insertCell(4).textContent = formatBRL(totalGeral);

    const el = id => document.getElementById(id);
    if (el('investimentoValor')) el('investimentoValor').textContent = formatBRL(valorInvestimento);
    if (el('lucroValor'))        el('lucroValor').textContent        = formatBRL(valorLucro);
    if (el('markupValor'))       el('markupValor').textContent       = markup.toFixed(2);
}


// ============================================================
//  TABELA DE ORÇAMENTO (lista de materiais)
// ============================================================

function updateOrcamentoTable() {
    const tbody      = document.getElementById('orcamentoTableBody');
    const totalGasto = document.getElementById('orcamentoTotalGasto');
    if (!tbody || !totalGasto) return;

    const produtos = loadOrcamentoProdutos();
    tbody.innerHTML = '';
    let total = 0;

    produtos.forEach(produto => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = produto.nomeProduto;
        row.insertCell(1).textContent = produto.quantidadePacote;
        row.insertCell(2).textContent = formatBRL(produto.valorProduto);

        // Input: quantidade utilizada
        const qtdInput       = document.createElement('input');
        qtdInput.type        = 'number';
        qtdInput.min         = '0';
        qtdInput.step        = '0.5';
        qtdInput.value       = produto.quantidadeUtilizada || '';
        qtdInput.className   = 'small-input';

        const valorGastoCell = row.insertCell(4);
        valorGastoCell.textContent = formatBRL(calculateSpent(produto));

        qtdInput.addEventListener('input', () => {
            produto.quantidadeUtilizada = qtdInput.value;
            saveOrcamentoProdutos(produtos);
            valorGastoCell.textContent = formatBRL(calculateSpent(produto));
            totalGasto.textContent     = formatBRL(
                produtos.reduce((sum, item) => sum + calculateSpent(item), 0)
            );
            updateResultadoTable();
        });
        row.insertCell(3).appendChild(qtdInput);

        // Botões: editar e excluir
        const actionsCell      = row.insertCell(5);
        actionsCell.style.display = 'flex';
        actionsCell.style.gap    = '8px';

        const editButton = document.createElement('button');
        editButton.type  = 'button';
        editButton.style.cursor = 'pointer';
        editButton.innerHTML    = '<img src="./imagens/icons8-editar.gif" alt="Editar">';
        editButton.addEventListener('click', () => {
            document.getElementById('produtoId').value          = produto.id;
            document.getElementById('nomeProduto').value        = produto.nomeProduto;
            document.getElementById('quantidadePacote').value   = produto.quantidadePacote;
            document.getElementById('valorProduto').value       = produto.valorProduto;
            document.querySelector('#produtoForm button[type="submit"]').innerHTML =
                '<img src="./imagens/icons8-salvar-48.png" alt="Salvar"><br>Atualizar';
            produtoFormContainer.classList.add('visible');
        });
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.type  = 'button';
        deleteButton.style.cursor = 'pointer';
        deleteButton.innerHTML    = '<img src="./imagens/icons8-botão-excluir.gif" alt="Excluir">';
        deleteButton.addEventListener('click', () => {
            saveOrcamentoProdutos(produtos.filter(item => String(item.id) !== String(produto.id)));
            updateOrcamentoTable();
        });
        actionsCell.appendChild(deleteButton);

        total += calculateSpent(produto);
    });

    totalGasto.textContent = formatBRL(total);
    updateConfeccaoTable();
    updateResultadoTable();
}


// ============================================================
//  TABELA DE ORÇAMENTOS SALVOS
// ============================================================

function updateOrcamentosSalvosTable() {
    const tbody = document.getElementById('orcamentosSalvosBody');
    if (!tbody) return;

    const orcamentos = loadOrcamentosSalvos();
    tbody.innerHTML  = '';

    orcamentos.forEach(orcamento => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = orcamento.cliente;
        row.insertCell(1).textContent = orcamento.produto   || '';
        row.insertCell(2).textContent = orcamento.mes       || '';
        row.insertCell(3).textContent = orcamento.status    || '';
        row.insertCell(4).textContent = orcamento.pagamento === 'pago' ? 'Pago' : 'Não pago';
        row.insertCell(5).textContent = formatBRL(orcamento.material);
        row.insertCell(6).textContent = formatBRL(orcamento.producao);
        row.insertCell(7).textContent = formatBRL(orcamento.total);
        row.insertCell(8).textContent = orcamento.data;

        const actionsCell      = row.insertCell(9);
        actionsCell.style.display = 'flex';
        actionsCell.style.gap    = '8px';

        const transformarButton = document.createElement('button');
        transformarButton.type  = 'button';
        transformarButton.style.cursor = 'pointer';
        transformarButton.innerHTML    =
            '<img src="./imagens/icons8-ordem-de-compra-64.png" alt="Transformar"> Transformar em Pedido';
        transformarButton.addEventListener('click', () => transformarEmPedido(orcamento));
        actionsCell.appendChild(transformarButton);

        const deleteButton = document.createElement('button');
        deleteButton.type  = 'button';
        deleteButton.style.cursor = 'pointer';
        deleteButton.innerHTML    = '<img src="./imagens/icons8-botão-excluir.gif" alt="Excluir">';
        deleteButton.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja excluir este orçamento?')) {
                deleteOrcamentoSalvo(orcamento.id);
            }
        });
        actionsCell.appendChild(deleteButton);
    });
}


// ============================================================
//  AÇÕES — ORÇAMENTO
// ============================================================

function limparOrcamento() {
    const produtos = loadOrcamentoProdutos();
    produtos.forEach(p => { p.quantidadeUtilizada = 0; });
    saveOrcamentoProdutos(produtos);

    ['tempoProducaoTotal', 'nomeCliente', 'produtoFinal',
     'mesPedidoOrcamento', 'statusPedidoOrcamento', 'pagamentoPedidoOrcamento']
        .forEach(key => localStorage.removeItem(key));

    updateOrcamentoTable();
    updateConfeccaoTable();
    updateResultadoTable();
    initializeOrcamentoExtras();
}

function salvarOrcamento() {
    const nomeCliente = loadNomeCliente();
    if (!nomeCliente.trim()) {
        alert('Por favor, informe o nome do cliente');
        return;
    }

    const produtos = loadOrcamentoProdutos();
    if (produtos.length === 0) {
        alert('Adicione pelo menos um produto ao orçamento');
        return;
    }

    const custoHora       = calculateCustoHora();
    const totalMaterial   = produtos.reduce((sum, p) => sum + calculateSpent(p), 0);
    const totalTempoMin   = loadTempoProducaoTotal();
    const totalTempoHoras = totalTempoMin / 60;
    const totalProducao   = custoHora * totalTempoHoras;
    const totalGeral      = totalMaterial + totalProducao;

    const orcamento = {
        id:        Date.now(),
        cliente:   nomeCliente,
        produto:   loadProdutoFinal() || (produtos[0] ? produtos[0].nomeProduto : 'Orçamento'),
        material:  totalMaterial,
        producao:  totalProducao,
        total:     totalGeral,
        data:      new Date().toLocaleDateString('pt-BR'),
        mes:       loadMesPedidoOrcamento(),
        status:    loadStatusPedidoOrcamento(),
        pagamento: loadPagamentoPedidoOrcamento(),
        produtos:  JSON.stringify(produtos)
    };

    saveOrcamentoSalvo(orcamento);
    alert('Orçamento salvo com sucesso!');
    limparOrcamento();
    updateOrcamentosSalvosTable();
}

function transformarEmPedido(orcamento) {
    const hoje      = new Date().toISOString().split('T')[0];
    const mesAtual  = hoje.substring(0, 7);
    const pedidoMes = orcamento.mes || mesAtual;

    const novoPedido = {
        id:        Date.now(),
        cliente:   orcamento.cliente,
        produto:   orcamento.produto || ('Orçamento - ' + orcamento.data),
        valor:     orcamento.total,
        data:      hoje,
        mes:       pedidoMes,
        status:    orcamento.status   || 'pendente',
        pagamento: orcamento.pagamento || 'nao_pago'
    };

    const pedidosAtuais = loadPedidos(pedidoMes);
    pedidosAtuais.push(novoPedido);
    savePedidos(pedidosAtuais, pedidoMes);

    deleteOrcamentoSalvo(orcamento.id);
    alert('Orçamento transformado em pedido com sucesso!');
    window.location.href = 'pedido.html';
}

function initializeOrcamentoExtras() {
    const bindings = [
        { id: 'produtoFinal',            load: loadProdutoFinal,           save: saveProdutoFinal,           extra: updateResultadoTable },
        { id: 'mesPedidoOrcamento',      load: loadMesPedidoOrcamento,     save: saveMesPedidoOrcamento },
        { id: 'statusPedidoOrcamento',   load: loadStatusPedidoOrcamento,  save: saveStatusPedidoOrcamento },
        { id: 'pagamentoPedidoOrcamento',load: loadPagamentoPedidoOrcamento,save: savePagamentoPedidoOrcamento }
    ];

    bindings.forEach(({ id, load, save, extra }) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = load();
        el.addEventListener('change', () => {
            save(el.value);
            if (extra) extra();
        });
    });
}


// ============================================================
//  TABELAS DE PEDIDOS
// ============================================================

function updateResumoClientesTable(month) {
    const summaryBody         = document.getElementById('resumoClientesTableBody');
    const resumoTotalPedidos  = document.getElementById('resumoTotalPedidos');
    const resumoTotalPago     = document.getElementById('resumoTotalPago');
    const resumoTotalDevido   = document.getElementById('resumoTotalDevido');
    if (!summaryBody || !resumoTotalPedidos) return;

    const pedidos = loadPedidos(month);
    const summary = {};

    pedidos.forEach(pedido => {
        const nome  = pedido.cliente || 'Sem Cliente';
        const valor = Number(pedido.valor) || 0;
        const pago  = (pedido.pagamento || 'nao_pago') === 'pago';

        if (!summary[nome]) {
            summary[nome] = { cliente: nome, totalPedidos: 0, totalPago: 0, totalDevido: 0 };
        }
        summary[nome].totalPedidos += valor;
        if (pago) summary[nome].totalPago   += valor;
        else      summary[nome].totalDevido += valor;
    });

    summaryBody.innerHTML = '';
    let totalPedidosGeral = 0, totalPagoGeral = 0, totalDevidoGeral = 0;

    Object.values(summary).forEach(item => {
        const row = summaryBody.insertRow();
        row.insertCell(0).textContent = item.cliente;
        row.insertCell(1).textContent = formatBRL(item.totalPedidos);
        row.insertCell(2).textContent = formatBRL(item.totalPago);
        row.insertCell(3).textContent = formatBRL(item.totalDevido);

        totalPedidosGeral += item.totalPedidos;
        totalPagoGeral    += item.totalPago;
        totalDevidoGeral  += item.totalDevido;
    });

    resumoTotalPedidos.textContent = formatBRL(totalPedidosGeral);
    resumoTotalPago.textContent    = formatBRL(totalPagoGeral);
    resumoTotalDevido.textContent  = formatBRL(totalDevidoGeral);
}

function updatePedidosTable(month) {
    const tbody     = document.getElementById('pedidosTableBody');
    const totalCell = document.getElementById('pedidosTotalValor');
    if (!tbody || !totalCell) return;

    tbody.innerHTML = '';
    const pedidos   = loadPedidos(month);
    let total       = 0;

    pedidos.forEach(pedido => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = pedido.cliente;
        row.insertCell(1).textContent = pedido.produto;
        row.insertCell(2).textContent = formatBRL(pedido.valor);
        row.insertCell(3).textContent = pedido.data;
        row.insertCell(4).textContent = pedido.status;
        row.insertCell(5).textContent = (pedido.pagamento || 'nao_pago') === 'pago' ? 'Pago' : 'Não pago';

        const actionsCell = row.insertCell(6);

        const editButton = document.createElement('button');
        editButton.type  = 'button';
        editButton.style.cursor = 'pointer';
        editButton.innerHTML    = '<img src="./imagens/icons8-editar.gif" alt="Editar">';
        editButton.addEventListener('click', () => fillPedidoForm(pedido));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.type  = 'button';
        deleteButton.style.cursor = 'pointer';
        deleteButton.innerHTML    = '<img src="./imagens/icons8-botão-excluir.gif" alt="Excluir">';
        deleteButton.addEventListener('click', () => {
            if (!confirm('Deseja realmente excluir este pedido?')) return;
            savePedidos(loadPedidos(month).filter(item => String(item.id) !== String(pedido.id)), month);
            updatePedidosTable(month);
        });
        actionsCell.appendChild(deleteButton);

        total += Number(pedido.valor) || 0;
    });

    totalCell.textContent = formatBRL(total);
    updateResumoClientesTable(month);
}


// ============================================================
//  FORMULÁRIO DE PEDIDOS
// ============================================================

function resetPedidoForm() {
    const pedidoForm = document.getElementById('pedidoForm');
    if (!pedidoForm) return;
    pedidoForm.reset();
    document.getElementById('mes').value             = '2026-05';
    document.getElementById('pagamento').value       = 'nao_pago';
    document.getElementById('editId').value          = '';
    document.getElementById('editOriginalMes').value = '';
    document.getElementById('pedidoFormContainer').classList.remove('visible');
    document.querySelector('#pedidoForm button[type="submit"]').textContent = 'Salvar Pedido';
}

function fillPedidoForm(pedido) {
    const pedidoFormContainer = document.getElementById('pedidoFormContainer');
    const originalMes = pedido.mes || '2026-05';
    document.getElementById('editId').value          = pedido.id;
    document.getElementById('editOriginalMes').value = originalMes;
    document.getElementById('cliente').value         = pedido.cliente;
    document.getElementById('produto').value         = pedido.produto;
    document.getElementById('valor').value           = pedido.valor;
    document.getElementById('data').value            = pedido.data;
    document.getElementById('mes').value             = originalMes;
    document.getElementById('status').value          = pedido.status;
    document.getElementById('pagamento').value       = pedido.pagamento || 'nao_pago';
    document.querySelector('#pedidoForm button[type="submit"]').textContent = 'Atualizar Pedido';
    if (pedidoFormContainer) pedidoFormContainer.classList.add('visible');
}


// ============================================================
//  INICIALIZAÇÃO DOS EVENTOS (DOM pronto)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- Referências de elementos ---
    const el = id => document.getElementById(id);

    const novoProdutoBtn             = el('novoProdutoBtn');
    const produtoFormContainer       = el('produtoFormContainer');
    const cancelarProdutoBtn         = el('cancelarProdutoBtn');
    const produtoForm                = el('produtoForm');

    const novoCadastroProduto        = el('novoCadastroProduto');
    const cadastroProdutoContainer   = el('cadastroProdutoContainer');
    const cancelarCadastroProdutoBtn = el('cancelarCadastroProdutoBtn');
    const cadastroProdutoForm        = el('cadastroProdutoForm');

    const novoCustoBtn               = el('novoCustoBtn');
    const custoFormContainer         = el('custoFormContainer');
    const cancelarCustoBtn           = el('cancelarCustoBtn');
    const custoForm                  = el('custoForm');

    const novoPedidoBtn              = el('novoPedidoBtn');
    const pedidoFormContainer        = el('pedidoFormContainer');
    const cancelarPedidoBtn          = el('cancelarPedidoBtn');
    const pedidoForm                 = el('pedidoForm');

    const monthSelector              = el('monthSelector');
    const limparBtn                  = el('limparOrcamentoBtn');
    const salvarBtn                  = el('salvarOrcamentoBtn');

    let currentMonth = monthSelector ? monthSelector.value : '2026-05';

    // ---- Cadastro de produto (datalist) ----
    if (novoCadastroProduto) {
        novoCadastroProduto.addEventListener('click', () => {
            if (pedidoFormContainer) pedidoFormContainer.classList.remove('visible');
            cadastroProdutoContainer.classList.toggle('visible');
        });
    }

    if (cancelarCadastroProdutoBtn) {
        cancelarCadastroProdutoBtn.addEventListener('click', () => {
            cadastroProdutoContainer.classList.remove('visible');
            if (cadastroProdutoForm) cadastroProdutoForm.reset();
        });
    }

    if (cadastroProdutoForm) {
        cadastroProdutoForm.addEventListener('submit', event => {
            event.preventDefault();
            const formData = new FormData(cadastroProdutoForm);
            const produtos = loadProdutosCadastrados();
            produtos.push({
                id:    Date.now(),
                nome:  formData.get('nomeProdutoCadastro'),
                valor: formData.get('valorProdutoCadastro')
            });
            saveProdutosCadastrados(produtos);
            updateProdutosDatalist();
            cadastroProdutoForm.reset();
            cadastroProdutoContainer.classList.remove('visible');
            alert('Produto cadastrado com sucesso!');
        });
    }

    // ---- Produto do orçamento ----
    if (novoProdutoBtn) {
        novoProdutoBtn.addEventListener('click', () => {
            if (custoFormContainer) custoFormContainer.classList.remove('visible');
            if (produtoForm) produtoForm.reset();
            el('produtoId').value = '';
            document.querySelector('#produtoForm button[type="submit"]').innerHTML =
                '<img src="./imagens/icons8-salvar-48.png" alt="Salvar"><br>Salvar';
            produtoFormContainer.classList.toggle('visible');
        });
    }

    if (cancelarProdutoBtn) {
        cancelarProdutoBtn.addEventListener('click', () => {
            produtoFormContainer.classList.remove('visible');
        });
    }

    if (produtoForm) {
        produtoForm.addEventListener('submit', event => {
            event.preventDefault();
            const formData  = new FormData(produtoForm);
            const produtos  = loadOrcamentoProdutos();
            const produtoId = formData.get('produtoId');

            if (produtoId) {
                const index = produtos.findIndex(item => String(item.id) === String(produtoId));
                if (index !== -1) {
                    produtos[index] = {
                        ...produtos[index],
                        nomeProduto:      formData.get('nomeProduto'),
                        quantidadePacote: formData.get('quantidadePacote'),
                        valorProduto:     formData.get('valorProduto')
                    };
                }
            } else {
                produtos.push({
                    id:                  Date.now(),
                    nomeProduto:         formData.get('nomeProduto'),
                    quantidadePacote:    formData.get('quantidadePacote'),
                    valorProduto:        formData.get('valorProduto'),
                    quantidadeUtilizada: 0,
                    tempoProducao:       0
                });
            }

            saveOrcamentoProdutos(produtos);
            updateOrcamentoTable();
            produtoForm.reset();
            el('produtoId').value = '';
            document.querySelector('#produtoForm button[type="submit"]').innerHTML =
                '<img src="./imagens/icons8-salvar-48.png" alt="Salvar"><br>Salvar';
            produtoFormContainer.classList.remove('visible');
        });

        updateOrcamentoTable();
        initializeOrcamentoExtras();
    }

    // ---- Custos fixos ----
    if (novoCustoBtn) {
        novoCustoBtn.addEventListener('click', () => {
            if (produtoFormContainer) produtoFormContainer.classList.remove('visible');
            custoFormContainer.classList.toggle('visible');
        });
    }

    if (cancelarCustoBtn) {
        cancelarCustoBtn.addEventListener('click', () => {
            custoFormContainer.classList.remove('visible');
        });
    }

    if (custoForm) {
        // Preenche o formulário com valores salvos
        const custosFixos = loadCustosFixos();
        [
            'salario', 'agua', 'luz', 'telefone', 'internet',
            'mei', 'plano', 'outros', 'horasDia', 'diasMes',
            'markup', 'investimentoPercent', 'lucroPercent'
        ].forEach(campo => {
            const input = el(campo);
            if (input) input.value = custosFixos[campo] || '';
        });

        custoForm.addEventListener('submit', event => {
            event.preventDefault();
            const formData = new FormData(custoForm);
            saveCustosFixos({
                salario:           formData.get('salario'),
                agua:              formData.get('agua'),
                luz:               formData.get('luz'),
                telefone:          formData.get('telefone'),
                internet:          formData.get('internet'),
                mei:               formData.get('mei'),
                plano:             formData.get('plano'),
                outros:            formData.get('outros'),
                horasDia:          formData.get('horasDia'),
                diasMes:           formData.get('diasMes'),
                markup:            formData.get('markup'),
                investimentoPercent: formData.get('investimentoPercent'),
                lucroPercent:      formData.get('lucroPercent')
            });
            updateConfeccaoTable();
            alert('Custos fixos salvos com sucesso!');
            custoForm.reset();
            custoFormContainer.classList.remove('visible');
        });
    }

    // ---- Botões de orçamento (limpar / salvar) ----
    if (limparBtn) {
        limparBtn.addEventListener('click', () => {
            if (confirm('Deseja limpar todos os campos do orçamento?')) limparOrcamento();
        });
    }

    if (salvarBtn) {
        salvarBtn.addEventListener('click', salvarOrcamento);
    }

    updateOrcamentosSalvosTable();

    // ---- Pedidos ----
    if (novoPedidoBtn) {
        novoPedidoBtn.addEventListener('click', () => {
            if (cadastroProdutoContainer) cadastroProdutoContainer.classList.remove('visible');
            pedidoFormContainer.classList.toggle('visible');
        });
    }

    if (cancelarPedidoBtn) {
        cancelarPedidoBtn.addEventListener('click', resetPedidoForm);
    }

    if (pedidoForm) {
        updatePedidosTable(currentMonth);

        if (monthSelector) {
            monthSelector.addEventListener('change', () => {
                currentMonth = monthSelector.value;
                updatePedidosTable(currentMonth);
            });
        }

        pedidoForm.addEventListener('submit', event => {
            event.preventDefault();
            const formData     = new FormData(pedidoForm);
            const editId       = formData.get('editId');
            const month        = formData.get('mes');
            const originalMonth = formData.get('editOriginalMes') || month;

            const pedidoAtual = {
                id:        editId ? Number(editId) : Date.now(),
                cliente:   formData.get('cliente'),
                produto:   formData.get('produto'),
                valor:     formData.get('valor'),
                data:      formData.get('data'),
                mes:       month,
                status:    formData.get('status'),
                pagamento: formData.get('pagamento')
            };

            if (editId) {
                if (originalMonth !== month) removePedidoById(editId, originalMonth);
                const lista = loadPedidos(month).filter(item => String(item.id) !== String(editId));
                lista.push(pedidoAtual);
                savePedidos(lista, month);
            } else {
                const lista = loadPedidos(month);
                lista.push(pedidoAtual);
                savePedidos(lista, month);
            }

            if (month === currentMonth || originalMonth === currentMonth) {
                updatePedidosTable(currentMonth);
            }

            alert('Pedido salvo com sucesso!');
            resetPedidoForm();
        });
    }

}); // fim DOMContentLoaded