// Quem está logado: "admin", "cliente" ou "" (ninguém)
let usuario = "";

// Lista com todos os registros (fichas e agendamentos)
let registros = [];

// Carrega o que já estava salvo no navegador
let salvos = localStorage.getItem("salao");
if (salvos) {
    registros = JSON.parse(salvos);
}

function salvarNoNavegador() {
    localStorage.setItem("salao", JSON.stringify(registros));
}


// ---------- Janela de aviso ----------

function mostrarAviso(titulo, mensagem) {
    document.getElementById("modal-titulo").innerText = titulo;
    document.getElementById("modal-mensagem").innerText = mensagem;
    document.getElementById("modal").classList.remove("escondido");
}

function fecharAviso() {
    document.getElementById("modal").classList.add("escondido");
}


// ---------- Login ----------

function fazerLogin(evento) {
    evento.preventDefault();

    let nome = document.getElementById("login-usuario").value;
    let senha = document.getElementById("login-senha").value;

    if (nome == "admin" && senha == "admin") {
        usuario = "admin";
    } else if (nome == "cliente" && senha == "123") {
        usuario = "cliente";
    } else {
        mostrarAviso("Não foi possível entrar", "Usuário ou senha incorretos.");
        return;
    }

    abrirSistema();
}

function abrirSistema() {
    document.getElementById("tela-login").classList.add("escondido");
    document.getElementById("tela-sistema").classList.remove("escondido");

    if (usuario == "admin") {
        document.getElementById("form-admin").classList.remove("escondido");
        document.getElementById("form-cliente").classList.add("escondido");
        document.getElementById("boas-vindas").innerText = "Área do administrador";
        document.getElementById("titulo-lista").innerText = "Agenda e histórico";
    } else {
        document.getElementById("form-admin").classList.add("escondido");
        document.getElementById("form-cliente").classList.remove("escondido");
        document.getElementById("boas-vindas").innerText = "Área da cliente";
        document.getElementById("titulo-lista").innerText = "Meus agendamentos";
    }

    mostrarLista();
}

function sair() {
    usuario = "";
    document.getElementById("form-login").reset();
    document.getElementById("tela-sistema").classList.add("escondido");
    document.getElementById("tela-login").classList.remove("escondido");
}


// ---------- Datas ----------

// Devolve a data de hoje no formato do input (aaaa-mm-dd)
function dataDeHoje() {
    let hoje = new Date();
    let ano = hoje.getFullYear();
    let mes = hoje.getMonth() + 1;
    let dia = hoje.getDate();

    if (mes < 10) mes = "0" + mes;
    if (dia < 10) dia = "0" + dia;

    return ano + "-" + mes + "-" + dia;
}

// Transforma 2026-10-27 em 27/10/2026
function formatarData(data) {
    let partes = data.split("-");
    return partes[2] + "/" + partes[1] + "/" + partes[0];
}


// ---------- Fichas extras do admin ----------

function trocarFicha() {
    let procedimento = document.getElementById("admin-procedimento").value;

    document.getElementById("ficha-coloracao").classList.add("escondido");
    document.getElementById("ficha-mechas").classList.add("escondido");

    if (procedimento == "Coloração") {
        document.getElementById("ficha-coloracao").classList.remove("escondido");
    }
    if (procedimento == "Luzes") {
        document.getElementById("ficha-mechas").classList.remove("escondido");
    }
}


// ---------- Salvar ----------

function salvarFichaAdmin(evento) {
    evento.preventDefault();

    let procedimento = document.getElementById("admin-procedimento").value;

    let ficha = {
        id: Date.now(),
        nome: document.getElementById("admin-nome").value,
        procedimento: procedimento,
        data: document.getElementById("admin-data").value,
        horario: "",
        valor: Number(document.getElementById("admin-valor").value).toFixed(2),
        detalhes: document.getElementById("admin-detalhes").value,
        origem: "admin",
        status: "confirmado"
    };

    if (procedimento == "Coloração") {
        ficha.marca = document.getElementById("admin-marca").value;
        ficha.cor = document.getElementById("admin-cor").value;
        ficha.aditivos = document.getElementById("admin-aditivos").value;
    }

    if (procedimento == "Luzes") {
        ficha.tecnica = document.getElementById("admin-tecnica").value;
        ficha.ox = document.getElementById("admin-ox").value;
        ficha.po = document.getElementById("admin-po").value;
        ficha.matizador = document.getElementById("admin-matizador").value;
    }

    registros.push(ficha);
    salvarNoNavegador();

    document.getElementById("form-admin").reset();
    trocarFicha();
    mostrarLista();
    mostrarAviso("Ficha salva", "O procedimento foi registrado.");
}

