const API_URL = 'https://script.google.com/macros/s/AKfycbxfpiONxV6D8CQfocjH-Y9hSJVItLtcgtmx7h7h41BtBP4_bKu6ykAagvLGtYxr72uZUw/exec';

// Lê token da URL
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  document.getElementById('erro').innerText = 'Token não informado';
  throw new Error('Token ausente');
}

// Valida gerente e carrega contratos
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      document.getElementById('erro').innerText = data.message;
      return;
    }

    renderContratos(data.contratos);
  });

function renderContratos(contratos) {
  const container = document.getElementById('formulario');

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';

    div.innerHTML = `
      <div class="contrato-header">${c.nome}</div>
      <div class="contrato-body">
        <input placeholder="Faturamento Previsto Mês" data-field="faturamentoPrevistoMes">
        <input placeholder="Faturamento Próx. Semana" data-field="faturamentoProximaSemana">
        <input placeholder="Custo Previsto Mês" data-field="custoPrevistoMes">
        <input placeholder="Custo Próx. Semana" data-field="custoProximaSemana">
        <input placeholder="Produção Prevista Mês" data-field="producaoPrevistaMes">
        <input placeholder="Produção Realizada Mês" data-field="producaoRealizadaMes">
        <input placeholder="Produção Próx. Semana" data-field="producaoProximaSemana">
        <textarea placeholder="Plano de Guerra" data-field="planodeGuerra"></textarea>
        <textarea placeholder="Destaques da Semana" data-field="destaquesdaSemana"></textarea>
        <textarea placeholder="Concentrações da Semana" data-field="concentracaodaSemana"></textarea>
      </div>
    `;

    div.querySelector('.contrato-header').onclick = () => {
      const body = div.querySelector('.contrato-body');
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    };

    container.appendChild(div);
  });
}

// Envio
document.getElementById('btnEnviar').onclick = () => {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(div => {
    const nomeContrato = div.querySelector('.contrato-header').innerText;
    const dados = { nomeContrato };

    div.querySelectorAll('[data-field]').forEach(el => {
      dados[el.dataset.field] = el.value;
    });

    contratos.push(dados);
  });

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, contratos })
  })
    .then(res => res.json())
    .then(r => {
      if (r.success) alert('Enviado com sucesso!');
      else alert(r.message);
    });
};

