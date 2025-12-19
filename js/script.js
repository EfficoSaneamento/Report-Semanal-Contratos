const API_URL = 'https://script.google.com/macros/s/AKfycbz8Yq49synXDR0Gfj0j4t9UWi5Jqu94Ya7-F-6aF7-l9dy7e8rteRGCRPopLhb9amuu/exec';

/* ===============================
   TOKEN
=============================== */
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

const erroEl = document.getElementById('erro');
const formularioEl = document.getElementById('formulario');
const gerenteNomeEl = document.getElementById('gerenteNome');
const historicoEl = document.getElementById('listaHistorico');
const dataHistoricoEl = document.getElementById('dataHistorico');

if (!token) {
  erroEl.innerText = 'Token não informado na URL';
  throw new Error('Token ausente');
}

/* ===============================
   VALIDAR GERENTE / CONTRATOS
=============================== */
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(r => r.json())
  .then(data => {
    if (!data.success) {
      erroEl.innerText = data.message;
      return;
    }

    gerenteNomeEl.innerText = `Gerente: ${data.gerente}`;
    renderContratos(data.contratos);
  })
  .catch(err => {
    erroEl.innerText = 'Erro ao conectar com a API';
    console.error(err);
  });

/* ===============================
   RENDER CONTRATOS
=============================== */
function renderContratos(contratos) {
  formularioEl.innerHTML = '';

  if (!contratos || contratos.length === 0) {
    formularioEl.innerHTML = '<p>Nenhum contrato encontrado.</p>';
    return;
  }

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';

    div.innerHTML = `
      <div class="contrato-header" data-id="${c.id}">
        ${c.nome}
      </div>

      <div class="contrato-body">

        <div class="bloco">
          <h4 class="bloco-titulo">💰 Faturamento</h4>
          <div class="grid-2">
            <div class="campo">
              <label>Previsto (Mês)</label>
              <input type="number" data-field="faturamentoPrevistoMes">
            </div>
            <div class="campo">
              <label>Próx. Semana</label>
              <input type="number" data-field="faturamentoProximaSemana">
            </div>
          </div>
        </div>

        <div class="bloco">
          <h4 class="bloco-titulo">💸 Custos</h4>
          <div class="grid-2">
            <div class="campo">
              <label>Previsto (Mês)</label>
              <input type="number" data-field="custoPrevistoMes">
            </div>
            <div class="campo">
              <label>Próx. Semana</label>
              <input type="number" data-field="custoProximaSemana">
            </div>
          </div>
        </div>

        <div class="bloco">
          <h4 class="bloco-titulo">👷 Produção</h4>
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
          <h4 class="bloco-titulo">🧠 Análise</h4>
          <label>Destaques da Semana</label>
          <textarea data-field="destaquesdaSemana"></textarea>

          <label>Concentrações da Semana</label>
          <textarea data-field="concentracaodaSemana"></textarea>
        </div>

      </div>
    `;

    div.querySelector('.contrato-header').onclick = () => {
      const body = div.querySelector('.contrato-body');
      body.style.display = body.style.display === 'none' ? 'grid' : 'none';
    };

    formularioEl.appendChild(div);
  });
}

/* ===============================
   ENVIO DO FORMULÁRIO
=============================== */
document.getElementById('btnEnviar').onclick = () => {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(div => {
    const header = div.querySelector('.contrato-header');

    const dados = {
      nomeContrato: header.innerText.trim()
    };

    div.querySelectorAll('[data-field]').forEach(el => {
      dados[el.dataset.field] = el.value || '';
    });

    contratos.push(dados);
  });

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, contratos })
  })
    .then(r => r.json())
    .then(r => {
      if (r.success) {
        alert('Relatório enviado com sucesso!');
      } else {
        alert(r.message || 'Erro ao enviar');
      }
    })
    .catch(err => {
      alert('Erro ao enviar dados');
      console.error(err);
    });
};

/* ===============================
   HISTÓRICO
=============================== */
window.carregarHistorico = function () {
  const data = dataHistoricoEl.value;

  if (!data) {
    historicoEl.innerHTML = '<p>Selecione uma data.</p>';
    return;
  }

  // Converte yyyy-mm-dd -> dd/MM/yyyy
  const [y, m, d] = data.split('-');
  const dataFormatada = `${d}/${m}/${y}`;

  fetch(`${API_URL}?action=historico&token=${token}&data=${dataFormatada}`)
    .then(r => r.json())
    .then(r => {
      if (!r.success || r.dados.length === 0) {
        historicoEl.innerHTML = '<p>Nenhum registro encontrado.</p>';
        return;
      }

      historicoEl.innerHTML = r.dados.map(item => `
        <div class="historico-item">
          <strong>${item.contrato}</strong><br>
          💰 ${item.faturamentoMes} | 💸 ${item.custoMes}<br>
          👷 ${item.prodRealizada} / ${item.prodPrevista}<br>
          ⭐ ${item.destaques || '-'}
        </div>
      `).join('');
    })
    .catch(err => {
      historicoEl.innerHTML = '<p>Erro ao carregar histórico.</p>';
      console.error(err);
    });
};


