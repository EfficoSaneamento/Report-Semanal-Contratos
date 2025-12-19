const API_URL = 'https://script.google.com/macros/s/AKfycbzUSzjn5x5UcbMbelKPrRNWJcdbJWhzU3ZG16SdxxwmHeafvfNdxXC25VKHQ7EsJeco7w/exec';

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
   VALIDAR GERENTE + CONTRATOS
========================= */
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(r => r.json())
  .then(data => {
    if (!data.success) {
      document.getElementById('erro').innerText = data.message;
      return;
    }

    document.getElementById('gerenteNome').innerText = `Gerente: ${data.gerente}`;
    renderContratos(data.contratos);
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

    container.appendChild(div);
  });
}

/* =========================
   ENVIAR RELATÓRIO
========================= */
document.getElementById('btnEnviar').onclick = () => {
  const contratos = [];

  document.querySelectorAll('.contrato').forEach(div => {
    const header = div.querySelector('.contrato-header');

    const dados = {
      nomeContrato: header.innerText
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
        location.reload();
      } else {
        alert(r.message || 'Erro ao enviar');
      }
    })
    .catch(() => {
      alert('Erro ao enviar dados');
    });
};

/* =========================
   HISTÓRICO
========================= */
function carregarHistorico() {
  const data = document.getElementById('dataHistorico').value;
  const lista = document.getElementById('listaHistorico');

  if (!data) {
    lista.innerHTML = 'Selecione uma data';
    return;
  }

  lista.innerHTML = 'Carregando...';

  fetch(`${API_URL}?action=historico&token=${token}&data=${data}`)
    .then(r => r.json())
    .then(r => {
      if (!r.success || r.dados.length === 0) {
        lista.innerHTML = 'Nenhum registro encontrado';
        return;
      }

      lista.innerHTML = '';

      r.dados.forEach(d => {
        lista.innerHTML += `
          <div class="historico-item">
            <strong>${d.contrato}</strong><br>
            💰 Faturamento: ${d.faturamentoMes} / ${d.faturamentoSemana}<br>
            💸 Custos: ${d.custoMes} / ${d.custoSemana}<br>
            👷 Produção: ${d.prodRealizada} / ${d.prodPrevista} / ${d.prodSemana}<br>
            🌟 Destaques: ${d.destaques || '-'}<br>
            🎯 Concentrações: ${d.concentracoes || '-'}
            <hr>
          </div>
        `;
      });
    })
    .catch(() => {
      lista.innerHTML = 'Erro ao carregar histórico';
    });
}

