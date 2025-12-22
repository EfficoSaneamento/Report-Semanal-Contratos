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
   VALIDAR TOKEN + CONTRATOS
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
   RENDER CONTRATOS
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
            <input type="number" placeholder="Previsto (Mês)" data-field="faturamentoPrevistoMes">
            <input type="number" placeholder="Próx. Semana" data-field="faturamentoProximaSemana">
          </div>
        </div>

        <div class="bloco">
          <h4>💸 Custos</h4>
          <div class="grid-2">
            <input type="number" placeholder="Previsto (Mês)" data-field="custoPrevistoMes">
            <input type="number" placeholder="Próx. Semana" data-field="custoProximaSemana">
          </div>
        </div>

        <div class="bloco">
          <h4>👷 Produção</h4>
          <div class="grid-3">
            <input placeholder="Prevista (Mês)" data-field="producaoPrevistaMes">
            <input placeholder="Realizada (Mês)" data-field="producaoRealizadaMes">
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
    const dados = { nomeContrato: div.dataset.nome };

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
    .catch(err => {
      console.error(err);
      alert("Erro ao enviar dados");
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

  lista.innerHTML = "<p>Carregando histórico...</p>";

  fetch(`${API_URL}?action=historico&token=${token}&data=${data}`)
    .then(r => r.json())
    .then(r => {
      if (!r.success || r.dados.length === 0) {
        lista.innerHTML = "<p>Nenhum registro encontrado para esta data.</p>";
        return;
      }

      lista.innerHTML = "";

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
              <p>Realizada: <span>${i.prodRealizada}</span></p>
              <p>Prevista: <span>${i.prodPrevista}</span></p>
              <p>Semana: <span>${i.prodSemana}</span></p>
            </div>

            <div class="historico-bloco">
              <strong>🧠 Análise</strong>
              <p><strong>Destaques:</strong> ${i.destaques || "-"}</p>
              <p><strong>Concentrações:</strong> ${i.concentracoes || "-"}</p>
            </div>

          </div>
        `;
      });
    })
    .catch(() => {
      lista.innerHTML = "<p>Erro ao carregar histórico.</p>";
    });
}
