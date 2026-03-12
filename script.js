// ===============================
// CLASSE USUARIO
// ===============================
class Usuario {
  // Construtor mais limpo, apenas com o essencial
  constructor(nome, idade, foto) {
    this.nome = nome;
    this.idade = Number(idade); // Garante que a idade seja número
    this.foto = foto;
  }

  // Gera o HTML do card, agora sem o mapa
  gerarCard(index) {
    return `
      <div class="card">
        <img src="${this.foto}" alt="Foto de ${this.nome}">
        <h3>${this.nome}</h3>
        <p>${this.idade} anos</p>
       
        <div style="margin-top: 10px; display: flex; gap: 5px; justify-content: center;">
          <button class="btn-warning" onclick="editar(${index})">Editar</button>
          <button class="btn-danger" onclick="excluir(${index})">Excluir</button>
        </div>
      </div>
    `;
  }
}

// ===============================
// VARIÁVEIS GLOBAIS
// ===============================
let usuarios = [];
let fotoAtual = "";
let editandoId = null; // Controla se estamos em modo de edição

// ===============================
// CÂMERA
// ===============================
function ativarCamera() {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => { document.getElementById("video").srcObject = stream; })
    .catch(() => { alert("Permissão de câmera negada."); });
}

function capturarFoto() {
  let video = document.getElementById("video");
  let canvas = document.getElementById("canvas");
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  fotoAtual = canvas.toDataURL("image/png");
  document.getElementById("dragArea").innerHTML = `<img src="${fotoAtual}" width="100">`;
}

// ===============================
// PERSISTÊNCIA - LOCALSTORAGE
// ===============================
function salvarNoStorage() {
  localStorage.setItem("usuarios_db", JSON.stringify(usuarios));
}

function carregarDoStorage() {
  let dados = localStorage.getItem("usuarios_db");
  if (dados) {
    let arrayPuro = JSON.parse(dados);
    // Recria os objetos da classe Usuario
    usuarios = arrayPuro.map(u => new Usuario(u.nome, u.idade, u.foto));
  }
  atualizarLista();
}

// ===============================
// CADASTRO E EDIÇÃO
// ===============================
function cadastrar() {
  let nome = document.getElementById("nome").value;
  let idade = document.getElementById("idade").value;

  // Validação simplificada
  if(!nome || !idade || !fotoAtual){
    alert("Preencha o nome, idade e capture uma foto!"); return;
  }

  if (editandoId !== null) {
    // Atualiza o usuário existente usando .map()
    usuarios = usuarios.map((user, index) => {
      if (index === editandoId) {
        return new Usuario(nome, idade, fotoAtual);
      }
      return user;
    });
    editandoId = null;
    document.getElementById("btnSalvar").innerText = "Salvar Cadastro";
  } else {
    // Cria novo usuário
    let novoUsuario = new Usuario(nome, idade, fotoAtual);
    usuarios.push(novoUsuario);
  }

  salvarNoStorage();
  atualizarLista();
  limparFormulario();
}

function limparFormulario() {
  document.getElementById("nome").value = "";
  document.getElementById("idade").value = "";
  fotoAtual = "";
  document.getElementById("dragArea").innerHTML = "Arraste a foto capturada aqui";
}

// ===============================
// FUNCIONALIDADES (EDITAR, EXCLUIR, ORDENAR, FILTRAR)
// ===============================

function editar(index) {
  let user = usuarios[index];
  document.getElementById("nome").value = user.nome;
  document.getElementById("idade").value = user.idade;
  fotoAtual = user.foto;
  document.getElementById("dragArea").innerHTML = `<img src="${fotoAtual}" width="100">`;
 
  editandoId = index;
  document.getElementById("btnSalvar").innerText = "Atualizar Usuário";
  window.scrollTo(0, 0);
}

function excluir(index) {
  if(confirm("Deseja realmente excluir este usuário?")) {
    usuarios.splice(index, 1);
    salvarNoStorage();
    atualizarLista();
  }
}

function ordenarPorIdade() {
  usuarios.sort((a, b) => a.idade - b.idade);
  atualizarLista();
}

function filtrarPorNome() {
  let termoBusca = document.getElementById("filtroNome").value.toLowerCase();
  let listaFiltrada = usuarios.filter(user => user.nome.toLowerCase().includes(termoBusca));
  atualizarLista(listaFiltrada);
}

function limparTodos() {
  if(confirm("CUIDADO! Deseja apagar TODOS os registros?")) {
    usuarios = [];
    salvarNoStorage();
    atualizarLista();
  }
}

function alternarTema() {
  document.body.classList.toggle("dark-theme");
  let temaAtual = document.body.classList.contains("dark-theme") ? "dark" : "light";
  localStorage.setItem("tema_app", temaAtual);
}

function carregarTema() {
  if(localStorage.getItem("tema_app") === "dark") {
    document.body.classList.add("dark-theme");
  }
}

// ===============================
// RENDERIZAÇÃO E CONTADOR
// ===============================
function atualizarLista(lista = usuarios) {
  let divLista = document.getElementById("listaUsuarios");
  divLista.innerHTML = "";

  lista.forEach((u, index) => {
    divLista.innerHTML += u.gerarCard(index);
  });

  document.getElementById("contadorUsuarios").innerText = `Total de cadastrados: ${lista.length}`;
}

// ===============================
// INICIALIZAÇÃO
// ===============================
carregarTema();
carregarDoStorage();