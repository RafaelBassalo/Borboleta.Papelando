// ============================================================
//  FATURAMENTO MENSAL — módulo JS
//  Adicione este script ao seu HTML após o app.js
// ============================================================

(function () {

    // ----------------------------------------------------------
    //  Helpers
    // ----------------------------------------------------------

    function formatBRL(value) {
        return (Number(value) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    /** Retorna todos os meses que possuem pedidos salvos no localStorage */
    function getMesesComPedidos() {
        const meses = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('pedidos-')) {
                const mes = key.replace('pedidos-', '');
                if (mes) meses.push(mes);
            }
        }
        return meses.sort(); // ordem cronológica
    }

    function loadPedidos(month) {
        return JSON.parse(localStorage.getItem('pedidos-' + month)) || [];
    }

    /** Calcula totais de um mês */
    function calcularTotaisMes(month) {
        const pedidos = loadPedidos(month);
        let total = 0, pago = 0, pendente = 0, qtd = 0;
        pedidos.forEach(p => {
            const valor = Number(p.valor) || 0;
            total += valor;
            qtd++;
            if ((p.pagamento || 'nao_pago') === 'pago') pago += valor;
            else pendente += valor;
        });
        return { month, total, pago, pendente, qtd };
    }

    /** Formata "2026-05" → "Mai/26" */
    function formatMesLabel(mes) {
        const [ano, m] = mes.split('-');
        const nomes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        return (nomes[parseInt(m, 10) - 1] || m) + '/' + ano.slice(2);
    }

    // ----------------------------------------------------------
    //  Tabela comparativa de meses
    // ----------------------------------------------------------

    function renderTabelaFaturamento(dados) {
        const tbody  = document.getElementById('faturamentoTableBody');
        const totRow = document.getElementById('faturamentoTotaisRow');
        if (!tbody) return;

        tbody.innerHTML = '';
        let somaTotal = 0, somaPago = 0, somaPendente = 0, somaQtd = 0;

        // Variação percentual em relação ao mês anterior
        dados.forEach((d, i) => {
            const anterior = i > 0 ? dados[i - 1].total : null;
            const variacao = anterior !== null && anterior > 0
                ? ((d.total - anterior) / anterior * 100)
                : null;

            const tr = document.createElement('tr');

            const variacaoHtml = variacao === null
                ? '<span class="fat-badge fat-badge--neutral">—</span>'
                : variacao >= 0
                    ? `<span class="fat-badge fat-badge--up">▲ ${variacao.toFixed(1)}%</span>`
                    : `<span class="fat-badge fat-badge--down">▼ ${Math.abs(variacao).toFixed(1)}%</span>`;

            tr.innerHTML = `
                <td>${formatMesLabel(d.month)}</td>
                <td>${d.qtd}</td>
                <td class="fat-valor">${formatBRL(d.total)}</td>
                <td class="fat-valor fat-pago">${formatBRL(d.pago)}</td>
                <td class="fat-valor fat-pendente">${formatBRL(d.pendente)}</td>
                <td>${variacaoHtml}</td>
            `;
            tbody.appendChild(tr);

            somaTotal    += d.total;
            somaPago     += d.pago;
            somaPendente += d.pendente;
            somaQtd      += d.qtd;
        });

        if (totRow) {
            totRow.innerHTML = `
                <td><strong>Total</strong></td>
                <td><strong>${somaQtd}</strong></td>
                <td class="fat-valor"><strong>${formatBRL(somaTotal)}</strong></td>
                <td class="fat-valor fat-pago"><strong>${formatBRL(somaPago)}</strong></td>
                <td class="fat-valor fat-pendente"><strong>${formatBRL(somaPendente)}</strong></td>
                <td></td>
            `;
        }
    }

    // ----------------------------------------------------------
    //  Cards de destaque
    // ----------------------------------------------------------

    function renderCards(dados) {
        if (!dados.length) return;

        const ultimo = dados[dados.length - 1];
        const penultimo = dados.length > 1 ? dados[dados.length - 2] : null;
        const variacao = penultimo && penultimo.total > 0
            ? ((ultimo.total - penultimo.total) / penultimo.total * 100).toFixed(1)
            : null;

        const melhorMes = [...dados].sort((a, b) => b.total - a.total)[0];
        const totalAno  = dados.reduce((s, d) => s + d.total, 0);
        const mediaMes  = dados.length > 0 ? totalAno / dados.length : 0;

        function setCard(id, val) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        }

        setCard('fatCardUltimoMes',    formatBRL(ultimo.total));
        setCard('fatCardUltimoLabel',  formatMesLabel(ultimo.month));
        setCard('fatCardVariacao',     variacao !== null ? (variacao >= 0 ? `▲ ${variacao}%` : `▼ ${Math.abs(variacao)}%`) : '—');
        setCard('fatCardMelhorMes',    formatMesLabel(melhorMes.month));
        setCard('fatCardMelhorValor',  formatBRL(melhorMes.total));
        setCard('fatCardMedia',        formatBRL(mediaMes));
        setCard('fatCardTotal',        formatBRL(totalAno));

        const varEl = document.getElementById('fatCardVariacao');
        if (varEl && variacao !== null) {
            varEl.className = Number(variacao) >= 0 ? 'fat-var-up' : 'fat-var-down';
        }
    }

    // ----------------------------------------------------------
    //  Gráfico SVG de barras + linha de evolução
    // ----------------------------------------------------------

    function renderGrafico(dados) {
        const container = document.getElementById('faturamentoGrafico');
        if (!container || !dados.length) return;

        const W = container.clientWidth  || 700;
        const H = 280;
        const PAD = { top: 24, right: 24, bottom: 48, left: 72 };
        const innerW = W - PAD.left - PAD.right;
        const innerH = H - PAD.top  - PAD.bottom;

        const maxVal = Math.max(...dados.map(d => d.total), 1);
        const step   = innerW / dados.length;

        // Escala Y: arredonda para cima em casas "bonitas"
        function niceMax(v) {
            const mag = Math.pow(10, Math.floor(Math.log10(v)));
            return Math.ceil(v / mag) * mag;
        }
        const yMax = niceMax(maxVal * 1.15);
        const yTicks = 5;

        function scaleY(v) { return innerH - (v / yMax) * innerH; }
        function scaleX(i) { return i * step + step / 2; }

        // Monta SVG
        let bars = '', linePoints = '', dots = '', labels = '', yLines = '', yLabels = '';

        // Grades horizontais
        for (let t = 0; t <= yTicks; t++) {
            const v = (yMax / yTicks) * t;
            const y = scaleY(v);
            yLines  += `<line x1="0" y1="${y}" x2="${innerW}" y2="${y}" stroke="var(--fat-grid)" stroke-width="1" stroke-dasharray="4 3"/>`;
            yLabels += `<text x="-10" y="${y + 4}" text-anchor="end" class="fat-axis-label">${formatBRL(v).replace('R$\u00a0', 'R$ ')}</text>`;
        }

        // Linha de evolução (path)
        const pts = dados.map((d, i) => `${scaleX(i)},${scaleY(d.total)}`);
        const linePath = 'M ' + pts.join(' L ');

        // Área sombreada sob a linha
        const areaPath = `M ${scaleX(0)},${innerH} L ${pts.join(' L ')} L ${scaleX(dados.length - 1)},${innerH} Z`;

        dados.forEach((d, i) => {
            const x   = scaleX(i);
            const barH = (d.total / yMax) * innerH;
            const barY = innerH - barH;
            const barW = Math.max(step * 0.45, 8);

            // Barra (pago + pendente empilhados)
            const pagoH    = (d.pago    / yMax) * innerH;
            const pendH    = (d.pendente / yMax) * innerH;

            bars += `
                <rect x="${x - barW/2}" y="${innerH - pagoH}" width="${barW}" height="${pagoH}"
                      fill="var(--fat-pago)" rx="3" opacity="0.85">
                    <title>${formatMesLabel(d.month)} — Pago: ${formatBRL(d.pago)}</title>
                </rect>
                <rect x="${x - barW/2}" y="${innerH - pagoH - pendH}" width="${barW}" height="${pendH}"
                      fill="var(--fat-pendente)" rx="3" opacity="0.75">
                    <title>${formatMesLabel(d.month)} — Pendente: ${formatBRL(d.pendente)}</title>
                </rect>
            `;

            // Ponto na linha
            dots += `<circle cx="${x}" cy="${scaleY(d.total)}" r="5" fill="var(--fat-linha)" stroke="#fff" stroke-width="2">
                <title>${formatMesLabel(d.month)}: ${formatBRL(d.total)}</title>
            </circle>`;

            // Label do eixo X
            labels += `<text x="${x}" y="${innerH + 20}" text-anchor="middle" class="fat-axis-label">${formatMesLabel(d.month)}</text>`;
        });

        container.innerHTML = `
        <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:${H}px">
            <defs>
                <linearGradient id="fatAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--fat-linha)" stop-opacity="0.18"/>
                    <stop offset="100%" stop-color="var(--fat-linha)" stop-opacity="0.01"/>
                </linearGradient>
            </defs>
            <g transform="translate(${PAD.left},${PAD.top})">
                ${yLines}
                ${yLabels}
                ${bars}
                <path d="${areaPath}" fill="url(#fatAreaGrad)"/>
                <path d="${linePath}" fill="none" stroke="var(--fat-linha)" stroke-width="2.5" stroke-linejoin="round"/>
                ${dots}
                ${labels}
            </g>
        </svg>`;
    }

    // ----------------------------------------------------------
    //  Função principal: renderiza tudo
    // ----------------------------------------------------------

    function renderFaturamento() {
        const meses = getMesesComPedidos();
        const dados = meses.map(calcularTotaisMes);
        renderCards(dados);
        renderTabelaFaturamento(dados);
        renderGrafico(dados);
    }

    // ----------------------------------------------------------
    //  Exposição pública (chamada ao trocar de aba)
    // ----------------------------------------------------------

    window.renderFaturamento = renderFaturamento;

    // Re-renderiza ao redimensionar (responsivo)
    window.addEventListener('resize', () => {
        const aba = document.getElementById('abaFaturamento');
        if (aba && aba.classList.contains('active')) renderFaturamento();
    });

})();
