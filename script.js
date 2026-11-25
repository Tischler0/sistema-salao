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


// ---------- Pagamento ----------

function pedirFormaPagamento(valorAtual) {
    let dicaAtual = valorAtual ? "\nAtual: " + valorAtual : "";
    let escolha = prompt(
        "Qual foi a forma de pagamento?" + dicaAtual + "\n" +
        "1 - Pix\n" +
        "2 - Cartão de Crédito\n" +
        "3 - Cartão de Débito\n" +
        "4 - Dinheiro\n\n" +
        "Digite o número ou o nome:"
    );

    if (escolha === null) return null;

    let mapa = {
        "1": "Pix",
        "pix": "Pix",
        "2": "Cartão de Crédito",
        "credito": "Cartão de Crédito",
        "crédito": "Cartão de Crédito",
        "cartao de credito": "Cartão de Crédito",
        "cartão de crédito": "Cartão de Crédito",
        "3": "Cartão de Débito",
        "debito": "Cartão de Débito",
        "débito": "Cartão de Débito",
        "cartao de debito": "Cartão de Débito",
        "cartão de débito": "Cartão de Débito",
        "4": "Dinheiro",
        "dinheiro": "Dinheiro"
    };

    let normalizado = escolha.trim().toLowerCase();
    if (!mapa[normalizado]) {
        mostrarAviso("Forma de pagamento inválida", "Digite 1 (Pix), 2 (Crédito), 3 (Débito) ou 4 (Dinheiro).");
        return null;
    }

    return mapa[normalizado];
}


// ---------- Menu de 3 pontinhos (admin) ----------

function fecharMenusOpcoes() {
    document.querySelectorAll(".menu-opcoes-lista.aberto").forEach((menuLista) => {
        menuLista.classList.remove("aberto");
    });
}

function alternarMenuOpcoes(evento, id) {
    evento.stopPropagation();
    let alvo = document.getElementById("menu-opcoes-" + id);
    let jaAberto = alvo && alvo.classList.contains("aberto");

    fecharMenusOpcoes();

    if (alvo && !jaAberto) {
        alvo.classList.add("aberto");
    }
}

document.addEventListener("click", fecharMenusOpcoes);

function editarRegistro(id) {
    fecharMenusOpcoes();

    let indice = registros.findIndex((item) => item.id == id);
    if (indice === -1) return;

    let r = registros[indice];

    let novoProcedimento = prompt(
        "Procedimento:",
        r.procedimento || "Corte"
    );
    if (novoProcedimento === null) return;
    if (novoProcedimento.trim() === "") {
        mostrarAviso("Campo obrigatório", "O procedimento não pode ficar vazio.");
        return;
    }

    let valorAtualStr = r.valor ? String(r.valor).replace(".", ",") : "";
    let novoValorDigitado = prompt("Valor (R$) (deixe vazio se não houver):", valorAtualStr);
    if (novoValorDigitado === null) return;

    let novoValorFormatado = "";
    if (novoValorDigitado.trim() !== "") {
        let numeroValor = Number(novoValorDigitado.trim().replace(",", "."));
        if (isNaN(numeroValor) || numeroValor < 0) {
            mostrarAviso("Valor inválido", "Digite um valor numérico válido.");
            return;
        }
        novoValorFormatado = numeroValor.toFixed(2);
    }

    let alterarPagamento = confirm("Deseja alterar ou informar a forma de pagamento?");
    let novoPagamento = r.pagamento || "";
    if (alterarPagamento) {
        let escolhido = pedirFormaPagamento(r.pagamento || "");
        if (!escolhido) return;
        novoPagamento = escolhido;
    }

    let novasObs = prompt("Observações:", r.detalhes || "");
    if (novasObs === null) return;

    registros[indice].procedimento = novoProcedimento.trim();
    registros[indice].valor = novoValorFormatado;
    registros[indice].pagamento = novoPagamento;
    registros[indice].detalhes = novasObs.trim();

    salvarNoNavegador();
    mostrarLista();
    mostrarAviso("Registro atualizado", "As alterações foram salvas no histórico.");
}

function excluirRegistro(id) {
    fecharMenusOpcoes();

    let confirmar = confirm("Tem certeza que deseja excluir este registro do histórico?");
    if (!confirmar) return;

    registros = registros.filter((item) => item.id != id);
    salvarNoNavegador();
    mostrarLista();
    mostrarAviso("Registro excluído", "O item foi removido do histórico.");
}


