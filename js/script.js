const API_URL = 'https://script.google.com/macros/s/AKfycbz8Yq49synXDR0Gfj0j4t9UWi5Jqu94Ya7-F-6aF7-l9dy7e8rteRGCRPopLhb9amuu/exec';
let TOKEN = '';

/* =========================
   TOKEN DA URL
========================= */
const params = new URLSearchParams(window.location.search);
TOKEN = params.get('token');

if (!TOKEN) {
  alert('Token não informado');
  throw new Error('Token ausente');
}

/* =========================
   VALIDAR TOKEN
========================= */
fetch(`${API_URL}?action=validar&token=${TOKEN}`)
  .then(r => r.json())
  .then(d => {
    if (!d.success) {
      alert(d.message);
      return;
    }
    document.getElementById('nomeGerente').innerText = d.gerente;
    renderContratos(d.contratos);
  });

/* =========================
   FORMULÁRIO
========================= */
function renderContratos(contratos) {
  const f = document.getElementById('formulario');
  f.innerHTML = '';

  contratos.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contrato';

    div.innerHTML = `
      <h3>${c.nome}</h3>

      <div class="bloco">
        <h4>💰 Faturamento</h4>
        <input data="faturamentoPrevistoMes" placeholder="Previsto (Mês)">
        <input data="faturamentoProximaSemana" placeholder="Próx. Semana">
      </div>

      <div class="bloco">
        <h4>💸 Custos</h4>
        <input data="custoPrevistoMes" placeholder="Previsto (Mês)">
        <input data="custoProximaSemana" placeholder="Próx. Semana">
      </div>

      <div class="bloco">
        <h4>👷 Produção</h4>
        <input data="producaoRealizadaMes" placeholder="Realizada (Mês)">
        <input data="producaoPrevistaMes" placeholder="Prevista (Mês)">
        <input data="producaoProximaSemana" placeholder="Próx. Semana">
      </div>

      <div class="bloco">
        <h4>📝 Análise</h4>
        <textarea data="destaquesdaSemana" placeholder="Destaques"></textarea>
        <textarea data="concentracaodaSemana" placeholder="Concentrações"></textarea>
      </div>
    `;

    f.appendChild(div);
  });
}

/* =========================
   ENVIAR
========================= */
document.getElementById('btnEnviar').onclick = () => {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(c => {
    const obj = {
      nomeContrato: c.querySelector('h3').innerText
    };

    c.querySelectorAll('[data]').forEach(i => {
      obj[i.getAttribute('data')] = i.value || '';
    });

    contratos.push(obj);
  });

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      token: TOKEN,
      contratos
    })
  })
    .then(r => r.json())
    .then(r => {
      if (!r.success) {
        alert(r.message);
        return;
      }
      alert('Relatório enviado com sucesso!');
    })
    .catch(() => {
      alert('Erro ao enviar dados');
    });
};

/* =========================
   HISTÓRICO
========================= */
document.getElementById('btnBuscarHistorico').onclick = () => {
  const data = document.getElementById('dataHistorico').value;
  if (!data) return alert('Selecione a data');

  const [a, m, d] = data.split('-');
  const dataBR = `${d}/${m}/${a}`;

  fetch(`${API_URL}?action=historico&token=${TOKEN}&data=${dataBR}`)
    .then(r => r.json())
    .then(r => {
      const h = document.getElementById('historico');
      h.innerHTML = '';

      if (!r.success || r.dados.length === 0) {
        h.innerHTML = '<p>Nenhum registro encontrado</p>';
        return;
      }

      r.dados.forEach(d => {
        h.innerHTML += `
          <div class="historico-card">
            <h3>${d.contrato}</h3>

            <div class="hist-bloco">
              <h4>💰 Faturamento</h4>
              <p>Previsto Mês: ${d.faturamentoMes}</p>
              <p>Próx. Semana: ${d.faturamentoSemana}</p>
            </div>

            <div class="hist-bloco">
              <h4>💸 Custos</h4>
              <p>Previsto Mês: ${d.custoMes}</p>
              <p>Próx. Semana: ${d.custoSemana}</p>
            </div>

            <div class="hist-bloco">
              <h4>👷 Produção</h4>
              <p>Realizada: ${d.prodRealizada}</p>
              <p>Prevista: ${d.prodPrevista}</p>
              <p>Próx. Semana: ${d.prodSemana}</p>
            </div>

            <div class="hist-bloco">
              <h4>📝 Análise</h4>
              <p>Destaques: ${d.destaques || '-'}</p>
              <p>Concentrações: ${d.concentracoes || '-'}</p>
            </div>
          </div>
        `;
      });
    });
};




