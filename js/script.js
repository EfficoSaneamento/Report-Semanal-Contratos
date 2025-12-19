const API_URL = 'https://script.google.com/macros/s/AKfycbz8Yq49synXDR0Gfj0j4t9UWi5Jqu94Ya7-F-6aF7-l9dy7e8rteRGCRPopLhb9amuu/exec';

// ===============================
// TOKEN
// ===============================
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  document.getElementById('erro').innerText = 'Token não informado na URL';
  throw new Error('Token ausente');
}

// ===============================
// VALIDAR GERENTE
// ===============================
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      document.getElementById('erro').innerText = data.message;
      return;
    }
    document.getElementById('nomeGerente').innerText = data.gerente;
    renderContratos(data.contratos);
  })
  .catch(() => {
    document.getElementById('erro').innerText = 'Erro ao conectar com a API';
  });

// ===============================
// RENDER FORMULÁRIO
// ===============================
function renderContratos(contratos) {
  const container = document.getElementById('formulario');
  container.innerHTML = '';

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';

    div.innerHTML = `
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
          <div class="bloco-titulo">🧠 Análise</div>
          <div class="campo">
            <label>Destaques da Semana</label>
            <textarea data-field="destaquesdaSemana"></textarea>
          </div>
          <div class="campo">
            <label>Concentrações da Semana</label>
            <textarea data-field="concentracaodaSemana"></textarea>
          </div>
        </div>

      </div>
    `;

    // abre/fecha
    div.querySelector('.contrato-header').onclick = () => {
      const body = div.querySelector('.contrato-body');
      body.style.display = body.style.display === 'none' ? 'grid' : 'none';
    };

    container.appendChild(div);
  });
}

// ===============================
// ENVIAR
// ===============================
document.getElementById('btnEnviar').onclick = () => {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(div => {
    const dados = {
      nomeContrato: div.querySelector('.contrato-header').innerText
    };

    div.querySelectorAll('[data-field]').forEach(el => {
      dados[el.dataset.field] = el.value || '';
    });

    contratos.push(dados);
  });

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ token, contratos })
  })
    .then(res => res.json())
    .then(r => {
      if (!r.success) {
        alert(r.message);
        return;
      }
      alert('Relatório enviado com sucesso!');
    })
    .catch(() => alert('Erro ao enviar dados'));
};





