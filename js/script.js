const API_URL = 'https://script.google.com/macros/s/AKfycbwX84A9XXr4gEGCb4PRbDPdog1KpjuXu9w-v02o4ryqJIsCrX1c-LAYD9Df3ClmW814/exec';

/* ===============================
   LÊ TOKEN DA URL
================================ */
const params = new URLSearchParams(window.location.search);
const token = params.get('token');

const erroEl = document.getElementById('erro');
const formularioEl = document.getElementById('formulario');
const btnEnviar = document.getElementById('btnEnviar');

if (!token) {
  erroEl.innerText = 'Token não informado na URL';
  throw new Error('Token ausente');
}

/* ===============================
   VALIDA GERENTE E CARREGA CONTRATOS
================================ */
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(res => res.text())
  .then(text => {
    const data = JSON.parse(text);

    if (!data.success) {
      erroEl.innerText = data.message || 'Erro ao validar token';
      return;
    }

    document.getElementById('gerenteNome').innerText = data.gerente;
    renderContratos(data.contratos);
  })
  .catch(err => {
    console.error(err);
    erroEl.innerText = 'Erro ao conectar com a API';
  });

/* ===============================
   RENDERIZA CONTRATOS
================================ */
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

      <div class="contrato-body" style="display:none">

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

    // Abre / fecha contrato
    div.querySelector('.contrato-header').onclick = () => {
      const body = div.querySelector('.contrato-body');
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    };

    formularioEl.appendChild(div);
  });
}

/* ===============================
   ENVIO DOS DADOS (SEM CORS)
================================ */
btnEnviar.onclick = () => {
  erroEl.innerText = '';

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

  btnEnviar.disabled = true;
  btnEnviar.innerText = 'Enviando...';

  fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      token: token,
      contratos: contratos
    })
  })
    .then(res => res.text())
    .then(text => {
      const r = JSON.parse(text);

      if (r.success) {
        alert('Relatório enviado com sucesso!');
      } else {
        alert(r.message || 'Erro ao enviar dados');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao enviar dados');
    })
    .finally(() => {
      btnEnviar.disabled = false;
      btnEnviar.innerText = 'Enviar Relatório';
    });
};

