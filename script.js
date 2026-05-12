const novoProdutoBtn = document.getElementById('novoProdutoBtn');
const produtoFormContainer = document.getElementById('produtoFormContainer');
const cancelarProdutoBtn = document.getElementById('cancelarProdutoBtn');
const produtoForm = document.getElementById('produtoForm');

if (novoProdutoBtn) {
    novoProdutoBtn.addEventListener('click', () => {
        produtoFormContainer.classList.toggle('visible');
    });
}

if (cancelarProdutoBtn) {
    cancelarProdutoBtn.addEventListener('click', () => {
        produtoFormContainer.classList.remove('visible');
    });
}

if (produtoForm) {
    function loadOrcamentoProdutos() {
        return JSON.parse(localStorage.getItem('orcamentoProdutos')) || [];
    }

    function saveOrcamentoProdutos(produtos) {
        localStorage.setItem('orcamentoProdutos', JSON.stringify(produtos));
    }

    function loadCustosFixos() {
        return JSON.parse(localStorage.getItem('custosFixos')) || { salario: 0, agua: 0, luz: 0, telefone: 0, internet: 0, inss: 0 };
    }

    function saveCustosFixos(custos) {
        localStorage.setItem('custosFixos', JSON.stringify(custos));
    }

    function loadTempoProducaoTotal() {
        return Number(localStorage.getItem('tempoProducaoTotal')) || 0;
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

    function formatBRL(value) {
        const number = Number(value) || 0;
        return number.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function calculateSpent(produto) {
        const valorPacote = Number(produto.valorProduto) || 0;
        const quantidadePacote = Number(produto.quantidadePacote) || 1;
        const quantidadeUtilizada = Number(produto.quantidadeUtilizada) || 0;
        const valorUnitario = quantidadePacote > 0 ? valorPacote / quantidadePacote : 0;
        return valorUnitario * quantidadeUtilizada;
    }

    function calculateCustoHora() {
        const custos = loadCustosFixos();
        const totalCustos = [custos.salario, custos.agua, custos.luz, custos.telefone, custos.internet, custos.inss]
            .map(valor => Number(valor) || 0)
            .reduce((sum, valor) => sum + valor, 0);
        return totalCustos / 160;
    }

    function updateConfeccaoTable() {
        const tbody = document.getElementById('confeccaoTableBody');
        if (!tbody) return;

        const produtos = loadOrcamentoProdutos();
        const custoHora = calculateCustoHora();
        const totalTempoMin = loadTempoProducaoTotal();
        const totalTempoHoras = totalTempoMin / 60;
        const totalValor = custoHora * totalTempoHoras;

        tbody.innerHTML = '';
        const row = tbody.insertRow();

        const tempoCell = row.insertCell(0);
        const tempoInput = document.createElement('input');
        tempoInput.type = 'number';
        tempoInput.min = '0';
        tempoInput.step = '1';
        tempoInput.value = totalTempoMin;
        tempoInput.className = 'small-input';
        tempoInput.addEventListener('change', () => {
            saveTempoProducaoTotal(tempoInput.value);
            updateConfeccaoTable();
        });
        tempoCell.appendChild(tempoInput);

        row.insertCell(1).textContent = formatBRL(custoHora);
        row.insertCell(2).textContent = formatBRL(totalValor);

        updateResultadoTable();
    }

    function updateResultadoTable() {
        const tbody = document.getElementById('resultadoTableBody');
        if (!tbody) return;

        const produtos = loadOrcamentoProdutos();
        const custoHora = calculateCustoHora();
        const totalMaterial = produtos.reduce((sum, produto) => sum + calculateSpent(produto), 0);
        const totalTempoMin = loadTempoProducaoTotal();
        const totalTempoHoras = totalTempoMin / 60;
        const totalProducao = custoHora * totalTempoHoras;
        const totalGeral = totalMaterial + totalProducao;

        tbody.innerHTML = '';
        const row = tbody.insertRow();
        
        const clienteCell = row.insertCell(0);
        const clienteInput = document.createElement('input');
        clienteInput.type = 'text';
        clienteInput.value = loadNomeCliente();
        clienteInput.className = 'small-input';
        clienteInput.placeholder = 'Nome do cliente';
        clienteInput.addEventListener('change', () => {
            saveNomeCliente(clienteInput.value);
        });
        clienteCell.appendChild(clienteInput);

        row.insertCell(1).textContent = loadProdutoFinal() || '-';
        row.insertCell(2).textContent = formatBRL(totalMaterial);
        row.insertCell(3).textContent = formatBRL(totalProducao);
        row.insertCell(4).textContent = formatBRL(totalGeral);
    }

    function updateOrcamentoTable() {
        const tbody = document.getElementById('orcamentoTableBody');
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

            const quantidadeUsadaCell = row.insertCell(3);
            const quantidadeUsadaInput = document.createElement('input');
            quantidadeUsadaInput.type = 'number';
            quantidadeUsadaInput.min = '0';
            quantidadeUsadaInput.step = '1';
            quantidadeUsadaInput.value = produto.quantidadeUtilizada || 0;
            quantidadeUsadaInput.className = 'small-input';
            quantidadeUsadaInput.addEventListener('input', () => {
                produto.quantidadeUtilizada = quantidadeUsadaInput.value;
                saveOrcamentoProdutos(produtos);
                const gasto = calculateSpent(produto);
                valorGastoCell.textContent = formatBRL(gasto);
                totalGasto.textContent = formatBRL(produtos.reduce((sum, item) => sum + calculateSpent(item), 0));
                updateResultadoTable();
            });
            quantidadeUsadaCell.appendChild(quantidadeUsadaInput);

            const valorGastoCell = row.insertCell(4);
            const gastoAtual = calculateSpent(produto);
            valorGastoCell.textContent = formatBRL(gastoAtual);

            const actionsCell = row.insertCell(5);
            actionsCell.style.display = 'flex';
            actionsCell.style.gap = '8px';
            
            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.className = 'action-button';
            editButton.textContent = 'Editar';
            editButton.addEventListener('click', () => {
                document.getElementById('produtoId').value = produto.id;
                document.getElementById('nomeProduto').value = produto.nomeProduto;
                document.getElementById('quantidadePacote').value = produto.quantidadePacote;
                document.getElementById('valorProduto').value = produto.valorProduto;
                document.querySelector('#produtoForm button[type="submit"]').textContent = 'Atualizar Produto';
                produtoFormContainer.classList.add('visible');
            });
            actionsCell.appendChild(editButton);
            
            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'action-button';
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', () => {
                const restantes = produtos.filter(item => String(item.id) !== String(produto.id));
                saveOrcamentoProdutos(restantes);
                updateOrcamentoTable();
            });
            actionsCell.appendChild(deleteButton);

            total += gastoAtual;
        });

        totalGasto.textContent = formatBRL(total);
        updateConfeccaoTable();
        updateResultadoTable();
    }

    produtoForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(produtoForm);
        const produtos = loadOrcamentoProdutos();
        const produtoId = formData.get('produtoId');
        
        if (produtoId) {
            const index = produtos.findIndex(item => String(item.id) === String(produtoId));
            if (index !== -1) {
                produtos[index] = {
                    ...produtos[index],
                    nomeProduto: formData.get('nomeProduto'),
                    quantidadePacote: formData.get('quantidadePacote'),
                    valorProduto: formData.get('valorProduto')
                };
            }
        } else {
            const novoProduto = {
                id: Date.now(),
                nomeProduto: formData.get('nomeProduto'),
                quantidadePacote: formData.get('quantidadePacote'),
                valorProduto: formData.get('valorProduto'),
                quantidadeUtilizada: 0,
                tempoProducao: 0
            };
            produtos.push(novoProduto);
        }
        
        saveOrcamentoProdutos(produtos);
        updateOrcamentoTable();
        produtoForm.reset();
        document.getElementById('produtoId').value = '';
        document.querySelector('#produtoForm button[type="submit"]').textContent = 'Salvar Produto';
        produtoFormContainer.classList.remove('visible');
    });

    function initializeOrcamentoExtras() {
        const produtoFinalInput = document.getElementById('produtoFinal');
        const mesPedidoSelect = document.getElementById('mesPedidoOrcamento');
        const statusPedidoSelect = document.getElementById('statusPedidoOrcamento');
        const pagamentoPedidoSelect = document.getElementById('pagamentoPedidoOrcamento');

        if (produtoFinalInput) {
            produtoFinalInput.value = loadProdutoFinal();
            produtoFinalInput.addEventListener('change', () => {
                saveProdutoFinal(produtoFinalInput.value);
                updateResultadoTable();
            });
        }

        if (mesPedidoSelect) {
            mesPedidoSelect.value = loadMesPedidoOrcamento();
            mesPedidoSelect.addEventListener('change', () => {
                saveMesPedidoOrcamento(mesPedidoSelect.value);
            });
        }

        if (statusPedidoSelect) {
            statusPedidoSelect.value = loadStatusPedidoOrcamento();
            statusPedidoSelect.addEventListener('change', () => {
                saveStatusPedidoOrcamento(statusPedidoSelect.value);
            });
        }

        if (pagamentoPedidoSelect) {
            pagamentoPedidoSelect.value = loadPagamentoPedidoOrcamento();
            pagamentoPedidoSelect.addEventListener('change', () => {
                savePagamentoPedidoOrcamento(pagamentoPedidoSelect.value);
            });
        }
    }

    updateOrcamentoTable();
    initializeOrcamentoExtras();
}

