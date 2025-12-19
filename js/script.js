const API_URL = 'https://script.google.com/macros/s/AKfycbz8Yq49synXDR0Gfj0j4t9UWi5Jqu94Ya7-F-6aF7-l9dy7e8rteRGCRPopLhb9amuu/exec'; // 🔴 cole a URL do Web App
let TOKEN = '';

/* =========================
   INICIALIZAÇÃO
========================= */
document.addEventListener('DOMContentLoaded', () => {
  const btnEnviar = document.getElementById('btnEnviar');
  const btnBuscarHistorico = document.getElementById('btnBuscarHistorico');

  if (btnEnviar) btnEnviar.addEventListener('click', enviarFormulario);
  if (btnBuscarHistorico) btnBuscarHistorico.addEventListener('click', carregarHistorico);
});

/* =========================
   VALIDAR TOKEN
========================= */
async function validarToken() {
  const tokenInput = document.getElementById('token');
  const nomeGerenteEl = document.getElementById('nomeGerente');

  TOKEN = tokenInput.value.trim();

  if (!TOKEN) {
    alert('Informe o token');
    return;
  }

  const url = `${API_URL}?action=validar&token=${TOKEN}`;

  const r = await fetch(url).then(res => res.json());

  if (!r.success) {
    alert(r.message);
    return;
  }

  nomeGerenteEl.innerText = r.gerente;
  carregarContratos(r.contratos);
}

/* =========================
   CARREGAR CONTRATOS
========================= */
function carregarContratos(contratos) {
  const container = document.getElementById('listaContratos');
  container.innerHTML = '';

  contratos.forEach(c => {
    container.innerHTML += `
      <div class="contrato">
        <div class="contrato-header">${c.nome}</div>
        <div class="contrato-body">

          <div class="bloco">
            <div class="bloco-titulo">💰 Faturamento</div>
            <div class="grid-2">
              <div class="campo">
                <label>Previsto (Mês)</label>
                <input data-field="faturamentoPrevistoMes">
              </div>
              <div class="campo">
                <label>Próx. Semana</label>
                <input data-field="faturamentoProximaSemana">
              </div>
            </div>
          </div>

          <div class="bloco">
            <div class="bloco-titulo">💸 Custos</div>
            <div class="grid-2">
              <div class="campo">
                <label>Previsto (Mês)</label>
                <input data-field="custoPrevistoMes">
              </div>
              <div class="campo">
                <label>Próx. Semana</label>
                <input data-field="custoProximaSemana">
              </div>
            </div>
          </div>

          <div class="bloco">
            <div class="bloco-titulo">👷 Produção</div>
            <div class="grid-3">
              <div class="campo">
                <label>Realizada (Mês)</label>
                <input data-field="producaoRealizadaMes">
              </div>
              <div class="campo">
                <label>Prevista (Mês)</label>
                <input data-field="producaoPrevistaMes">
              </div>
              <div class="campo">
                <label>Próx. Semana</label>
                <input data-field="producaoProximaSemana">
              </div>
            </div>
          </div>

          <div class="bloco">
            <div class="bloco-titulo">📝 Análise</div>
            <textarea data-field="destaquesdaSemana" placeholder="Destaques da semana"></textarea>
            <textarea data-field="concentracaodaSemana" placeholder="Concentrações da semana"></textarea>
          </div>

        </div>
      </div>
    `;
  });
}

/* =========================
   ENVIAR FORMULÁRIO
========================= */
async function enviarFormulario() {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(contratoEl => {
    const nomeContrato = contratoEl.querySelector('.contrato-header').innerText;
    const dados = { nomeContrato };

    contratoEl.querySelectorAll('[data-field]').forEach(campo => {
      dados[campo.dataset.field] = campo.value;
    });

    contratos.push(dados);
  });

  const payload = {
    token: TOKEN,
    contratos
  };

  try {
    const r = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    }).then(res => res.json());

    if (!r.success) {
      alert(r.message);
      return;
    }

    alert('Dados enviados com sucesso!');
  } catch (err) {
    alert('Erro ao enviar dados');
  }
}

/* =========================
   CARREGAR HISTÓRICO
========================= */
async function carregarHistorico() {
  const data = document.getElementById('dataHistorico').value;
  const historicoEl = document.getElementById('historico');

  if (!data) {
    alert('Selecione uma data');
    return;
  }

  const [ano, mes, dia] = data.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;

  const url = `${API_URL}?action=historico&token=${TOKEN}&data=${dataFormatada}`;

  const r = await fetch(url).then(res => res.json());

  if (!r.success) {
    historicoEl.innerHTML = `<p>${r.message}</p>`;
    return;
  }

  if (r.dados.length === 0) {
    historicoEl.innerHTML = `<p>Nenhum registro encontrado</p>`;
    return;
  }

  historicoEl.innerHTML = r.dados.map(item => `
    <div class="historico-item">
      <h4>${item.contrato}</h4>

      <p><strong>💰 Faturamento Previsto (Mês):</strong> ${item.faturamentoMes}</p>
      <p><strong>📅💰 Faturamento Próx. Semana:</strong> ${item.faturamentoSemana}</p>

      <p><strong>💸 Custo Previsto (Mês):</strong> ${item.custoMes}</p>
      <p><strong>📆💸 Custo Próx. Semana:</strong> ${item.custoSemana}</p>

      <p><strong>✅👷 Produção Realizada (Mês):</strong> ${item.prodRealizada}</p>
      <p><strong>👷 Produção Prevista (Mês):</strong> ${item.prodPrevista}</p>
      <p><strong>📆👷 Produção Próx. Semana:</strong> ${item.prodSemana}</p>

      <p><strong>🌟 Destaques da Semana:</strong><br>${item.destaques || '-'}</p>
      <p><strong>🎯 Concentrações da Semana:</strong><br>${item.concentracoes || '-'}</p>
    </div>
  `).join('');
}