function salvarAgendamento(evento) {
    evento.preventDefault();

    let data = document.getElementById("cliente-data").value;
    let horario = document.getElementById("cliente-horario").value;

    if (data < dataDeHoje()) {
        mostrarAviso("Data inválida", "Escolha um dia a partir de hoje.");
        return;
    }

    // Não deixa marcar dois atendimentos no mesmo dia e horário
    for (let i = 0; i < registros.length; i++) {
        let r = registros[i];
        if (r.data == data && r.horario == horario && r.status != "recusado") {
            mostrarAviso("Horário ocupado", "Já existe um agendamento nesse dia e horário. Escolha outro.");
            return;
        }
    }

    let agendamento = {
        id: Date.now(),
        nome: document.getElementById("cliente-nome").value,
        procedimento: document.getElementById("cliente-procedimento").value,
        data: data,
        horario: horario,
        origem: "cliente",
        status: "pendente"
    };

    registros.push(agendamento);
    salvarNoNavegador();

    document.getElementById("form-cliente").reset();
    mostrarLista();
    mostrarAviso("Pedido enviado", "Seu horário foi enviado e aguarda confirmação do salão.");
}


// ---------- Aceitar / recusar (admin) ----------

function mudarStatus(id, novoStatus) {
    for (let i = 0; i < registros.length; i++) {
        if (registros[i].id == id) {
            registros[i].status = novoStatus;
        }
    }

    salvarNoNavegador();
    mostrarLista();

    if (novoStatus == "confirmado") {
        mostrarAviso("Agendamento confirmado", "A cliente já pode ver que o horário foi aceito.");
    } else {
        mostrarAviso("Agendamento recusado", "A cliente verá que o pedido foi recusado.");
    }
}


// ---------- Montar a lista na tela ----------

// Cria uma linha "Rótulo: valor" só se o valor existir
function linha(rotulo, valor) {
    if (!valor) {
        return "";
    }
    return "<p><b>" + rotulo + ":</b> " + valor + "</p>";
}

function montarCartao(r) {
    let textoStatus = "Confirmado";
    if (r.status == "pendente") textoStatus = "Aguardando confirmação";
    if (r.status == "recusado") textoStatus = "Recusado";

    let quando = formatarData(r.data);
    if (r.horario) {
        quando = quando + " às " + r.horario;
    }

    let html = "<div class='cartao " + r.status + "'>";

    html += "<div class='cartao-topo'>";
    html += "<h3>" + r.nome + "</h3>";
    html += "<span class='etiqueta'>" + r.procedimento + "</span>";
    html += "</div>";

    html += "<p class='status'>" + textoStatus + "</p>";
    html += linha("Data", quando);

    // Ficha de coloração
    if (r.marca || r.cor || r.aditivos) {
        html += "<div class='detalhe'>";
        html += linha("Marca", r.marca);
        html += linha("Cor", r.cor);
        html += linha("Aditivos", r.aditivos);
        html += "</div>";
    }

    // Ficha de mechas
    if (r.tecnica || r.ox || r.po || r.matizador) {
        html += "<div class='detalhe'>";
        html += linha("Técnica", r.tecnica);
        html += linha("OX", r.ox);
        html += linha("Pó", r.po);
        html += linha("Matizador", r.matizador);
        html += "</div>";
    }

    html += linha("Observações", r.detalhes);

    if (r.valor) {
        html += "<p class='valor'>R$ " + r.valor.replace(".", ",") + "</p>";
    }

    // Botões só para o admin em pedidos pendentes
    if (usuario == "admin" && r.status == "pendente") {
        html += "<div class='botoes'>";
        html += "<button class='btn' onclick='mudarStatus(" + r.id + ", \"confirmado\")'>Aceitar</button>";
        html += "<button class='btn btn-contorno' onclick='mudarStatus(" + r.id + ", \"recusado\")'>Recusar</button>";
        html += "</div>";
    }

    html += "</div>";
    return html;
}

function mostrarLista() {
    let html = "";

    // Percorre de trás para frente para mostrar os mais novos primeiro
    for (let i = registros.length - 1; i >= 0; i--) {
        let r = registros[i];

        // A cliente só vê os agendamentos, não as fichas internas do salão
        if (usuario == "cliente" && r.origem != "cliente") {
            continue;
        }

        html += montarCartao(r);
    }

    if (html == "") {
        html = "<p class='vazio'>Nenhum registro por enquanto.</p>";
    }

    document.getElementById("lista").innerHTML = html;
}


// ---------- Ligando os botões ----------

document.getElementById("form-login").addEventListener("submit", fazerLogin);
document.getElementById("btn-sair").addEventListener("click", sair);
document.getElementById("btn-fechar-modal").addEventListener("click", fecharAviso);
document.getElementById("admin-procedimento").addEventListener("change", trocarFicha);
document.getElementById("form-admin").addEventListener("submit", salvarFichaAdmin);
document.getElementById("form-cliente").addEventListener("submit", salvarAgendamento);

// A cliente não consegue escolher um dia que já passou
document.getElementById("cliente-data").min = dataDeHoje();
