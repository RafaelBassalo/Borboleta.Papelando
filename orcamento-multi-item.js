




// =====================================================
// MODAIS
// =====================================================



function fecharFormItemOrcamento(){

    document
        .getElementById('itemOrcamentoModal')
        .classList
        .add('hidden');
}


function fecharModalPedidos(){

    document
        .getElementById('modalPedidos')
        .classList
        .add('hidden');
}

function abrirBuscaProdutos(){

    const produtos =
        JSON.parse(localStorage.getItem('produtos')) || [];

    const lista =
        document.getElementById('listaPedidos');

    lista.innerHTML = '';

    if(produtos.length === 0){

        lista.innerHTML =
            '<p>Nenhum produto cadastrado.</p>';

    } else {

        produtos.forEach((produto, index) => {

            lista.innerHTML += `

                <div style="
                    background:rgba(255,255,255,.5);
                    border-radius:12px;
                    padding:14px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:16px;
                ">

                    <div>

                        <strong>
                            ${produto.nomeProduto}
                        </strong>

                        <br>

                        Pacote:
                        ${produto.quantidadePacote}

                        <br>

                        <strong>
                            R$ ${Number(produto.valorProduto || 0).toFixed(2)}
                        </strong>

                    </div>

                    <button
                        class="btn btn-verde"
                        onclick="adicionarProdutoAoMulti(${index})">

                        Adicionar

                    </button>

                </div>
            `;
        });
    }

    document
        .getElementById('modalPedidos')
        .classList
        .remove('hidden');
}

function adicionarProdutoAoMulti(index){

    const produtos =
        JSON.parse(localStorage.getItem('produtos')) || [];

    const produto = produtos[index];

    const itens = loadItensOrcamento();

    itens.push({

        id: Date.now(),

        tipo: 'direto',

        nome: produto.nomeProduto,

        quantidade: 1,

        valorUnitario: Number(produto.valorProduto || 0)

    });

    saveItensOrcamento(itens);

    renderItensOrcamento();

    fecharModalPedidos();
}



// =====================================================
// REMOVER
// =====================================================

function removerItem(index){

    itensOrcamento.splice(index, 1);

    renderItensOrcamento();
}




// ============================================================
//  RENDERIZAR TABELA DE ITENS DO ORÇAMENTO
// ============================================================



// ── Sub-abas de modo ──
function ativarModoOrcamento(id, btn) {
    document.querySelectorAll('.modo-orcamento').forEach(el => {
        el.style.display = 'none';
    });
    document.querySelectorAll('.sub-modo-btn').forEach(el => el.classList.remove('active'));
    const alvo = document.getElementById(id);
    if (alvo) alvo.style.display = 'block';
    if (btn) btn.classList.add('active');
    if (id === 'modoDePedidos') renderProdutosPedidosOrcamento();
}

