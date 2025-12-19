const API_URL = 'https://script.google.com/macros/s/AKfycbz8Yq49synXDR0Gfj0j4t9UWi5Jqu94Ya7-F-6aF7-l9dy7e8rteRGCRPopLhb9amuu/exec';
let TOKEN_GLOBAL = '';

/* =========================
   LER TOKEN DA URL
========================= */
const params = new URLSearchParams(window.location.search);
const tokenUrl = params.get('token');

if (tokenUrl) {
  TOKEN_GLOBAL = tokenUrl;
  validarToken(tokenUrl);
}

/* =========================
   VALIDAR TOKEN
========================= */
function validarToken(token) {
  fetch(`${API_URL}?action=validar&token=${token}`)
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        document.getElementById('erro').innerText = data.message;
        return;
      }

      TOKEN_GLOBAL = token;
      document.getElementById('nomeGerente').innerText = data.gerente;
      renderContratos(data.contratos);
    })
    .catch(() => {
      document.getElementById('erro').innerText = 'Erro ao validar token';
    });
}

/* =========================
   RENDERIZA CONTRATOS
========================= */
function renderContratos(contratos) {
  const container = document.getElementById('formulario');
  container.innerHTML = '';

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';

    div.innerHTML = `
      <div class="contrato-header">${c.nome}</div>
      <div class="contrato-body">

        <h4>💰 Faturamento</h4>
        <input data-field="faturamentoPrevistoMes" placeholder="Previsto Mês">
        <input data-field="faturamentoProximaSemana" placeholder="Próx. Semana">

        <h4>💸 Custos</h4>
        <input data-field="custoPrevistoMes" placeholder="Previsto Mês">
        <input data-field="custoProximaSemana" placeholder="Próx. Semana">

        <h4>👷 Produção</h4>
        <input data-field="producaoRealizadaMes" placeholder="Realizada Mês">
        <input data-field="producaoPrevistaMes" placeholder="Prevista Mês">
        <input data-field="producaoProximaSemana" placeholder="Próx. Semana">

        <h4>📝 Análise</h4>
        <textarea data-field="destaquesdaSemana" placeholder="Destaques"></textarea>
        <textarea data-field="concentracaodaSemana" placeholder="Concentrações"></textarea>

      </div>
    `;

    container.appendChild(div);
  });
}

/* =========================
   ENVIAR FORMULÁRIO
========================= */
document.getElementById('btnEnviar').onclick = () => {
  if (!TOKEN_GLOBAL) {
    alert('Token não validado');
    return;
  }

  const contratos = [];

  document.querySelectorAll('.contrato').forEach(div => {
    const nomeContrato = div.querySelector('.contrato-header').innerText;
    const dados = { nomeContrato };

    div.querySelectorAll('[data-field]').forEach(el => {
      dados[el.dataset.field] = el.value || '';
    });

    contratos.push(dados);
  });

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      token: TOKEN_GLOBAL,
      contratos
    })
  })
    .then(res => res.json())
    .then(r => {
      if (!r.success) {
        alert(r.message);
        return;
      }
      alert('Dados enviados com sucesso!');
    })
    .catch(() => {
      alert('Erro ao enviar dados');
    });
};

/* =========================
   HISTÓRICO
========================= */
document.getElementById('btnBuscarHistorico').onclick = () => {
  const dataInput = document.getElementById('dataHistorico').value;

  if (!dataInput) {
    alert('Selecione a data');
    return;
  }

  const [ano, mes, dia] = dataInput.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;

  fetch(`${API_URL}?action=historico&token=${TOKEN_GLOBAL}&data=${dataFormatada}`)
    .then(res => res.json())
    .then(r => {
      const h = document.getElementById('historico');
      h.innerHTML = '';

      if (!r.success || r.dados.length === 0) {
        h.innerHTML = '<p>Nenhum registro encontrado</p>';
        return;
      }

      r.dados.forEach(d => {
        h.innerHTML += `
          <div class="historico-item">
            <h4>${d.contrato}</h4>

            <p><b>Faturamento Mês:</b> ${d.faturamentoMes}</p>
            <p><b>Faturamento Semana:</b> ${d.faturamentoSemana}</p>

            <p><b>Custo Mês:</b> ${d.custoMes}</p>
            <p><b>Custo Semana:</b> ${d.custoSemana}</p>

            <p><b>Produção Realizada:</b> ${d.prodRealizada}</p>
            <p><b>Produção Prevista:</b> ${d.prodPrevista}</p>
            <p><b>Produção Semana:</b> ${d.prodSemana}</p>

            <p><b>Destaques:</b> ${d.destaques || '-'}</p>
            <p><b>Concentrações:</b> ${d.concentracoes || '-'}</p>
          </div>
        `;
      });
    })
    .catch(() => {
      alert('Erro ao buscar histórico');
    });
};



