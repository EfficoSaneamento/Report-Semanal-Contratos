const API_URL = "https://script.google.com/macros/s/AKfycbybeMFf5PE9G2LrWshRpT_i0rvtEus7H6nrvR1KnjbJtzV9_Fn491ZjumwZz0XtYSyKgQ/exec";

// ===============================
// Token
// ===============================
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const erro = document.getElementById("erro");

if (!token) {
  erro.innerText = "Token não informado na URL";
  throw new Error("Token ausente");
}

// ===============================
// Valida gerente
// ===============================
fetch(`${API_URL}?action=validar&token=${encodeURIComponent(token)}`)
  .then(res => res.json())
  .then(data => {
    if (!data.success) {
      erro.innerText = data.message || "Erro ao validar token";
      return;
    }
    renderContratos(data.contratos);
  })
  .catch(err => {
    erro.innerText = "Erro ao conectar com a API";
    console.error(err);
  });

// ===============================
// Renderiza contratos
// ===============================
function renderContratos(contratos) {
  const container = document.getElementById("formulario");
  container.innerHTML = "";

  if (!contratos || contratos.length === 0) {
    container.innerHTML = "<p>Nenhum contrato encontrado.</p>";
    return;
  }

  contratos.forEach(c => {
    const div = document.createElement("div");
    div.className = "contrato";

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

    div.querySelector(".contrato-header").onclick = () => {
      const body = div.querySelector(".contrato-body");
      body.style.display = body.style.display === "none" ? "block" : "none";
    };

    container.appendChild(div);
  });
}

// ===============================
// Enviar relatório
// ===============================
document.getElementById("btnEnviar").onclick = () => {
  erro.innerText = "";
  const contratos = [];

  document.querySelectorAll(".contrato").forEach(div => {
    const header = div.querySelector(".contrato-header");

    const dados = {
      nomeContrato: header.textContent.trim()
    };

    let temConteudo = false;

    div.querySelectorAll("[data-field]").forEach(el => {
      if (el.value.trim() !== "") temConteudo = true;
      dados[el.dataset.field] = el.value.trim();
    });

    if (temConteudo) {
      contratos.push(dados);
    }
  });

  if (contratos.length === 0) {
    erro.innerText = "Preencha pelo menos um contrato.";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, contratos })
  })
    .then(res => res.text())
    .then(text => {
      const r = JSON.parse(text);
      if (!r.success) throw new Error(r.message);
      alert("Relatório enviado com sucesso!");
      location.reload();
    })
    .catch(err => {
      console.error(err);
      erro.innerText = "Erro ao enviar dados: " + err.message;
    });
};