const novoCustoBtn = document.getElementById('novoCustoBtn');
const custoFormContainer = document.getElementById('custoFormContainer');
const cancelarCustoBtn = document.getElementById('cancelarCustoBtn');
const custoForm = document.getElementById('custoForm');

if (novoCustoBtn) {
    novoCustoBtn.addEventListener('click', () => {
        custoFormContainer.classList.toggle('visible');
    });
}

if (cancelarCustoBtn) {
    cancelarCustoBtn.addEventListener('click', () => {
        custoFormContainer.classList.remove('visible');
    });
}

if (custoForm) {
    function loadCustosFixos() {
        return JSON.parse(localStorage.getItem('custosFixos')) || { salario: 0, agua: 0, luz: 0, telefone: 0, internet: 0, inss: 0 };
    }

    function saveCustosFixos(custos) {
        localStorage.setItem('custosFixos', JSON.stringify(custos));
    }

    custoForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(custoForm);
        const custos = {
            salario: formData.get('salario'),
            agua: formData.get('agua'),
            luz: formData.get('luz'),
            telefone: formData.get('telefone'),
            internet: formData.get('internet'),
            inss: formData.get('inss')
        };
        saveCustosFixos(custos);
        updateConfeccaoTable();
        alert('Custos fixos salvos com sucesso!');
        custoForm.reset();
        custoFormContainer.classList.remove('visible');
    });

    const custosFixos = loadCustosFixos();
    document.getElementById('salario').value = custosFixos.salario || 0;
    document.getElementById('agua').value = custosFixos.agua || 0;
    document.getElementById('luz').value = custosFixos.luz || 0;
    document.getElementById('telefone').value = custosFixos.telefone || 0;
    document.getElementById('internet').value = custosFixos.internet || 0;
    document.getElementById('inss').value = custosFixos.inss || 0;
}

    // Funções para gerenciar orçamentos salvos
    function loadOrcamentosSalvos() {
        return JSON.parse(localStorage.getItem('orcamentosSalvos')) || [];
    }

    function saveOrcamentoSalvo(orcamento) {
        const orcamentos = loadOrcamentosSalvos();
        orcamentos.push(orcamento);
        localStorage.setItem('orcamentosSalvos', JSON.stringify(orcamentos));
    }

    function deleteOrcamentoSalvo(id) {
        const orcamentos = loadOrcamentosSalvos();
        const novoOrcamentos = orcamentos.filter(item => item.id !== id);
        localStorage.setItem('orcamentosSalvos', JSON.stringify(novoOrcamentos));
        updateOrcamentosSalvosTable();
    }

    function limparOrcamento() {
        const produtos = loadOrcamentoProdutos();
        produtos.forEach(produto => {
            produto.quantidadeUtilizada = 0;
        });
        saveOrcamentoProdutos(produtos);
        localStorage.removeItem('tempoProducaoTotal');
        localStorage.removeItem('nomeCliente');
        localStorage.removeItem('produtoFinal');
        localStorage.removeItem('mesPedidoOrcamento');
        localStorage.removeItem('statusPedidoOrcamento');
        localStorage.removeItem('pagamentoPedidoOrcamento');
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

        const custoHora = calculateCustoHora();
        const totalMaterial = produtos.reduce((sum, produto) => sum + calculateSpent(produto), 0);
        const totalTempoMin = loadTempoProducaoTotal();
        const totalTempoHoras = totalTempoMin / 60;
        const totalProducao = custoHora * totalTempoHoras;
        const totalGeral = totalMaterial + totalProducao;

        const orcamento = {
            id: Date.now(),
            cliente: nomeCliente,
            produto: loadProdutoFinal() || (produtos[0] ? produtos[0].nomeProduto : 'Orçamento'),
            material: totalMaterial,
            producao: totalProducao,
            total: totalGeral,
            data: new Date().toLocaleDateString('pt-BR'),
            mes: loadMesPedidoOrcamento(),
            status: loadStatusPedidoOrcamento(),
            pagamento: loadPagamentoPedidoOrcamento(),
            produtos: JSON.stringify(produtos)
        };

        saveOrcamentoSalvo(orcamento);
        alert('Orçamento salvo com sucesso!');
        limparOrcamento();
        updateOrcamentosSalvosTable();
    }

    function updateOrcamentosSalvosTable() {
        const tbody = document.getElementById('orcamentosSalvosBody');
        if (!tbody) return;

        const orcamentos = loadOrcamentosSalvos();
        tbody.innerHTML = '';

        orcamentos.forEach(orcamento => {
            const row = tbody.insertRow();
            row.insertCell(0).textContent = orcamento.cliente;
            row.insertCell(1).textContent = orcamento.produto || '-';
            row.insertCell(2).textContent = formatBRL(orcamento.material);
            row.insertCell(3).textContent = formatBRL(orcamento.producao);
            row.insertCell(4).textContent = formatBRL(orcamento.total);
            row.insertCell(5).textContent = orcamento.data;

            const actionsCell = row.insertCell(6);
            actionsCell.style.display = 'flex';
            actionsCell.style.gap = '8px';

            const transformarButton = document.createElement('button');
            transformarButton.type = 'button';
            transformarButton.className = 'action-button';
            transformarButton.textContent = 'Transformar em Pedido';
            transformarButton.addEventListener('click', () => {
                transformarEmPedido(orcamento);
            });
            actionsCell.appendChild(transformarButton);

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.className = 'action-button';
            deleteButton.textContent = 'Excluir';
            deleteButton.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja excluir este orçamento?')) {
                    deleteOrcamentoSalvo(orcamento.id);
                }
            });
            actionsCell.appendChild(deleteButton);
        });
    }

    function transformarEmPedido(orcamento) {
        const hoje = new Date().toISOString().split('T')[0];
        const mesAtual = hoje.substring(0, 7);

        const novoPedido = {
            id: Date.now(),
            cliente: orcamento.cliente,
            produto: orcamento.produto || ('Orçamento - ' + orcamento.data),
            valor: orcamento.total,
            data: hoje,
            mes: orcamento.mes || mesAtual,
            status: orcamento.status || 'pendente',
            pagamento: orcamento.pagamento || 'nao_pago'
        };

        // Carregar pedidos do mês atual e adicionar o novo
        const pedidosAtuais = JSON.parse(localStorage.getItem('pedidos-' + mesAtual)) || [];
        pedidosAtuais.push(novoPedido);
        localStorage.setItem('pedidos-' + mesAtual, JSON.stringify(pedidosAtuais));

        alert('Orçamento transformado em pedido com sucesso!');
        window.location.href = 'pedido.html';
    }

    // Botões de controle
    const limparBtn = document.getElementById('limparOrcamentoBtn');
    const salvarBtn = document.getElementById('salvarOrcamentoBtn');

    if (limparBtn) {
        limparBtn.addEventListener('click', () => {
            if (confirm('Deseja limpar todos os campos do orçamento?')) {
                limparOrcamento();
            }
        });
    }

    if (salvarBtn) {
        salvarBtn.addEventListener('click', salvarOrcamento);
    }

    updateOrcamentosSalvosTable();
