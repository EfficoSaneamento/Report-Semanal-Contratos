const API_URL = 'https://script.google.com/macros/s/AKfycbwnq85a-I8Z5wWZJQ2tKOa4RBBtO3a1NRS3txIKoLw8VjSdeIWb7Gk-YegKQNldELTppw/exec';

/* =========================
   TOKEN
========================= */
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  document.getElementById('erro').innerText = 'Token não informado';
  throw new Error('Token ausente');
}

/* =========================
   CAMPOS
========================= */
const CAMPOS_MONETARIOS = [
  'faturamentoPrevistoMes',
  'faturamentoProximaSemana',
  'custoPrevistoMes',
  'custoProximaSemana'
];

const CAMPOS_NUMERICOS = [
  'producaoPrevistaMes',
  'producaoRealizadaMes',
  'producaoProximaSemana'
];

/* =========================
   FORMATADORES
========================= */
function formatDecimalBR(input) {
  let v = input.value.replace(/\D/g, '');
  if (!v) {
    input.value = '';
    return;
  }
  v = (Number(v) / 100).toFixed(2);
  v = v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = v;
}

function toNumberBR(v) {
  if (!v) return '';
  return Number(v.replace(/\./g, '').replace(',', '.'));
}

function dataBR(dataISO) {
  const [a, m, d] = dataISO.split('-');
  return `${d}/${m}/${a}`;
}

/* =========================
   VALIDAR TOKEN
========================= */
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(r => r.json())
  .then(d => {
    if (!d.success) {
      document.getElementById('erro').innerText = d.message;
      return;
    }
    document.getElementById('gerenteNome').innerText = d.gerente;
    renderContratos(d.contratos);
  });

/* =========================
   RENDER CONTRATOS
========================= */
function renderContratos(contratos) {
  const container = document.getElementById('formulario');
  container.innerHTML = '';

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';
    div.dataset.nome = c.nome;

    div.innerHTML = `
      <div class="contrato-header">${c.nome}</div>

      <div class="contrato-body">

        <div class="bloco">
          <h4 class="bloco-titulo">💰 Faturamento</h4>
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
          <h4 class="bloco-titulo">💸 Custos</h4>
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
          <h4 class="bloco-titulo">👷 Produção</h4>
          <div class="grid-3">
            <div class="campo">
              <label>Prevista (Mês)</label>
              <input data-field="producaoPrevistaMes">
            </div>
            <div class="campo">
              <label>Produção Realizada (Mês)</label>
              <input data-field="producaoRealizadaMes">
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

    const body = div.querySelector('.contrato-body');
    body.style.display = 'none';

    div.querySelector('.contrato-header').onclick = () => {
      body.style.display = body.style.display === 'none' ? 'grid' : 'none';
    };

    div.querySelectorAll('[data-field]').forEach(input => {
      if ([...CAMPOS_MONETARIOS, ...CAMPOS_NUMERICOS].includes(input.dataset.field)) {
        input.addEventListener('input', () => formatDecimalBR(input));
      }
    });

    container.appendChild(div);
  });
}

/* =========================
   ENVIAR DADOS
========================= */
document.getElementById('btnEnviar').onclick = () => {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(div => {
    const dados = { nomeContrato: div.dataset.nome };

    div.querySelectorAll('[data-field]').forEach(el => {
      dados[el.dataset.field] = el.value || '';
    });

    [...CAMPOS_MONETARIOS, ...CAMPOS_NUMERICOS].forEach(c => {
      dados[c] = toNumberBR(dados[c]);
    });

    contratos.push(dados);
  });

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ token, contratos })
  })
  .then(r => r.json())
  .then(r => {
    if (r.success) {
      alert('Relatório enviado com sucesso!');
      location.reload();
    } else {
      alert(r.message || 'Erro ao enviar');
    }
  });
};

/* =========================
   HISTÓRICO
========================= */
function carregarHistorico() {
  const dataISO = document.getElementById('dataHistorico').value;
  if (!dataISO) return;

  fetch(`${API_URL}?action=historico&token=${token}&data=${dataBR(dataISO)}`)
    .then(r => r.json())
    .then(r => {
      const lista = document.getElementById('listaHistorico');
      lista.innerHTML = '';

      r.dados.forEach(i => {
        lista.innerHTML += `
          <div class="historico-card">
            <h4>📄 ${i.contrato}</h4>
            <div class="historico-bloco">
              <strong>👷 Produção</strong>
              <p>Prevista: ${i.prodPrevista}</p>
              <p>Realizada: ${i.prodRealizada}</p>
              <p>Semana: ${i.prodSemana}</p>
            </div>
          </div>
        `;
      });
    });
}


