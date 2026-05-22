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

function updateClientesDatalist() {
    const datalist = document.getElementById('clientesDatalist');
    if (!datalist) return;
    const clientes = JSON.parse(localStorage.getItem('clientesCadastrados')) || [];
    datalist.innerHTML = '';
    clientes.forEach(c => {
        const option = document.createElement('option');
        option.value = c.nome;
        datalist.appendChild(option);
    });
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


 // ── Troca de abas ──────────────────────────────────────
function ativarAba(id, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (btn) btn.classList.add('active');
    if (id === 'abaFaturamento'      && typeof renderFaturamento      === 'function') renderFaturamento();
    if (id === 'abaPendentes'        && typeof renderPendentes        === 'function') renderPendentes();
    if (id === 'abaOrcamentosSalvos' && typeof updateOrcamentosSalvosTable === 'function') updateOrcamentosSalvosTable();
    if (id === 'abaResumo') {
        const sel = document.getElementById('monthSelectorResumo');
        const mes = sel ? sel.value : '2026-05';
        if (typeof updateResumoClientesTable === 'function') updateResumoClientesTable(mes);
    }
}

        // ── Modal: selecionar produto cadastrado ──────────────
        function formatBRLModal(value) {
            return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

 function abrirModalProdutos() {
    const modal   = document.getElementById('modalProdutos');
    const lista   = document.getElementById('listaProdutosCadastrados');
    let produtos  = JSON.parse(localStorage.getItem('produtosCadastrados')) || [];

    function renderLista() {
        lista.innerHTML = '';

        if (produtos.length === 0) {
            lista.innerHTML = '<li class="sem-produtos">Nenhum produto cadastrado ainda.</li>';
            return;
        }

        produtos.forEach((p, index) => {
            const li = document.createElement('li');
            li.style.display         = 'flex';
            li.style.justifyContent  = 'space-between';
            li.style.alignItems      = 'center';
            li.style.gap             = '8px';

            // Nome + valor (clica para selecionar)
            const info = document.createElement('span');
            info.style.flex   = '1';
            info.style.cursor = 'pointer';
            info.innerHTML = `<span class="prod-nome">${p.nome}</span> 
                              <span class="prod-valor">${formatBRL(p.valor)}</span>`;
            info.addEventListener('click', () => {
                document.getElementById('produto').value = p.nome;
                const campoValor = document.getElementById('valor');
                if (campoValor && !campoValor.value) campoValor.value = p.valor;
                modal.classList.remove('visible');
            });

            // Botão editar
            const editBtn = document.createElement('button');
            editBtn.type      = 'button';
            editBtn.className = 'btn-icon edit';
            editBtn.innerHTML = '<i class="ti ti-edit" aria-hidden="true"></i>';
            editBtn.setAttribute('aria-label', 'Editar');
            editBtn.addEventListener('click', () => {
                const novoNome  = prompt('Novo nome:', p.nome);
                const novoValor = prompt('Novo valor:', p.valor);
                if (novoNome !== null && novoValor !== null) {
                    produtos[index].nome  = novoNome.trim();
                    produtos[index].valor = novoValor;
                    saveProdutosCadastrados(produtos);
                    updateProdutosDatalist();
                    renderLista();
                }
            });

            // Botão excluir
            const delBtn = document.createElement('button');
            delBtn.type      = 'button';
            delBtn.className = 'btn-icon del';
            delBtn.innerHTML = '<i class="ti ti-trash" aria-hidden="true"></i>';
            delBtn.setAttribute('aria-label', 'Excluir');
            delBtn.addEventListener('click', () => {
                if (confirm(`Excluir "${p.nome}"?`)) {
                    produtos.splice(index, 1);
                    saveProdutosCadastrados(produtos);
                    updateProdutosDatalist();
                    renderLista();
                }
            });

            li.appendChild(info);
            li.appendChild(editBtn);
            li.appendChild(delBtn);
            lista.appendChild(li);
        });
    }

    renderLista();
    modal.classList.add('visible');
}
        function fecharModalProdutosFunc() {
            document.getElementById('modalProdutos').classList.remove('visible');
        }

function abrirModalClientes() {
    const modal = document.getElementById('modalClientes');
    const lista = document.getElementById('listaClientesCadastrados');

    function renderLista() {
        const clientes = JSON.parse(localStorage.getItem('clientesCadastrados')) || [];
        lista.innerHTML = '';

        if (clientes.length === 0) {
            lista.innerHTML = '<li class="sem-produtos">Nenhum cliente cadastrado ainda.</li>';
            return;
        }

        clientes.forEach((c, index) => {
            const li = document.createElement('li');
            li.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:8px;';

            const info = document.createElement('span');
            info.style.cssText = 'flex:1;cursor:pointer;';
            info.innerHTML = `<span class="prod-nome">${c.nome}</span>`;
            info.addEventListener('click', () => {
                document.getElementById('cliente').value = c.nome;
                modal.classList.remove('visible');
            });

            const editBtn = document.createElement('button');
            editBtn.type      = 'button';
            editBtn.className = 'btn-icon edit';
            editBtn.innerHTML = '<i class="ti ti-edit" aria-hidden="true"></i>';
            editBtn.setAttribute('aria-label', 'Editar');
            editBtn.addEventListener('click', () => {
                const novoNome = prompt('Novo nome:', c.nome);
                if (novoNome !== null && novoNome.trim()) {
                    const arr = JSON.parse(localStorage.getItem('clientesCadastrados')) || [];
                    arr[index].nome = novoNome.trim();
                    localStorage.setItem('clientesCadastrados', JSON.stringify(arr));
                    updateClientesDatalist();
                    renderLista();
                }
            });

            const delBtn = document.createElement('button');
            delBtn.type      = 'button';
            delBtn.className = 'btn-icon del';
            delBtn.innerHTML = '<i class="ti ti-trash" aria-hidden="true"></i>';
            delBtn.setAttribute('aria-label', 'Excluir');
            delBtn.addEventListener('click', () => {
                if (confirm(`Excluir "${c.nome}"?`)) {
                    const arr = JSON.parse(localStorage.getItem('clientesCadastrados')) || [];
                    arr.splice(index, 1);
                    localStorage.setItem('clientesCadastrados', JSON.stringify(arr));
                    updateClientesDatalist();
                    renderLista();
                }
            });

            li.appendChild(info);
            li.appendChild(editBtn);
            li.appendChild(delBtn);
            lista.appendChild(li);
        });
    }

    renderLista();
    modal.classList.add('visible');
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

        const valorGastoCell = row.insertCell();
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
         const actionsCell = row.insertCell(5);
         actionsCell.style.display = 'flex';
         actionsCell.style.gap = '6px';
         actionsCell.style.alignItems = 'center';

        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.className = 'btn-icon edit';
        editButton.innerHTML = '<i class="ti ti-edit" aria-hidden="true"></i>';
        editButton.setAttribute('aria-label', 'Editar');
        editButton.addEventListener('click', () => {
            document.getElementById('produtoId').value          = produto.id;
            document.getElementById('nomeProduto').value        = produto.nomeProduto;
            document.getElementById('quantidadePacote').value   = produto.quantidadePacote;
            document.getElementById('valorProduto').value       = produto.valorProduto;
            document.querySelector('#produtoForm button[type="submit"]').innerHTML =
                '<i class="ti ti-save" aria-hidden="true"></i>Atualizar';
            if (produtoFormContainer) produtoFormContainer.style.display = 'none';
        });
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.type  = 'button';
        deleteButton.className = 'btn-icon del';
        deleteButton.innerHTML    = '<i class="ti ti-trash" aria-hidden="true"></i>';
        deleteButton.setAttribute('aria-label', 'Excluir');
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

        const actionsCell = row.insertCell(9);
        actionsCell.style.display = 'flex';
        actionsCell.style.gap = '6px';
        actionsCell.style.alignItems = 'center';
        actionsCell.style.flexWrap = 'nowrap';

        const transformarButton = document.createElement('button');
        transformarButton.type  = 'button';
        transformarButton.className = 'btn btn-amber';
        transformarButton.innerHTML = '<i class="ti ti-transfer" aria-hidden="true"></i> Pedido';
        transformarButton.addEventListener('click', () => transformarEmPedido(orcamento));
        actionsCell.appendChild(transformarButton);

        const pdfButton = document.createElement('button');
         pdfButton.type = 'button';
         pdfButton.className = 'btn btn-vermelho';
         pdfButton.innerHTML = '<i class="ti ti-file-type-pdf" aria-hidden="true"></i> PDF';
         pdfButton.addEventListener('click', () => {
         gerarPDFOrcamentoSalvo(orcamento);
        
         });

        const whatsappButton =
         document.createElement('button');
         whatsappButton.type = 'button';
         whatsappButton.className = 'icon-btn';
         whatsappButton.className = 'btn btn-whats';
         whatsappButton.innerHTML = '<i class="ti ti-brand-whatsapp" aria-hidden="true"></i> WhatsApp';
         whatsappButton.addEventListener('click', () => {
         compartilharOrcamentoWhatsApp(orcamento);
         });

actionsCell.appendChild(whatsappButton);

actionsCell.appendChild(pdfButton);

        const deleteButton = document.createElement('button');
        deleteButton.type  = 'button';
        deleteButton.className = 'btn-icon del';
        deleteButton.innerHTML = '<i class="ti ti-trash" aria-hidden="true"></i>';
        deleteButton.setAttribute('aria-label', 'Excluir');
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

async function compartilharOrcamentoWhatsApp(orcamento) {

    // ==========================
    // GERAR PDF
    // ==========================

    await gerarPDFOrcamentoSalvo(orcamento);

    // ==========================
    // DADOS
    // ==========================

    const cliente =
        orcamento.cliente || 'Cliente';

    const produto =
        orcamento.produto || 'Produto';

    const valor =
        formatBRL(orcamento.total);

    const validade =
        '5 dias';

    const whatsappEmpresa =
        localStorage.getItem('whatsappEmpresa') || '';

    const instagram =
        localStorage.getItem('instagramEmpresa') || '';

    // ==========================
    // MENSAGEM
    // ==========================

    const mensagem = `Olá ${cliente} 😊

Seu orçamento está pronto.

📦 Produto:
${produto}

💰 Valor:
${valor}

📅 Validade:
${validade}

📲 WhatsApp:
${whatsappEmpresa}

📸 Instagram:
${instagram}

📎 O PDF do orçamento foi baixado automaticamente.
Basta anexar no WhatsApp 😊

Obrigado pela preferência ❤️`;

    // ==========================
    // ABRIR WHATSAPP
    // ==========================

    const url =
        `https://wa.me/?text=${encodeURIComponent(mensagem)}`;

    window.open(url, '_blank');
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
async function gerarPDFOrcamentoSalvo(orcamento) {

    const { jsPDF } = window.jspdf;

   const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
   });

    // =========================================
    // DADOS
    // =========================================

    const cliente =
        orcamento.cliente || 'Cliente';

    const produto =
        orcamento.produto || 'Produto';

    const total =
        Number(orcamento.total) || 0;

    const data =
        orcamento.data || '';

    const validade = '5 dias';

    // PIX
    const pixCode =
        localStorage.getItem('pixCode') || '';

    const chavePix =
        localStorage.getItem('chavePix') || '';

    const whatsapp =
        localStorage.getItem('whatsappEmpresa') || '';

    const instagram =
        localStorage.getItem('instagramEmpresa') || '';

    // =========================================
    // FUNDO
    // =========================================

    doc.setFillColor(248, 248, 248);

    doc.rect(0, 0, 210, 297, 'F');

    // =========================================
    // TOPO
    // =========================================

    doc.setFillColor(255, 255, 255);

    doc.setDrawColor(235);
    doc.setLineWidth(0.3);

    doc.roundedRect(
        10,
        10,
        190,
        38,
        6,
        6,
        'F'
    );

    // LOGO
    doc.setDrawColor(220);

    const empresaNome =
    localStorage.getItem('empresaNome') || 'Minha Empresa';

doc.setFontSize(18);

doc.setTextColor(40);

doc.text(
    empresaNome,
    68,
    26
);

   const logoEmpresa =
    localStorage.getItem('logoEmpresa');

if (logoEmpresa) {

    doc.addImage(
        logoEmpresa,
        logoEmpresa.includes('image/png') ? 'PNG' : 'JPEG',
        18,
        14,
        42,
        28
    );

} else {

    doc.setDrawColor(220);

    doc.roundedRect(
        18,
        17,
        42,
        24,
        4,
        4
    );

    doc.setFontSize(10);

    doc.setTextColor(120);

    doc.text(
        'LOGO DA EMPRESA',
        21,
        30
    );

}

  

    // TÍTULO
    doc.setFontSize(24);

    doc.setTextColor(40);

    doc.text(
        'ORÇAMENTO',
        128,
        30
    );

    // =========================================
    // CLIENTE
    // =========================================

    doc.setFillColor(255, 255, 255);

    doc.roundedRect(
        10,
        58,
        190,
        42,
        5,
        5,
        'F'
    );

    doc.setFontSize(12);

    doc.setTextColor(60);

    doc.text(
        `Cliente: ${cliente}`,
        18,
        74
    );

    doc.text(
        `Data: ${data}`,
        18,
        84
    );

    doc.text(
        `Validade: ${validade}`,
        120,
        84
    );

    // =========================================
    // PRODUTO
    // =========================================

    doc.setFillColor(255, 255, 255);

    doc.roundedRect(
        10,
        110,
        190,
        55,
        5,
        5,
        'F'
    );

    doc.setFontSize(15);

    doc.setTextColor(30);

    doc.text(
        'Descrição do Produto',
        18,
        128
    );

    doc.setDrawColor(235);

    doc.line(18, 133, 188, 133);

    doc.setFontSize(12);

    doc.setTextColor(70);

    doc.text(
        produto,
        18,
        148
    );

    // =========================================
    // VALOR
    // =========================================

    doc.setFillColor(255, 255, 255);

    doc.roundedRect(
        10,
        178,
        92,
        60,
        5,
        5,
        'F'
    );

    doc.setFontSize(12);

    doc.setTextColor(120);

    doc.text(
        'VALOR TOTAL',
        18,
        198
    );

    doc.setFontSize(24);

    doc.setTextColor(20);

    doc.text(
        formatBRL(total),
        18,
        220
    );

    // =========================================
    // QR CODE PIX
    // =========================================

    doc.setFillColor(255, 255, 255);

    doc.roundedRect(
        112,
        178,
        88,
        60,
        5,
        5,
        'F'
    );

    if (pixCode) {

        const qrContainer =
            document.createElement('div');

        new QRCode(qrContainer, {
            text: pixCode,
            width: 120,
            height: 120
        });

        const qrImage =
            qrContainer.querySelector('img');

        if (qrImage) {

            await new Promise(resolve => {
                qrImage.onload = resolve;
            });

            doc.addImage(
                qrImage.src,
                'PNG',
                138,
                186,
                35,
                35
            );
        }

        doc.setFontSize(10);

        doc.setTextColor(100);

        doc.text(
            'Pagamento via PIX',
            132,
            230
        );
    }

    // =========================================
    // CHAVE PIX
    // =========================================

    doc.setFillColor(255, 255, 255);

    doc.roundedRect(
        10,
        248,
        190,
        20,
        5,
        5,
        'F'
    );

    doc.setFontSize(11);

    doc.setTextColor(90);

    doc.text(
        `Chave PIX: ${chavePix}`,
        18,
        261
    );

    // =========================================
    // REDES SOCIAIS
    // =========================================

    doc.setFillColor(255, 255, 255);

    doc.roundedRect(
        10,
        275,
        190,
        12,
        4,
        4,
        'F'
    );

    doc.setFontSize(10);

    doc.setTextColor(120);

    doc.text(
        `WhatsApp: ${whatsapp}`,
        18,
        283
    );

    doc.text(
        `Instagram: ${instagram}`,
        120,
        283
    );

    // =========================================
    // RODAPÉ
    // =========================================

    doc.setFontSize(9);

    doc.setTextColor(150);

    doc.text(
        'Obrigado pela preferência!',
        105,
        293,
        { align: 'center' }
    );

    // =========================================
    // SALVAR
    // =========================================

   const nomeArquivo =
    `orcamento-${cliente}.pdf`;

doc.save(nomeArquivo);

return nomeArquivo;
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

        // Status inline
        const statusSelect = document.createElement('select');
        statusSelect.innerHTML = `
            <option value="pendente"   ${pedido.status === 'pendente'   ? 'selected' : ''}>Produção</option>
            <option value="confirmado" ${pedido.status === 'confirmado' ? 'selected' : ''}>Confeccionado</option>
            <option value="entregue"   ${pedido.status === 'entregue'   ? 'selected' : ''}>Entregue</option>
        `;
        statusSelect.addEventListener('change', () => {
            const lista = loadPedidos(month);
            const item  = lista.find(p => String(p.id) === String(pedido.id));
            if (item) {
                item.status = statusSelect.value;
                savePedidos(lista, month);
            }
        });
        row.insertCell(4).appendChild(statusSelect);

        // Pagamento inline
        const pagSelect = document.createElement('select');
        pagSelect.innerHTML = `
            <option value="nao_pago" ${(pedido.pagamento || 'nao_pago') === 'nao_pago' ? 'selected' : ''}>Não pago</option>
            <option value="pago"     ${pedido.pagamento === 'pago'                      ? 'selected' : ''}>Pago</option>
        `;
        pagSelect.addEventListener('change', () => {
            const lista = loadPedidos(month);
            const item  = lista.find(p => String(p.id) === String(pedido.id));
            if (item) {
                item.pagamento = pagSelect.value;
                savePedidos(lista, month);
                updateResumoClientesTable(month);
            }
        });
        row.insertCell(5).appendChild(pagSelect);

        const actionsCell = row.insertCell(6);

        const editButton = document.createElement('button');
        editButton.type      = 'button';
        editButton.className = 'btn-icon edit';
        editButton.innerHTML = '<i class="ti ti-edit" aria-hidden="true"></i>';
        editButton.setAttribute('aria-label', 'Editar');
        editButton.addEventListener('click', () => fillPedidoForm(pedido));
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.type      = 'button';
        deleteButton.className = 'btn-icon del';
        deleteButton.innerHTML = '<i class="ti ti-trash" aria-hidden="true"></i>';
        deleteButton.setAttribute('aria-label', 'Excluir');
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

function getMesAtual() {
    const hoje = new Date();
    const ano  = hoje.getFullYear();
    const mes  = String(hoje.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
}

function resetPedidoForm() {
    const pedidoForm = document.getElementById('pedidoForm');
    if (!pedidoForm) return;
    pedidoForm.reset();
    document.getElementById('mes').value             = getMesAtual(); // ← era '2026-05'
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

function renderFaturamento() {
    const meses = [
        '2026-01','2026-02','2026-03','2026-04','2026-05','2026-06',
        '2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'
    ];
    const nomesMeses = [
        'Jan','Fev','Mar','Abr','Mai','Jun',
        'Jul','Ago','Set','Out','Nov','Dez'
    ];

    // Coleta dados por mês
    const dados = meses.map((mes, i) => {
        const pedidos = loadPedidos(mes);
        const total   = pedidos.reduce((s, p) => s + (Number(p.valor) || 0), 0);
        const pago    = pedidos.filter(p => p.pagamento === 'pago').reduce((s, p) => s + (Number(p.valor) || 0), 0);
        const pendente = total - pago;
        return { mes, nome: nomesMeses[i], total, pago, pendente, qtd: pedidos.length };
    });

    const comValor   = dados.filter(d => d.total > 0);
    const totalGeral = dados.reduce((s, d) => s + d.total, 0);
    const totalPago  = dados.reduce((s, d) => s + d.pago, 0);
    const media      = comValor.length ? totalGeral / comValor.length : 0;
    const melhor     = comValor.reduce((a, b) => b.total > a.total ? b : a, comValor[0] || { total: 0, nome: '—' });

    // Último mês com valor
    const ultimo     = comValor[comValor.length - 1];
    const penultimo  = comValor[comValor.length - 2];

    // Cards
    const el = id => document.getElementById(id);
    if (el('fatCardUltimoLabel'))  el('fatCardUltimoLabel').textContent  = ultimo ? ultimo.nome : '—';
    if (el('fatCardUltimoMes'))    el('fatCardUltimoMes').textContent    = formatBRL(ultimo ? ultimo.total : 0);
    if (el('fatCardMelhorValor'))  el('fatCardMelhorValor').textContent  = formatBRL(melhor.total);
    if (el('fatCardMelhorMes'))    el('fatCardMelhorMes').textContent    = melhor.nome || '—';
    if (el('fatCardMedia'))        el('fatCardMedia').textContent        = formatBRL(media);
    if (el('fatCardTotal'))        el('fatCardTotal').textContent        = formatBRL(totalGeral);

    // Variação
    if (el('fatCardVariacao')) {
        if (ultimo && penultimo && penultimo.total > 0) {
            const variacao = ((ultimo.total - penultimo.total) / penultimo.total) * 100;
            el('fatCardVariacao').textContent = (variacao >= 0 ? '+' : '') + variacao.toFixed(1) + '% vs mês anterior';
            el('fatCardVariacao').className   = variacao >= 0 ? 'fat-var-up' : 'fat-var-down';
        } else {
            el('fatCardVariacao').textContent = '—';
        }
    }

    // Tabela
    const tbody = el('faturamentoTableBody');
    if (tbody) {
        tbody.innerHTML = '';
        dados.forEach((d, i) => {
            if (d.total === 0 && d.qtd === 0) return;
            const ant = dados[i - 1];
            const variacao = ant && ant.total > 0
                ? ((d.total - ant.total) / ant.total * 100).toFixed(1)
                : null;
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${d.nome}</td>
                <td>${d.qtd}</td>
                <td class="fat-valor">${formatBRL(d.total)}</td>
                <td class="fat-pago">${formatBRL(d.pago)}</td>
                <td class="fat-pendente">${formatBRL(d.pendente)}</td>
                <td>${variacao !== null
                    ? `<span class="fat-badge ${Number(variacao) >= 0 ? 'fat-badge--up' : 'fat-badge--down'}">${Number(variacao) >= 0 ? '+' : ''}${variacao}%</span>`
                    : '<span class="fat-badge fat-badge--neutral">—</span>'
                }</td>
            `;
        });

        // Totais
        const tfoot = el('faturamentoTotaisRow');
        if (tfoot) {
            tfoot.innerHTML = `
                <td><strong>Total</strong></td>
                <td></td>
                <td class="fat-valor"><strong>${formatBRL(totalGeral)}</strong></td>
                <td class="fat-pago"><strong>${formatBRL(totalPago)}</strong></td>
                <td class="fat-pendente"><strong>${formatBRL(totalGeral - totalPago)}</strong></td>
                <td></td>
            `;
        }
    }

    // Gráfico SVG simples
    const wrap = el('faturamentoGrafico');
    if (wrap && comValor.length > 0) {
        const W = wrap.clientWidth || 700;
        const H = 180;
        const maxVal = Math.max(...dados.map(d => d.total), 1);
        const barW = Math.floor((W - 60) / meses.length) - 4;

        let bars = '';
        dados.forEach((d, i) => {
            const x      = 40 + i * ((W - 60) / meses.length);
            const hPago  = (d.pago    / maxVal) * (H - 30);
            const hPend  = (d.pendente / maxVal) * (H - 30);
            bars += `
                <rect x="${x}" y="${H - 20 - hPago - hPend}" width="${barW}" height="${hPend}" fill="#f6a623" rx="3"/>
                <rect x="${x}" y="${H - 20 - hPago}" width="${barW}" height="${hPago}" fill="#3ecf8e" rx="3"/>
                <text x="${x + barW/2}" y="${H - 4}" text-anchor="middle" class="fat-axis-label">${d.nome}</text>
            `;
        });

        // Linha de total
        const pontos = dados.map((d, i) => {
            const x = 40 + i * ((W - 60) / meses.length) + barW / 2;
            const y = H - 20 - (d.total / maxVal) * (H - 30);
            return `${x},${y}`;
        }).join(' ');

        wrap.innerHTML = `
            <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}">
                ${bars}
                <polyline points="${pontos}" fill="none" stroke="#4f8ef7" stroke-width="2"/>
            </svg>
        `;
    } else if (wrap) {
        wrap.innerHTML = '<p style="color:#94a3b8;text-align:center;padding:20px">Nenhum dado encontrado.</p>';
    }
}

function renderPendentes() {
    const tbody     = document.getElementById('pendentesTableBody');
    const totalCell = document.getElementById('pendentesTotalValor');
    if (!tbody || !totalCell) return;

    const meses = [
        '2026-01','2026-02','2026-03','2026-04','2026-05','2026-06',
        '2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'
    ];

    // Coleta todos os pedidos que não foram entregues
    const pendentes = [];
    meses.forEach(mes => {
        loadPedidos(mes).forEach(pedido => {
            if (pedido.status !== 'entregue') {
                pendentes.push(pedido);
            }
        });
    });

    // Ordena por data de entrega
    pendentes.sort((a, b) => new Date(a.data) - new Date(b.data));

    tbody.innerHTML = '';
    let total = 0;

    if (pendentes.length === 0) {
        const row = tbody.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = 'Nenhum pedido em produção.';
        cell.style.textAlign = 'center';
        cell.style.color = '#94a3b8';
        totalCell.textContent = formatBRL(0);
        return;
    }

    pendentes.forEach(pedido => {
        const row = tbody.insertRow();
        row.insertCell(0).textContent = pedido.cliente;
        row.insertCell(1).textContent = pedido.produto;
        row.insertCell(2).textContent = formatBRL(pedido.valor);
        row.insertCell(3).textContent = pedido.data;

        const statusLabels = {
            pendente:   'Produção',
            confirmado: 'Confeccionado',
            entregue:   'Entregue'
        };
        row.insertCell(4).textContent = statusLabels[pedido.status] || pedido.status;
        row.insertCell(5).textContent = pedido.pagamento === 'pago' ? 'Pago' : 'Não pago';

        total += Number(pedido.valor) || 0;
    });

    totalCell.textContent = formatBRL(total);
}


// ============================================================
//  INICIALIZAÇÃO DOS EVENTOS (DOM pronto)
// ============================================================




document.addEventListener('DOMContentLoaded', () => {

 // Fecha modal ao clicar no overlay
[
    'produtoFormContainer',
    'custoFormContainer', 
    'pedidoFormContainer',
    'cadastroProdutoContainer',
    'cadastroClienteContainer'
].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('click', e => {
            if (e.target === el) {
                el.classList.remove('visible');
                el.classList.add('hidden');
            }
        });
    }
});   

// Adicione no DOMContentLoaded
document.getElementById('cancelarProdutoBtn2')?.addEventListener('click', () => {
    produtoFormContainer.classList.remove('visible');
    produtoFormContainer.classList.add('hidden');
});

document.getElementById('cancelarCustoBtn2')?.addEventListener('click', () => {
    custoFormContainer.classList.remove('visible');
    custoFormContainer.classList.add('hidden');
});

    document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;

    const inputs = [
        ...Array.from(document.querySelectorAll('#orcamentoTableBody input.small-input')),
        document.querySelector('#confeccaoTableBody input.small-input'),
        document.querySelector('#resultadoTableBody input[placeholder="Nome do cliente"]'),
        document.querySelector('#resultadoTableBody input[placeholder="Nome do produto"]')
    ].filter(Boolean);

    if (inputs.length === 0) return;

    const index = inputs.indexOf(document.activeElement);
    if (index === -1) return;

    e.preventDefault();

    if (e.shiftKey) {
        const prev = inputs[index - 1];
        if (prev) prev.focus();
    } else {
        const next = inputs[index + 1];
        if (next) next.focus();
    }
});
// =====================================
// CONFIGURAÇÕES EMPRESA
// =====================================

const configBtn =
    document.getElementById('configBtn');

const configModal =
    document.getElementById('configModal');

const fecharConfig =
    document.getElementById('fecharConfig');

const salvarConfigBtn =
    document.getElementById('salvarConfigBtn');

// Abrir modal
if (configBtn) {
    configBtn.addEventListener('click', () => {
        const empresaNomeEl = document.getElementById('empresaNome');
        const whatsappEl    = document.getElementById('whatsappEmpresa');
        const instagramEl   = document.getElementById('instagramEmpresa');
        const chavePixEl    = document.getElementById('chavePix');
        const pixCodeEl     = document.getElementById('pixCode');

        if (empresaNomeEl) empresaNomeEl.value = localStorage.getItem('empresaNome') || '';
        if (whatsappEl)    whatsappEl.value    = localStorage.getItem('whatsappEmpresa') || '';
        if (instagramEl)   instagramEl.value   = localStorage.getItem('instagramEmpresa') || '';
        if (chavePixEl)    chavePixEl.value    = localStorage.getItem('chavePix') || '';
        if (pixCodeEl)     pixCodeEl.value     = localStorage.getItem('pixCode') || '';

        configModal.style.display = 'flex';
    });
}

// Fechar
if (fecharConfig) {
    fecharConfig.addEventListener('click', () => {
        configModal.style.display = 'none';
    });
}

// Fechar clicando fora
if (configModal) {
    configModal.addEventListener('click', e => {
        if (e.target === configModal) {
            configModal.style.display = 'none';
        }
    });
}

// Salvar
if (salvarConfigBtn) {
    salvarConfigBtn.addEventListener('click', () => {
        localStorage.setItem('empresaNome',      document.getElementById('empresaNome')?.value || '');
        localStorage.setItem('whatsappEmpresa',  document.getElementById('whatsappEmpresa')?.value || '');
        localStorage.setItem('instagramEmpresa', document.getElementById('instagramEmpresa')?.value || '');
        localStorage.setItem('chavePix',         document.getElementById('chavePix')?.value || '');
        localStorage.setItem('pixCode',          document.getElementById('pixCode')?.value || '');

        const logoInput = document.getElementById('logoEmpresa');
        const file = logoInput?.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                localStorage.setItem('logoEmpresa', e.target.result);
            };
            reader.readAsDataURL(file);
        }

        setTimeout(() => { alert('Configurações salvas!'); }, 300);
        configModal.style.display = 'none';
    });
}

    if (!localStorage.getItem('whatsappEmpresa')) {

    localStorage.setItem(
        'whatsappEmpresa',
        '(71) 99999-9999'
    );

    localStorage.setItem(
        'instagramEmpresa',
        '@suaempresa'
    );

    localStorage.setItem(
        'chavePix',
        '71999999999'
    );

    localStorage.setItem(
        'pixCode',
        '00020126580014BR.GOV.BCB.PIX...'
    );
    }


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

    const novoCadastroCliente        = el('novoCadastroCliente');
    const cadastroClienteContainer   = el('cadastroClienteContainer');
    const cancelarCadastroClienteBtn = el('cancelarCadastroClienteBtn');
    const cadastroClienteForm        = el('cadastroClienteForm');

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

    let currentMonth = getMesAtual();
    if (monthSelector) monthSelector.value = currentMonth;

    // ---- Selecionar produto (modal) ----

const selecionarProdutoBtn   = el('selecionarProdutoBtn');
const fecharModalProdutosBtn = el('fecharModalProdutosBtn');

if (selecionarProdutoBtn) {
    selecionarProdutoBtn.addEventListener('click', abrirModalProdutos);
}

if (fecharModalProdutosBtn) {
    fecharModalProdutosBtn.addEventListener('click', () => {
        document.getElementById('modalProdutos').classList.remove('visible');
    });
}

   // --- Selecionar cliente (modal) ---

   const selecionarClienteBtn   = el('selecionarClienteBtn');
const fecharModalClientesBtn = el('fecharModalClientesBtn');

if (selecionarClienteBtn) {
    selecionarClienteBtn.addEventListener('click', abrirModalClientes);
}

if (fecharModalClientesBtn) {
    fecharModalClientesBtn.addEventListener('click', () => {
        document.getElementById('modalClientes').classList.remove('visible');
    });
}

updateClientesDatalist();


// ---- Cadastro de cliente (datalist) ----

if (novoCadastroCliente) {
    novoCadastroCliente.addEventListener('click', () => {
        pedidoFormContainer.classList.add('hidden');
        pedidoFormContainer.classList.remove('visible');
        cadastroProdutoContainer.classList.add('hidden');
        cadastroProdutoContainer.classList.remove('visible');

        if (cadastroClienteContainer.classList.contains('visible')) {
            cadastroClienteContainer.classList.remove('visible');
            cadastroClienteContainer.classList.add('hidden');
        } else {
            cadastroClienteContainer.classList.remove('hidden');
            cadastroClienteContainer.classList.add('visible');
        }
    });
}
if (cancelarCadastroClienteBtn) {
    cancelarCadastroClienteBtn.addEventListener('click', () => {
        cadastroClienteContainer.classList.remove('visible');
        cadastroClienteContainer.classList.add('hidden');
        if (cadastroClienteForm) cadastroClienteForm.reset();
    });
}

if (cadastroClienteForm) {
    cadastroClienteForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData  = new FormData(cadastroClienteForm);
        const clientes  = JSON.parse(localStorage.getItem('clientesCadastrados')) || [];
        clientes.push({
            id:   Date.now(),
            nome: formData.get('nomeClienteCadastro')
        });
        localStorage.setItem('clientesCadastrados', JSON.stringify(clientes));
        cadastroClienteForm.reset();
        cadastroClienteContainer.classList.remove('visible');
        alert('Cliente cadastrado com sucesso!');
    });
}



    // ---- Cadastro de produto (datalist) ----
 if (novoCadastroProduto) {
    novoCadastroProduto.addEventListener('click', () => {
        pedidoFormContainer.classList.remove('visible');
        cadastroProdutoContainer.classList.toggle('visible');
        cadastroClienteContainer.classList.remove('visible');
    });
}
 if (cancelarCadastroProdutoBtn) {
    cancelarCadastroProdutoBtn.addEventListener('click', () => {
        cadastroProdutoContainer.classList.remove('visible');
        cadastroProdutoContainer.classList.add('hidden');
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
        custoFormContainer.classList.add('hidden');
        custoFormContainer.classList.remove('visible');
        if (produtoForm) produtoForm.reset();
        el('produtoId').value = '';
        document.querySelector('#produtoForm button[type="submit"]').innerHTML =
            '<i class="ti ti-device-floppy"></i> Salvar';
        produtoFormContainer.classList.toggle('visible');
        produtoFormContainer.classList.toggle('hidden');
    });
}

['cancelarProdutoBtn', 'cancelarProdutoBtn2'].forEach(id => {
    const btn = el(id);
    if (btn) btn.addEventListener('click', () => {
        produtoFormContainer.classList.add('hidden');
        produtoFormContainer.classList.remove('visible');
        if (produtoForm) produtoForm.reset();
    });
});
    ['produtoFormContainer', 'custoFormContainer'].forEach(id => {
    const container = el(id);
    if (container) {
        container.addEventListener('click', e => {
            if (e.target === container) {
                container.classList.add('hidden');
                container.classList.remove('visible');
            }
        });
    }
});

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
        produtoFormContainer.style.display = 'none'; // ← era classList.remove('visible')
    });

    updateOrcamentoTable();
    initializeOrcamentoExtras();
}

    // ---- Custos fixos ----
 if (novoCustoBtn) {
    novoCustoBtn.addEventListener('click', () => {
        produtoFormContainer.style.display = 'none';
        custoFormContainer.style.display = 
            custoFormContainer.style.display === 'none' ? 'block' : 'none';
    });
}

if (cancelarCustoBtn) {
    cancelarCustoBtn.addEventListener('click', () => {
        custoFormContainer.style.display = 'none';
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
            custoFormContainer.style.display = 'none';
        });
    }

    // ---- Botões de orçamento (limpar / salvar / pdf) ----
    if (limparBtn) {
        limparBtn.addEventListener('click', () => {
            if (confirm('Deseja limpar todos os campos do orçamento?')) limparOrcamento();
        });
    }

    if (salvarBtn) {
        salvarBtn.addEventListener('click', salvarOrcamento);
    }

    const gerarPdfBtn = document.getElementById('gerarPdfBtn');

     if (gerarPdfBtn) {
        gerarPdfBtn.addEventListener('click', gerarOrcamentoPDF);
}

    updateOrcamentosSalvosTable();

    // ---- Pedidos ----
if (novoPedidoBtn) {
    novoPedidoBtn.addEventListener('click', () => {
        cadastroProdutoContainer.classList.add('hidden');
        cadastroProdutoContainer.classList.remove('visible');
        cadastroClienteContainer.classList.add('hidden');
        cadastroClienteContainer.classList.remove('visible');

   

        if (pedidoFormContainer.classList.contains('visible')) {
            pedidoFormContainer.classList.remove('visible');
            pedidoFormContainer.classList.add('hidden');
        } else {
            pedidoFormContainer.classList.remove('hidden');
            pedidoFormContainer.classList.add('visible');
            
        const mesEl = el('mes');
        if (mesEl && !el('editId').value) {
            mesEl.value = getMesAtual();
        }
    }
    });
}

   if (cancelarPedidoBtn) {
    cancelarPedidoBtn.addEventListener('click', () => {
        pedidoFormContainer.classList.remove('visible');
        pedidoFormContainer.classList.add('hidden');
    });
}
    if (pedidoForm) {
        updatePedidosTable(currentMonth);

      if (monthSelector) {
    monthSelector.addEventListener('change', () => {
        currentMonth = monthSelector.value;
        updatePedidosTable(currentMonth);

        // ✅ ADICIONAR: sincroniza o seletor do resumo
        if (monthSelectorResumo) {
            monthSelectorResumo.value = currentMonth;
            updateResumoClientesTable(currentMonth);
        }
    });
}

        // ---- Seletor de mês do resumo por cliente ----
const monthSelectorResumo = el('monthSelectorResumo');

if (monthSelectorResumo) {
    // Sincroniza com o mês atual ao iniciar
    monthSelectorResumo.value = currentMonth;

    monthSelectorResumo.addEventListener('change', () => {
        updateResumoClientesTable(monthSelectorResumo.value);
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