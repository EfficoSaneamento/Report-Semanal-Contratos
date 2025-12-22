const API_URL = "https://script.google.com/macros/s/AKfycbyi4ATJ45z5vZFoezCdGhUJy0v0rjTnTo3mmz7BMdGFeoCVnWaiM17E-GZ7PVo_8Qrlvg/exec";

/* =========================
   UTIL
========================= */
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

if (!token) {
  document.getElementById("erro").innerText = "Token não informado na URL";
  throw new Error("Token ausente");
}

function dataBR(dataISO) {
  if (!dataISO) return "";
  const [a, m, d] = dataISO.split("-");
  return `${d}/${m}/${a}`;
}

/* =========================
   VALIDAR TOKEN E CARREGAR CONTRATOS
========================= */
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(r => r.json())
  .then(d => {
    if (!d.success) {
      document.getElementById("erro").innerText = d.message;
      return;
    }

    document.getElementById("gerenteNome").innerText = d.gerente;
    renderContratos(d.contratos);
  })
  .catch(() => {
    document.getElementById("erro").innerText = "Erro ao conectar com a API";
  });

/* =========================
   RENDER CONTRATOS (FORMULÁRIO)
========================= */
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
    div.dataset.nome = c.nome;

    div.innerHTML = `
      <div class="contrato-header">${c.nome}</div>

      <div class="contrato-body" style="display:none">

        <div class="bloco">
          <h4>💰 Faturamento</h4>
          <div class="grid-2">
            <input placeholder="Previsto (Mês)" data-field="faturamentoPrevistoMes">
            <input placeholder="Próx. Semana" data-field="faturamentoProximaSemana">
          </div>
        </div>

        <div class="bloco">
          <h4>💸 Custos</h4>
          <div class="grid-2">
            <input placeholder="Previsto (Mês)" data-field="custoPrevistoMes">
            <input placeholder="Próx. Semana" data-field="custoProximaSemana">
          </div>
        </div>

        <div class="bloco">
          <h4>👷 Produção</h4>
          <div class="grid-3">
            <input placeholder="Realizada (Mês)" data-field="producaoRealizadaMes">
            <input placeholder="Prevista (Mês)" data-field="producaoPrevistaMes">
            <input placeholder="Próx. Semana" data-field="producaoProximaSemana">
          </div>
        </div>

        <div class="bloco">
          <h4>🧠 Análise</h4>
          <textarea placeholder="Destaques da Semana" data-field="destaquesdaSemana"></textarea>
          <textarea placeholder="Concentrações da Semana" data-field="concentracaodaSemana"></textarea>
        </div>

      </div>
    `;

    // abre / fecha
    div.querySelector(".contrato-header").onclick = () => {
      const body = div.querySelector(".contrato-body");
      body.style.display = body.style.display === "none" ? "block" : "none";
    };

    container.appendChild(div);
  });
}

/* =========================
   ENVIAR RELATÓRIO
========================= */
document.getElementById("btnEnviar").onclick = () => {
  const contratos = [];

  document.querySelectorAll(".contrato").forEach(div => {
    const dados = {
      nomeContrato: div.dataset.nome
    };

    div.querySelectorAll("[data-field]").forEach(el => {
      dados[el.dataset.field] = el.value || "";
    });

    contratos.push(dados);
  });

  if (contratos.length === 0) {
    alert("Nenhum contrato preenchido");
    return;
  }

  fetch(API_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, contratos })
  })
    .then(r => r.json())
    .then(r => {
      if (r.success) {
        alert("Relatório enviado com sucesso!");
        location.reload();
      } else {
        alert(r.message || "Erro ao enviar");
      }
    })
    .catch(() => {
      alert("Erro ao conectar com a API");
    });
};

/* =========================
   HISTÓRICO
========================= */
function carregarHistorico() {
  const dataISO = document.getElementById("dataHistorico").value;
  if (!dataISO) return;

  const data = dataBR(dataISO);
  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = "Carregando...";

  fetch(`${API_URL}?action=historico&token=${token}&data=${data}`)
    .then(r => r.json())
    .then(r => {
      if (!r.success || r.dados.length === 0) {
        lista.innerHTML = "Nenhum registro encontrado";
        return;
      }

      lista.innerHTML = "";

      r.dados.forEach(i => {
        lista.innerHTML += `
          <div class="historico-item">
            <strong>${i.contrato}</strong><br>
            💰 Faturamento: ${i.faturamentoMes} / ${i.faturamentoSemana}<br>
            💸 Custos: ${i.custoMes} / ${i.custoSemana}<br>
            👷 Produção: ${i.prodRealizada} / ${i.prodPrevista} / ${i.prodSemana}<br>
            🌟 Destaques: ${i.destaques || "-"}<br>
            🎯 Concentrações: ${i.concentracoes || "-"}
            <hr>
          </div>
        `;
      });
    })
    .catch(() => {
      lista.innerHTML = "Erro ao carregar histórico";
    });
}