// ── Modo De Pedidos ──
function renderProdutosPedidosOrcamento() {
    const select = document.getElementById('selectProdutoPedido');
    if (!select) return;
    const produtos = loadProdutosCadastrados();
    select.innerHTML = '<option value="">Selecione um produto...</option>';
    produtos.forEach((p, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${p.nome} — ${formatBRL(p.valor)}`;
        select.appendChild(opt);
    });
    renderTabelaItensPedidos();
}

// Lista temporária em memória
let _itensPedidosOrc = [];

function adicionarItemPedidoOrcamento() {
    const select = document.getElementById('selectProdutoPedido');
    const qtd    = Number(document.getElementById('qtdProdutoPedido')?.value) || 1;
    const index  = select?.value;

    if (index === '' || index === null) { alert('Selecione um produto.'); return; }

    const produtos = loadProdutosCadastrados();
    const p = produtos[Number(index)];
    if (!p) return;

    const existente = _itensPedidosOrc.find(i => i.nome === p.nome);
    if (existente) {
        existente.quantidade += qtd;
    } else {
        _itensPedidosOrc.push({
            nome: p.nome,
            quantidade: qtd,
            valorUnitario: Number(p.valor)
        });
    }

    // ← Atualiza o campo descrição com os nomes dos produtos adicionados
    const produtoPedidosOrc = document.getElementById('produtoPedidosOrc');
    if (produtoPedidosOrc) {
        produtoPedidosOrc.value = _itensPedidosOrc.map(i => i.nome).join(', ');
    }

    select.value = '';
    document.getElementById('qtdProdutoPedido').value = 1;
    renderTabelaItensPedidos();
}

function renderTabelaItensPedidos() {
    const tbody = document.getElementById('itensPedidosOrcamentoBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    let total = 0;

    if (_itensPedidosOrc.length === 0) {
        const tr = tbody.insertRow();
        const td = tr.insertCell(0);
        td.colSpan = 5;
        td.textContent = 'Nenhum item adicionado.';
        td.style.cssText = 'text-align:center;color:#94a3b8;padding:12px;';
    }

    _itensPedidosOrc.forEach((item, i) => {
        const valorTotal = item.quantidade * item.valorUnitario;
        total += valorTotal;
        const row = tbody.insertRow();
        row.insertCell(0).textContent = item.nome;
        row.insertCell(1).textContent = item.quantidade;
        row.insertCell(2).textContent = formatBRL(item.valorUnitario);
        row.insertCell(3).textContent = formatBRL(valorTotal);

        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'btn-icon del';
        del.innerHTML = '<i class="ti ti-trash"></i>';
        del.onclick = () => {
            _itensPedidosOrc.splice(i, 1);
            renderTabelaItensPedidos();
        };
        row.insertCell(4).appendChild(del);
    });

    const el = document.getElementById('totalPedidosOrcamento');
    if (el) el.textContent = formatBRL(total);
    // no final de renderTabelaItensPedidos, após atualizar o total:
const prodDesc = document.getElementById('produtoPedidosOrc');
if (prodDesc) {
    prodDesc.value = _itensPedidosOrc.map(i => i.nome).join(', ');
}
}

function limparItensPedidosOrcamento() {
    _itensPedidosOrc = [];
    renderTabelaItensPedidos();
    const c = document.getElementById('clientePedidosOrc');
    const p = document.getElementById('produtoPedidosOrc');
    if (c) c.value = '';
    if (p) p.value = '';
}

function salvarOrcamentoDePedidos() {
    const cliente = document.getElementById('clientePedidosOrc')?.value?.trim();
    const produto = document.getElementById('produtoPedidosOrc')?.value?.trim();
    if (!cliente) { alert('Informe o nome do cliente.'); return; }
    if (_itensPedidosOrc.length === 0) { alert('Adicione pelo menos um produto.'); return; }

    const total = _itensPedidosOrc.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0);

    const orcamento = {
    id:       Date.now(),
    cliente,
    produto:  produto || _itensPedidosOrc.map(i => i.nome).join(', '),
    material: total,
    producao: 0,
    total,
    data:     new Date().toLocaleDateString('pt-BR'),
    mes:      loadMesPedidoOrcamento(),
    status:   loadStatusPedidoOrcamento(),
    pagamento: loadPagamentoPedidoOrcamento(),
    itens:    JSON.stringify(_itensPedidosOrc),
    subtotal: total,
    valorInvestimento: 0,
    valorLucro: 0
    };

    saveOrcamentoSalvo(orcamento);
    alert('Orçamento salvo com sucesso!');
    limparItensPedidosOrcamento();
}

// ── Checkbox "selecionar todos" ──
function toggleTodosChecks(master) {
    document.querySelectorAll('.orcamento-check').forEach(cb => {
        cb.checked = master.checked;
    });
    atualizarBotaoUnificar();
}










// ============================================================
//  UNIFICAR ORÇAMENTOS SALVOS
// ============================================================
//
//  Como usar:
//  1. Marque os checkboxes dos orçamentos que quer unir
//     (adicione <input type="checkbox" class="orcamento-check" data-id="..."> na tabela)
//  2. Chame unificarOrcamentosSelecionados() para gerar PDF ou WhatsApp unificado


function getIdsSelecionados() {
    return [...document.querySelectorAll('.orcamento-check:checked')]
        .map(cb => String(cb.dataset.id));
}

function unificarOrcamentosSelecionados(modo = 'pdf') {
    const ids        = getIdsSelecionados();
    const todos      = loadOrcamentosSalvos();
    const selecionados = todos.filter(o => ids.includes(String(o.id)));

    if (selecionados.length < 2) {
        alert('Selecione pelo menos 2 orçamentos para unificar.');
        return;
    }

    // Agrupa por cliente (opcional — mescla tudo)
    const clientesCombinados = [...new Set(selecionados.map(o => o.cliente))].join(', ');
    const totalUnificado     = selecionados.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const orcamentoUnificado = {
        cliente:  clientesCombinados,
        produto:  selecionados.map(o => o.produto).join(' + '),
        total:    totalUnificado,
        data:     new Date().toLocaleDateString('pt-BR'),
        itensUnificados: selecionados.map(o => ({
            nome:  o.produto || o.cliente,
            total: o.total,
            // Se o orçamento salvo tiver itens detalhados, pega também
            itens: o.itens ? JSON.parse(o.itens) : []
        }))
    };

    if (modo === 'pdf') {
        gerarPDFUnificado(orcamentoUnificado);
    } else {
        compartilharUnificadoWhatsApp(orcamentoUnificado);
    }
}


// ============================================================
//  PDF UNIFICADO
// ============================================================

function calcularValorItem(item) {
    return (Number(item.quantidade) || 1) * (Number(item.valorUnitario) || 0);
}

async function gerarPDFUnificado(orcamentoUnificado) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const empresaNome  = localStorage.getItem('empresaNome')      || 'Minha Empresa';
    const whatsapp     = localStorage.getItem('whatsappEmpresa')  || '';
    const instagram    = localStorage.getItem('instagramEmpresa') || '';
    const chavePix     = localStorage.getItem('chavePix')         || '';
    const logoEmpresa  = localStorage.getItem('logoEmpresa');

    // ── Fundo ──
    doc.setFillColor(248, 248, 248);
    doc.rect(0, 0, 210, 297, 'F');

    // ── Cabeçalho ──
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(235);
    doc.setLineWidth(0.3);
    doc.roundedRect(10, 10, 190, 38, 6, 6, 'F');

    if (logoEmpresa) {
        doc.addImage(logoEmpresa,
            logoEmpresa.includes('image/png') ? 'PNG' : 'JPEG',
            18, 14, 42, 28);
    } else {
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text('LOGO DA EMPRESA', 21, 30);
    }

    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(empresaNome, 68, 26);

    doc.setFontSize(22);
    doc.text('ORÇAMENTO', 128, 30);

    // ── Cliente ──
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, 56, 190, 24, 5, 5, 'F');
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`Cliente: ${orcamentoUnificado.cliente}`, 18, 68);
    doc.text(`Data: ${orcamentoUnificado.data}`, 18, 76);
    doc.text('Validade: 5 dias', 120, 76);

    // ── Tabela de itens ──
    let y = 92;

    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, y - 8, 190, 12, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text('ITEM', 18, y);
    doc.text('VALOR', 180, y, { align: 'right' });
    doc.setDrawColor(230);
    doc.line(18, y + 3, 192, y + 3);

    y += 10;

    orcamentoUnificado.itensUnificados.forEach((grupo, gi) => {
        // Cabeçalho do grupo (orçamento)
        doc.setFillColor(245, 245, 245);
        doc.rect(10, y - 5, 190, 10, 'F');
        doc.setFontSize(10);
        doc.setTextColor(50);
        doc.text(grupo.nome || `Orçamento ${gi + 1}`, 18, y + 1);
        doc.text(formatBRL(grupo.total), 192, y + 1, { align: 'right' });
        y += 10;

        // Sub-itens (se existirem)
        if (grupo.itens && grupo.itens.length > 0) {
            grupo.itens.forEach(item => {
                if (y > 260) {
                    doc.addPage();
                    y = 20;
                }
                const valorItem = calcularValorItem(item);
                doc.setFontSize(9);
                doc.setTextColor(100);
                doc.text(`  • ${item.nome} (x${item.quantidade})`, 20, y);
                doc.text(formatBRL(valorItem), 192, y, { align: 'right' });
                y += 7;
            });
        }

        doc.setDrawColor(235);
        doc.line(18, y, 192, y);
        y += 6;

        if (y > 260) {
            doc.addPage();
            y = 20;
        }
    });

    // ── Total ──
    y += 4;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(10, y - 4, 190, 18, 4, 4, 'F');
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text('TOTAL GERAL', 18, y + 8);
    doc.setFontSize(16);
    doc.text(formatBRL(orcamentoUnificado.total), 192, y + 8, { align: 'right' });

    y += 30;

    // ── Chave PIX ──
    if (chavePix) {
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(10, y, 190, 14, 4, 4, 'F');
        doc.setFontSize(10);
        doc.setTextColor(90);
        doc.text(`Chave PIX: ${chavePix}`, 18, y + 9);
        y += 20;
    }

    // ── Rodapé ──
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`WhatsApp: ${whatsapp}   |   Instagram: ${instagram}`, 105, 287, { align: 'center' });
    doc.text('Obrigado pela preferência!', 105, 293, { align: 'center' });

    doc.save(`orcamento-unificado-${orcamentoUnificado.cliente}.pdf`);
}


// ============================================================
//  WHATSAPP UNIFICADO
// ============================================================

async function compartilharUnificadoWhatsApp(orcamentoUnificado) {
    await gerarPDFUnificado(orcamentoUnificado);

    const linhasItens = orcamentoUnificado.itensUnificados
        .map((g, i) => `${i + 1}. ${g.nome} — ${formatBRL(g.total)}`)
        .join('\n');

    const mensagem = `Olá ${orcamentoUnificado.cliente} 😊

Segue seu orçamento consolidado:

📋 Itens:
${linhasItens}

💰 Total Geral: ${formatBRL(orcamentoUnificado.total)}

📅 Validade: 5 dias

📎 O PDF foi baixado — basta anexar no WhatsApp 😊

Obrigado pela preferência ❤️`;

    window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
}


// ============================================================
//  ATUALIZAR TABELA DE ORÇAMENTOS SALVOS COM CHECKBOXES
//  Substitui updateOrcamentosSalvosTable() do seu arquivo original
// ============================================================

function updateOrcamentosSalvosTable() {
    const tbody = document.getElementById('orcamentosSalvosBody');
    if (!tbody) return;

    const orcamentos = loadOrcamentosSalvos();
    tbody.innerHTML  = '';

    orcamentos.forEach(orcamento => {
        const row = tbody.insertRow();

        // Checkbox para unificação
        const checkCell = row.insertCell(0);
        const check = document.createElement('input');
        check.type      = 'checkbox';
        check.className = 'orcamento-check';
        check.dataset.id = orcamento.id;
        checkCell.appendChild(check);

        row.insertCell(1).textContent = orcamento.cliente;
        row.insertCell(2).textContent = orcamento.produto   || '';
        row.insertCell(3).textContent = orcamento.mes       || '';
        row.insertCell(4).textContent = orcamento.status    || '';
        row.insertCell(5).textContent = orcamento.pagamento === 'pago' ? 'Pago' : 'Não pago';
        row.insertCell(6).textContent = formatBRL(orcamento.material);
        row.insertCell(7).textContent = formatBRL(orcamento.producao);
        row.insertCell(8).textContent = formatBRL(orcamento.total);
        row.insertCell(9).textContent = orcamento.data;

        // Badge multi-item
        if (orcamento.isMulti) {
            const badge = document.createElement('span');
            badge.className = 'badge-tipo badge-calculado';
            badge.textContent = 'Multi-item';
            badge.style.marginLeft = '6px';
            row.cells[2].appendChild(badge);
        }

        const actionsCell = row.insertCell(10);
        actionsCell.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:nowrap;';

        const transformarButton = document.createElement('button');
        transformarButton.type      = 'button';
        transformarButton.className = 'btn btn-amber';
        transformarButton.innerHTML = '<i class="ti ti-transfer" aria-hidden="true"></i> Pedido';
        transformarButton.addEventListener('click', () => transformarEmPedido(orcamento));
        actionsCell.appendChild(transformarButton);

        const pdfButton = document.createElement('button');
        pdfButton.type      = 'button';
        pdfButton.className = 'btn btn-vermelho';
        pdfButton.innerHTML = '<i class="ti ti-file-type-pdf" aria-hidden="true"></i> PDF';
        pdfButton.addEventListener('click', () => {
            if (orcamento.isMulti) {
                // PDF detalhado com todos os itens
                const itens = orcamento.itens ? JSON.parse(orcamento.itens) : [];
                gerarPDFUnificado({
                    cliente: orcamento.cliente,
                    data:    orcamento.data,
                    total:   orcamento.total,
                    itensUnificados: [{
                        nome:  orcamento.produto,
                        total: orcamento.total,
                        itens
                    }]
                });
            } else {
                gerarPDFOrcamentoSalvo(orcamento);
            }
        });
        actionsCell.appendChild(pdfButton);

        const whatsappButton = document.createElement('button');
        whatsappButton.type      = 'button';
        whatsappButton.className = 'btn btn-whats';
        whatsappButton.innerHTML = '<i class="ti ti-brand-whatsapp" aria-hidden="true"></i> WhatsApp';
        whatsappButton.addEventListener('click', () => compartilharOrcamentoWhatsApp(orcamento));
        actionsCell.appendChild(whatsappButton);

        const deleteButton = document.createElement('button');
        deleteButton.type      = 'button';
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

    // Mostra/oculta botão de unificar conforme seleção
    atualizarBotaoUnificar();
    tbody.addEventListener('change', atualizarBotaoUnificar);
}

function atualizarBotaoUnificar() {
    const selecionados = document.querySelectorAll('.orcamento-check:checked').length;
    const btn = document.getElementById('btnUnificarOrcamentos');
    if (!btn) return;
    btn.style.display = selecionados >= 2 ? 'inline-flex' : 'none';
}


// ============================================================
//  INICIALIZAÇÃO — adicione ao seu DOMContentLoaded existente
// ============================================================

function initOrcamentoMulti() {
    renderItensOrcamento();
    renderResumoOrcamento();

    // Botão salvar orçamento multi
    const salvarMultiBtn = document.getElementById('salvarOrcamentoMultiBtn');
    if (salvarMultiBtn) {
        salvarMultiBtn.addEventListener('click', salvarOrcamentoMulti);
    }

    // Botão limpar orçamento multi
    const limparMultiBtn = document.getElementById('limparOrcamentoMultiBtn');
    if (limparMultiBtn) {
        limparMultiBtn.addEventListener('click', () => {
            if (confirm('Limpar todos os itens do orçamento?')) limparOrcamentoMulti();
        });
    }

    // Botão unificar
    const btnUnificar = document.getElementById('btnUnificarOrcamentos');
    if (btnUnificar) {
        btnUnificar.addEventListener('click', () => unificarOrcamentosSelecionados('pdf'));
    }

    const btnUnificarWhats = document.getElementById('btnUnificarOrcamentosWhats');
    if (btnUnificarWhats) {
        btnUnificarWhats.addEventListener('click', () => unificarOrcamentosSelecionados('whatsapp'));
    }

    // Tipo de item no modal
    const tipoSelect = document.getElementById('tipoItem');
    if (tipoSelect) {
        tipoSelect.addEventListener('change', toggleCamposTipoItem);
    }

    // Fechar modal ao clicar no overlay
    const modal = document.getElementById('itemOrcamentoModal');
    if (modal) {
        modal.addEventListener('click', e => {
            if (e.target === modal) fecharFormItemOrcamento();
        });
    }
}

// Chame no final do seu DOMContentLoaded:
// initOrcamentoMulti();
