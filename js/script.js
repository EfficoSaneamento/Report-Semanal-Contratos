const API_URL = 'https://script.google.com/macros/s/AKfycbyi4ATJ45z5vZFoezCdGhUJy0v0rjTnTo3mmz7BMdGFeoCVnWaiM17E-GZ7PVo_8Qrlvg/exec';

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
   CAMPOS FORMATADOS
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
  v = v.replace('.', ',');
  v = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

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
  })
  .catch(() => {
    document.getElementById('erro').innerText = 'Erro ao conectar com a API';
  });

/* =========================
   RENDER CONTRATOS
========================= */
function renderContratos(contratos) {
  const container = document.getElementById('formulario');
  container.innerHTML = '';

  if (!contratos || contratos.length === 0) {
    container.innerHTML = '<p>Nenhum contrato encontrado.</p>';
    return;
  }

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';
    div.dataset.nome = c.nome;

    div.innerHTML = `
      <div class="contrato-header">${c.nome}</div>

      <div class="contrato-body" style="display:none">

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
              <input data-field="produçãoPrevistaMes">
            </div>
            <div class="campo">
              <label>Próx. Semana</label>
              <input data-field="producaoProximaSemana">
            </div>
            <div class="campo">
              <label>Produção Realizada (Mês)</label>
              <input data-field="producaoRealizadaMes">
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

    // Toggle
    div.querySelector('.contrato-header').onclick = () => {
      const body = div.querySelector('.contrato-body');
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    };

    // Aplica formatação BR
    div.querySelectorAll('[data-field]').forEach(input => {
      if (CAMPOS_MONETARIOS.includes(input.dataset.field) ||
          CAMPOS_NUMERICOS.includes(input.dataset.field)) {
        input.type = 'text';
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

    [...CAMPOS_MONETARIOS, ...CAMPOS_NUMERICOS].forEach(campo => {
      dados[campo] = toNumberBR(dados[campo]);
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
    })
    .catch(() => alert('Erro ao enviar dados'));
};

/* =========================
   HISTÓRICO (VISUAL PROFISSIONAL)
========================= */
function carregarHistorico() {
  const dataISO = document.getElementById('dataHistorico').value;
  if (!dataISO) return;

  const data = dataBR(dataISO);
  const lista = document.getElementById('listaHistorico');

  lista.innerHTML = '<p>Carregando histórico...</p>';

  fetch(`${API_URL}?action=historico&token=${token}&data=${data}`)
    .then(r => r.json())
    .then(r => {
      if (!r.success || r.dados.length === 0) {
        lista.innerHTML = '<p>Nenhum registro encontrado para esta data.</p>';
        return;
      }

      lista.innerHTML = '';

      r.dados.forEach(i => {
        lista.innerHTML += `
          <div class="historico-card">

            <h4>📄 ${i.contrato}</h4>

            <div class="historico-bloco">
              <strong>💰 Faturamento</strong>
              <p>Mês: <span>${i.faturamentoMes}</span></p>
              <p>Semana: <span>${i.faturamentoSemana}</span></p>
            </div>

            <div class="historico-bloco">
              <strong>💸 Custos</strong>
              <p>Mês: <span>${i.custoMes}</span></p>
              <p>Semana: <span>${i.custoSemana}</span></p>
            </div>

            <div class="historico-bloco">
              <strong>👷 Produção</strong>
              <p>Prevista: <span>${i.prodPrevista}</span></p>
              <p>Realizada: <span>${i.prodRealizada}</span></p>
              <p>Semana: <span>${i.prodSemana}</span></p>
            </div>

            <div class="historico-bloco">
              <strong>🧠 Análise</strong>
              <p><strong>Destaques:</strong> ${i.destaques || '-'}</p>
              <p><strong>Concentrações:</strong> ${i.concentracoes || '-'}</p>
            </div>

          </div>
        `;
      });
    })
    .catch(() => {
      lista.innerHTML = '<p>Erro ao carregar histórico.</p>';
    });
}