// ---------- Salvar ----------

function salvarFichaAdmin(evento) {
    evento.preventDefault();

    let pagamento = pedirFormaPagamento();
    if (!pagamento) return;

    let procedimento = document.getElementById("admin-procedimento").value;

    let ficha = {
        id: Date.now(),
        nome: document.getElementById("admin-nome").value,
        procedimento: procedimento,
        data: document.getElementById("admin-data").value,
        horario: "",
        valor: Number(document.getElementById("admin-valor").value).toFixed(2),
        pagamento: pagamento,
        detalhes: document.getElementById("admin-detalhes").value,
        origem: "admin",
        status: "concluido"
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
    mostrarAviso("Ficha salva", "Procedimento registrado (" + pagamento + ").");
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


// ---------- Aceitar / recusar / concluir procedimento (admin) ----------

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

function concluirProcedimento(id) {
    let valorDigitado = prompt("Digite o valor cobrado pelo procedimento (ex: 50.00 ou 50,00):");
    if (valorDigitado === null) return;

    let valorLimpo = valorDigitado.trim().replace(",", ".");
    let numeroValor = Number(valorLimpo);

    if (valorLimpo === "" || isNaN(numeroValor) || numeroValor < 0) {
        mostrarAviso("Valor inválido", "Informe um valor numérico válido para confirmar o procedimento.");
        return;
    }

    let pagamento = pedirFormaPagamento();
    if (!pagamento) return;

    let obsExtra = prompt("Observações do atendimento (opcional):");
    let dataConclusao = dataDeHoje();

    for (let i = 0; i < registros.length; i++) {
        if (registros[i].id == id) {
            registros[i].status = "concluido";
            registros[i].valor = numeroValor.toFixed(2);
            registros[i].pagamento = pagamento;
            registros[i].concluidoEm = dataConclusao;
            if (obsExtra && obsExtra.trim() !== "") {
                registros[i].detalhes = registros[i].detalhes
                    ? registros[i].detalhes + " | " + obsExtra.trim()
                    : obsExtra.trim();
            }
        }
    }

    salvarNoNavegador();
    mostrarLista();
    mostrarAviso(
        "Procedimento concluído",
        "Valor R$ " + numeroValor.toFixed(2).replace(".", ",") + " (" + pagamento + ") lançado no histórico."
    );
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
    if (r.status == "concluido") textoStatus = "Procedimento realizado";

    let quando = formatarData(r.data);
    if (r.horario) {
        quando = quando + " às " + r.horario;
    }

    let html = "<div class='cartao " + r.status + "'>";

    html += "<div class='cartao-topo'>";
    html += "<h3>" + r.nome + "</h3>";
    html += "<div class='cartao-topo-acoes'>";
    html += "<span class='etiqueta'>" + r.procedimento + "</span>";

    if (usuario == "admin") {
        html += "<div class='menu-opcoes'>";
        html += "<button type='button' class='btn-pontinhos' aria-label='Opções do registro' onclick='alternarMenuOpcoes(event, " + r.id + ")'>&#8942;</button>";
        html += "<div id='menu-opcoes-" + r.id + "' class='menu-opcoes-lista'>";
        html += "<button type='button' onclick='editarRegistro(" + r.id + ")'>Editar histórico</button>";
        html += "<button type='button' class='perigo' onclick='excluirRegistro(" + r.id + ")'>Excluir</button>";
        html += "</div>";
        html += "</div>";
    }

    html += "</div>";
    html += "</div>";

    html += "<p class='status'>" + textoStatus + "</p>";
    html += linha("Data", quando);

    if (r.concluidoEm) {
        html += linha("Confirmado em", formatarData(r.concluidoEm));
    }

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
        html += "<p class='valor'>R$ " + String(r.valor).replace(".", ",") + "</p>";
    }

    html += linha("Pagamento", r.pagamento);

    // Botões só para o admin
    if (usuario == "admin" && r.status == "pendente") {
        html += "<div class='botoes'>";
        html += "<button class='btn' onclick='mudarStatus(" + r.id + ", \"confirmado\")'>Aceitar</button>";
        html += "<button class='btn btn-contorno' onclick='mudarStatus(" + r.id + ", \"recusado\")'>Recusar</button>";
        html += "</div>";
    }

    if (usuario == "admin" && r.status == "confirmado") {
        html += "<div class='botoes'>";
        html += "<button class='btn' onclick='concluirProcedimento(" + r.id + ")'>Confirmar procedimento feito</button>";
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