const API_URL = 'https://script.google.com/macros/s/AKfycbyi4ATJ45z5vZFoezCdGhUJy0v0rjTnTo3mmz7BMdGFeoCVnWaiM17E-GZ7PVo_8Qrlvg/exec';

/* =========================
   TOKEN
========================= */
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  document.getElementById('erro').innerText = 'Token não informado na URL';
  throw new Error('Token ausente');
}

/* =========================
   CAMPOS MONETÁRIOS
========================= */
const CAMPOS_MONETARIOS = [
  'faturamentoPrevistoMes',
  'faturamentoProximaSemana',
  'custoPrevistoMes',
  'custoProximaSemana'
];

/* =========================
   FORMATADORES
========================= */
function formatMoneyBR(input) {
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

function moneyToNumber(v) {
  if (!v) return '';
  return Number(v.replace(/\./g, '').replace(',', '.'));
}

function dataBR(dataISO) {
  const [a, m, d] = dataISO.split('-');
  return `${d}/${m}/${a}`;
}

/* =========================
   VALIDAR TOKEN E CARREGAR
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

    // Toggle
    div.querySelector('.contrato-header').onclick = () => {
      const body = div.querySelector('.contrato-body');
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    };

    // Aplica máscara monetária via JS
    div.querySelectorAll('[data-field]').forEach(input => {
      if (CAMPOS_MONETARIOS.includes(input.dataset.field)) {
        input.type = 'text';
        input.addEventListener('input', () => formatMoneyBR(input));
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
    const dados = {
      nomeContrato: div.dataset.nome
    };

    div.querySelectorAll('[data-field]').forEach(el => {
      dados[el.dataset.field] = el.value || '';
    });

    CAMPOS_MONETARIOS.forEach(campo => {
      dados[campo] = moneyToNumber(dados[campo]);
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
   HISTÓRICO
========================= */
function carregarHistorico() {
  const dataISO = document.getElementById('dataHistorico').value;
  if (!dataISO) return;

  const data = dataBR(dataISO);

  fetch(`${API_URL}?action=historico&token=${token}&data=${data}`)
    .then(r => r.json())
    .then(d => {
      const lista = document.getElementById('listaHistorico');
      lista.innerHTML = '';

      if (!d.success || d.dados.length === 0) {
        lista.innerHTML = '<p>Nenhum registro encontrado.</p>';
        return;
      }

      d.dados.forEach(i => {
        lista.innerHTML += `
          <div class="card">
            <strong>${i.contrato}</strong>
            <p>💰 Faturamento (Mês): ${i.faturamentoMes}</p>
            <p>📅 Faturamento Semana: ${i.faturamentoSemana}</p>
            <p>💸 Custo (Mês): ${i.custoMes}</p>
            <p>📆 Custo Semana: ${i.custoSemana}</p>
            <p>👷 Produção Realizada: ${i.prodRealizada}</p>
            <p>👷 Produção Prevista: ${i.prodPrevista}</p>
            <p>📆 Produção Semana: ${i.prodSemana}</p>
            <p>🌟 Destaques: ${i.destaques}</p>
            <p>🎯 Concentrações: ${i.concentracoes}</p>
          </div>
        `;
      });
    });
}

