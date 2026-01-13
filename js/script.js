const API_URL = 'https://script.google.com/macros/s/AKfycbwnq85a-I8Z5wWZJQ2tKOa4RBBtO3a1NRS3txIKoLw8VjSdeIWb7Gk-YegKQNldELTppw/exec';

/* TOKEN */
const token = new URLSearchParams(window.location.search).get('token');
if (!token) throw new Error('Token ausente');

/* CAMPOS */
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

/* FORMATADORES */
function formatDecimalBR(input) {
  let v = input.value.replace(/\D/g, '');
  if (!v) return input.value = '';
  v = (v / 100).toFixed(2).replace('.', ',');
  input.value = v.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function toNumberBR(v) {
  return v ? Number(v.replace(/\./g, '').replace(',', '.')) : '';
}

/* VALIDAR */
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(r => r.json())
  .then(d => renderContratos(d.contratos));

/* FORMULÁRIO */
function renderContratos(contratos) {
  const container = document.getElementById('formulario');
  container.innerHTML = '';

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';
    div.dataset.nome = c.nome;

    div.innerHTML = `
      <h3>${c.nome}</h3>

      <input data-field="faturamentoPrevistoMes" placeholder="Fat. Previsto Mês">
      <input data-field="faturamentoProximaSemana" placeholder="Fat. Próx. Semana">

      <input data-field="custoPrevistoMes" placeholder="Custo Previsto Mês">
      <input data-field="custoProximaSemana" placeholder="Custo Próx. Semana">

      <input data-field="producaoPrevistaMes" placeholder="Produção Prevista Mês">
      <input data-field="producaoRealizadaMes" placeholder="Produção Realizada Mês">
      <input data-field="producaoProximaSemana" placeholder="Produção Próx. Semana">

      <textarea data-field="destaquesdaSemana"></textarea>
      <textarea data-field="concentracaodaSemana"></textarea>
    `;

    div.querySelectorAll('[data-field]').forEach(i => {
      if (CAMPOS_MONETARIOS.includes(i.dataset.field) ||
          CAMPOS_NUMERICOS.includes(i.dataset.field)) {
        i.addEventListener('input', () => formatDecimalBR(i));
      }
    });

    container.appendChild(div);
  });
}

/* ENVIAR */
document.getElementById('btnEnviar').onclick = () => {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(div => {
    const dados = { nomeContrato: div.dataset.nome };
    div.querySelectorAll('[data-field]').forEach(el => {
      dados[el.dataset.field] = el.value;
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
    .then(r => alert(r.success ? 'Enviado com sucesso!' : r.message));
};

