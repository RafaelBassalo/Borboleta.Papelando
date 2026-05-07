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
    produtoForm.addEventListener('submit', event => {
        event.preventDefault();
        alert('Produto cadastrado no orçamento com sucesso!');
        produtoForm.reset();
        produtoFormContainer.classList.remove('visible');
    });
}

const novoPedidoBtn = document.getElementById('novoPedidoBtn');
const pedidoFormContainer = document.getElementById('pedidoFormContainer');
const cancelarPedidoBtn = document.getElementById('cancelarPedidoBtn');
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
        document.querySelector('#pedidoForm button[type="submit"]').textContent = 'Atualizar Pedido';
        pedidoFormContainer.classList.add('visible');
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
            const actionsCell = row.insertCell(5);
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
            status: formData.get('status')
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