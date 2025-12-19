const API_URL = "https://script.google.com/macros/s/AKfycbyi4ATJ45z5vZFoezCdGhUJy0v0rjTnTo3mmz7BMdGFeoCVnWaiM17E-GZ7PVo_8Qrlvg/exec";

/* =========================
   UTIL
========================= */
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

function dataBR(dataISO) {
  const [a, m, d] = dataISO.split("-");
  return `${d}/${m}/${a}`;
}

/* =========================
   VALIDAR TOKEN
========================= */
fetch(`${API_URL}?action=validar&token=${token}`)
  .then(r => r.json())
  .then(d => renderContratos(d.contratos));

/* =========================
   ENVIAR
========================= */
document.getElementById("btnEnviar").onclick = () => {
  const contratos = [];

  document.querySelectorAll(".contrato").forEach(div => {
    const dados = {
      nomeContrato: div.dataset.nome
    };

    div.querySelectorAll("[data-field]").forEach(el => {
      dados[el.dataset.field] = el.value;
    });

    contratos.push(dados);
  });

  fetch(API_URL, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, contratos })
  })
    .then(r => r.json())
    .then(() => alert("Enviado com sucesso!"))
    .catch(() => alert("Erro ao enviar"));
};

/* =========================
   HISTÓRICO
========================= */
function carregarHistorico() {
  const data = dataBR(document.getElementById("data").value);

  fetch(`${API_URL}?action=historico&token=${token}&data=${data}`)
    .then(r => r.json())
    .then(d => {
      const h = document.getElementById("historico");
      h.innerHTML = "";

      d.dados.forEach(i => {
        h.innerHTML += `
          <div class="card">
            <h3>${i.contrato}</h3>
            <p>${i.faturamentoMes}</p>
            <p>${i.faturamentoSemana}</p>
            <p>${i.custoMes}</p>
            <p>${i.custoSemana}</p>
            <p>${i.prodRealizada}</p>
            <p>${i.prodPrevista}</p>
            <p>${i.prodSemana}</p>
            <p>${i.destaques}</p>
            <p>${i.concentracoes}</p>
          </div>
        `;
      });
    });
}