const pedidoForm = document.getElementById('pedidoForm');

if (novoPedidoBtn) {
    novoPedidoBtn.addEventListener('click', () => {
        pedidoFormContainer.classList.toggle('visible');
    });
}

if (cancelarPedidoBtn) {
    cancelarPedidoBtn.addEventListener('click', () => {
        pedidoFormContainer.classList.remove('visible');
    });
}

if (pedidoForm) {
    // Funções para gerenciar pedidos por mês
    function loadPedidos(month) {
        return JSON.parse(localStorage.getItem('pedidos-' + month)) || [];
    }

    function savePedidos(pedidos, month) {
        localStorage.setItem('pedidos-' + month, JSON.stringify(pedidos));
    }

    function formatBRL(value) {
        const number = Number(value) || 0;
        return number.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function removePedidoById(id, month) {
        const pedidosAtuais = loadPedidos(month);
        const novoLista = pedidosAtuais.filter(item => String(item.id) !== String(id));
        savePedidos(novoLista, month);
    }

    function resetPedidoForm() {
        pedidoForm.reset();
        document.getElementById('mes').value = '2026-05';
        document.getElementById('pagamento').value = 'nao_pago';
        document.getElementById('editId').value = '';
        document.getElementById('editOriginalMes').value = '';
        document.getElementById('pedidoFormContainer').classList.remove('visible');
        document.querySelector('#pedidoForm button[type="submit"]').textContent = 'Salvar Pedido';
    }

    function fillPedidoForm(pedido) {
        const originalMes = pedido.mes || (monthSelector ? monthSelector.value : '2026-05');
        document.getElementById('editId').value = pedido.id;
        document.getElementById('editOriginalMes').value = originalMes;
        document.getElementById('cliente').value = pedido.cliente;
        document.getElementById('produto').value = pedido.produto;
        document.getElementById('valor').value = pedido.valor;
        document.getElementById('data').value = pedido.data;
        document.getElementById('mes').value = originalMes;
        document.getElementById('status').value = pedido.status;
        document.getElementById('pagamento').value = pedido.pagamento || 'nao_pago';
        document.querySelector('#pedidoForm button[type="submit"]').textContent = 'Atualizar Pedido';
        pedidoFormContainer.classList.add('visible');
    }

    function updateResumoClientesTable(month) {
        const summaryBody = document.getElementById('resumoClientesTableBody');
        const resumoTotalPedidos = document.getElementById('resumoTotalPedidos');
        const resumoTotalPago = document.getElementById('resumoTotalPago');
        const resumoTotalDevido = document.getElementById('resumoTotalDevido');
        if (!summaryBody || !resumoTotalPedidos || !resumoTotalPago || !resumoTotalDevido) return;

        const pedidos = loadPedidos(month);
        const summary = {};
        pedidos.forEach(pedido => {
            const nomeCliente = pedido.cliente || 'Sem Cliente';
            const valor = Number(pedido.valor) || 0;
            const pago = (pedido.pagamento || 'nao_pago') === 'pago';
            if (!summary[nomeCliente]) {
                summary[nomeCliente] = {
                    cliente: nomeCliente,
                    totalPedidos: 0,
                    totalPago: 0,
                    totalDevido: 0
                };
            }
            summary[nomeCliente].totalPedidos += valor;
            if (pago) {
                summary[nomeCliente].totalPago += valor;
            } else {
                summary[nomeCliente].totalDevido += valor;
            }
        });

        summaryBody.innerHTML = '';
        let totalPedidosGeral = 0;
        let totalPagoGeral = 0;
        let totalDevidoGeral = 0;

        Object.values(summary).forEach(item => {
            const row = summaryBody.insertRow();
            row.insertCell(0).textContent = item.cliente;
            row.insertCell(1).textContent = formatBRL(item.totalPedidos);
            row.insertCell(2).textContent = formatBRL(item.totalPago);
            row.insertCell(3).textContent = formatBRL(item.totalDevido);

            totalPedidosGeral += item.totalPedidos;
            totalPagoGeral += item.totalPago;
            totalDevidoGeral += item.totalDevido;
        });

        resumoTotalPedidos.textContent = formatBRL(totalPedidosGeral);
        resumoTotalPago.textContent = formatBRL(totalPagoGeral);
        resumoTotalDevido.textContent = formatBRL(totalDevidoGeral);
    }

    function updatePedidosTable(month) {
        const tbody = document.getElementById('pedidosTableBody');
        const totalCell = document.getElementById('pedidosTotalValor');
        if (!tbody || !totalCell) return;
        tbody.innerHTML = '';
        const pedidos = loadPedidos(month);
        let total = 0;
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
            editButton.textContent = 'Editar';
            editButton.type = 'button';
            editButton.className = 'action-button';
            editButton.addEventListener('click', () => {
                fillPedidoForm(pedido);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.type = 'button';
            deleteButton.className = 'action-button';
            deleteButton.addEventListener('click', () => {
                if (!confirm('Deseja realmente excluir este pedido?')) return;
                const pedidosAtuais = loadPedidos(month);
                const novoLista = pedidosAtuais.filter(item => String(item.id) !== String(pedido.id));
                savePedidos(novoLista, month);
                updatePedidosTable(month);
            });

            actionsCell.appendChild(editButton);
            actionsCell.appendChild(deleteButton);
            total += Number(pedido.valor) || 0;
        });
        totalCell.textContent = formatBRL(total);
        updateResumoClientesTable(month);
    }

    const monthSelector = document.getElementById('monthSelector');
    let currentMonth = monthSelector ? monthSelector.value : '2026-05';
    updatePedidosTable(currentMonth);

    if (monthSelector) {
        monthSelector.addEventListener('change', () => {
            currentMonth = monthSelector.value;
            updatePedidosTable(currentMonth);
        });
    }

    pedidoForm.addEventListener('submit', event => {
        event.preventDefault();
        const formData = new FormData(pedidoForm);
        const editId = formData.get('editId');
        const month = formData.get('mes');
        const originalMonth = formData.get('editOriginalMes') || month;
        const pedidoAtual = {
            id: editId ? Number(editId) : Date.now(),
            cliente: formData.get('cliente'),
            produto: formData.get('produto'),
            valor: formData.get('valor'),
            data: formData.get('data'),
            mes: month,
            status: formData.get('status'),
            pagamento: formData.get('pagamento')
        };
        if (editId) {
            if (originalMonth !== month) {
                removePedidoById(editId, originalMonth);
            }
            const pedidosDoMes = loadPedidos(month).filter(item => String(item.id) !== String(editId));
            pedidosDoMes.push(pedidoAtual);
            savePedidos(pedidosDoMes, month);
        } else {
            const pedidos = loadPedidos(month);
            pedidos.push(pedidoAtual);
            savePedidos(pedidos, month);
        }
        if (month === currentMonth || originalMonth === currentMonth) {
            updatePedidosTable(currentMonth);
        }
        alert('Pedido salvo com sucesso!');
        resetPedidoForm();
    });

    const cancelarPedidoBtn = document.getElementById('cancelarPedidoBtn');
    if (cancelarPedidoBtn) {
        cancelarPedidoBtn.addEventListener('click', resetPedidoForm);
    }
}