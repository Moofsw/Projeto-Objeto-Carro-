// Vehicle Class
class Vehicle {
  constructor(modelo, cor) {
      this.modelo = modelo;
      this.cor = cor;
      this.ligado = false;
      this.velocidade = 0;
  }

  ligar() {
      this.ligado = true;
      return `${this.modelo} ligado.`;
  }

  desligar() {
      this.ligado = false;
      this.velocidade = 0;
      return `${this.modelo} desligado.`;
  }

  acelerar(incremento) {
      if (this.ligado) {
          this.velocidade += incremento;
          return `${this.modelo} acelerou para ${this.velocidade} km/h.`;
      } else {
          return `${this.modelo} precisa estar ligado para acelerar.`;
      }
  }

  frear(decremento) {
      this.velocidade = Math.max(0, this.velocidade - decremento);
      return `${this.modelo} freou para ${this.velocidade} km/h.`;
  }

  exibirInformacoes() {
      return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
  }

  interagir() {
      return `Interagindo com um veículo genérico.`;
  }
}

// Car Class (inherits from Vehicle)
class Car extends Vehicle {
  constructor(modelo, cor, numeroPortas) {
      super(modelo, cor);
      this.numeroPortas = numeroPortas;
  }

  exibirInformacoes() {
      return `${super.exibirInformacoes()}, Número de Portas: ${this.numeroPortas}`;
  }

  interagir() {
      return `Interagindo com um carro: ${this.modelo}.`;
  }
}

// CarroEsportivo Class (inherits from Car)
class CarroEsportivo extends Car {
  constructor(modelo, cor) {
      super(modelo, cor, 2);
      this.turboAtivado = false;
  }

  ativarTurbo() {
      this.turboAtivado = true;
      return 'Turbo ativado!';
  }

  desativarTurbo() {
      this.turboAtivado = false;
      return 'Turbo desativado.';
  }

  exibirInformacoes() {
      return `${super.exibirInformacoes()}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
  }

  interagir() {
      return `Interagindo com um carro esportivo: ${this.modelo} com turbo ${this.turboAtivado ? 'ativado' : 'desativado'}.`;
  }
}

// Caminhao Class (inherits from Vehicle)
class Caminhao extends Vehicle {
  constructor(modelo, cor, capacidadeCarga) {
      super(modelo, cor);
      this.capacidadeCarga = capacidadeCarga;
      this.cargaAtual = 0;
  }

  carregar(quantidade) {
      if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
          this.cargaAtual += quantidade;
          return `Caminhão carregado. Carga atual: ${this.cargaAtual} kg.`;
      } else {
          return `Capacidade máxima excedida. Carga atual: ${this.cargaAtual} kg, Capacidade máxima: ${this.capacidadeCarga} kg.`;
      }
  }

  descarregar(quantidade) {
      this.cargaAtual = Math.max(0, this.cargaAtual - quantidade);
      return `Caminhão descarregado. Carga atual: ${this.cargaAtual} kg.`;
  }

  exibirInformacoes() {
      return `${super.exibirInformacoes()}, Capacidade de Carga: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
  }

  interagir() {
      return `Interagindo com um caminhão: ${this.modelo} com carga atual de ${this.cargaAtual} kg.`;
  }
}

// Global Variables
let meuCarroEsportivo;
let meuCaminhao;

// Helper Functions
function displayAlert(message) {
  alert(message);
}

function displayFeedback(elementId, message, color) {
  const element = document.getElementById(elementId);
  element.textContent = message;
  element.style.color = color;
}

function playSound(elementId) {
  const element = document.getElementById(elementId);
  element.currentTime = 0;
  element.play();
}

// Function to update the car image
function updateCarImage(modelo, imagemId) {
  const imagemElement = document.getElementById(imagemId);
  const imageName = modelo.toLowerCase().replace('Imagens/carro-png.webp', 'Imagens/carro-png.webp');
  const imagePath = `images/${imageName}.jpg`;

  imagemElement.src = Imagens/carro-imagem.webp;
  imagemElement.onerror = () => {
      imagemElement.src = 'Imagens/carro-png.webp';
  };
}

// Carro Esportivo Functions
function criarCarroEsportivo() {
  const modelo = document.getElementById('modeloEsportivo').value;
  const cor = document.getElementById('corEsportivo').value;
  meuCarroEsportivo = new CarroEsportivo(modelo, cor);
  displayFeedback('statusCarroEsportivo', `Carro Esportivo ${modelo} criado!`, 'green');
  updateCarImage(modelo, 'imagemCarroEsportivo');
}

function ligarCarroEsportivo() {
  if (meuCarroEsportivo) {
      const message = meuCarroEsportivo.ligar();
      displayFeedback('statusCarroEsportivo', message, 'green');
      playSound('somLigar');
  } else {
      displayAlert('Crie o carro esportivo primeiro!');
  }
}

function desligarCarroEsportivo() {
  if (meuCarroEsportivo) {
      const message = meuCarroEsportivo.desligar();
      displayFeedback('statusCarroEsportivo', message, 'red');
      playSound('somDesligar');
  } else {
      displayAlert('Crie o carro esportivo primeiro!');
  }
}

function acelerarCarroEsportivo() {
  if (meuCarroEsportivo) {
      const message = meuCarroEsportivo.acelerar(10);
      displayFeedback('statusCarroEsportivo', message, 'blue');
      playSound('somAcelerar');
  } else {
      displayAlert('Crie o carro esportivo primeiro!');
  }
}

function frearCarroEsportivo() {
  if (meuCarroEsportivo) {
      const message = meuCarroEsportivo.frear(5);
      displayFeedback('statusCarroEsportivo', message, 'orange');
      playSound('somFrear');
  } else {
      displayAlert('Crie o carro esportivo primeiro!');
  }
}

function ativarTurbo() {
  if (meuCarroEsportivo) {
      const message = meuCarroEsportivo.ativarTurbo();
      displayFeedback('statusCarroEsportivo', message, 'purple');
      playSound('somAcelerar'); // Or a turbo sound
  } else {
      displayAlert('Crie o carro esportivo primeiro!');
  }
}

function desativarTurbo() {
  if (meuCarroEsportivo) {
      const message = meuCarroEsportivo.desativarTurbo();
      displayFeedback('statusCarroEsportivo', message, 'gray');
  } else {
      displayAlert('Crie o carro esportivo primeiro!');
  }
}

// Caminhao Functions
function criarCaminhao() {
  const modelo = document.getElementById('modeloCaminhao').value;
  const cor = document.getElementById('corCaminhao').value;
  const capacidadeCarga = parseFloat(document.getElementById('capacidadeCaminhao').value);
  meuCaminhao = new Caminhao(modelo, cor, capacidadeCarga);
  displayFeedback('statusCaminhao', `Caminhão ${modelo} criado!`, 'green');
  updateCarImage(modelo, 'imagemCaminhao');
}

function ligarCaminhao() {
  if (meuCaminhao) {
      const message = meuCaminhao.ligar();
      displayFeedback('statusCaminhao', message, 'green');
      playSound('somLigar');
  } else {
      displayAlert('Crie o caminhão primeiro!');
  }
}

function desligarCaminhao() {
  if (meuCaminhao) {
      const message = meuCaminhao.desligar();
      displayFeedback('statusCaminhao', message, 'red');
      playSound('somDesligar');
  } else {
      displayAlert('Crie o caminhão primeiro!');
  }
}

function acelerarCaminhao() {
  if (meuCaminhao) {
      const message = meuCaminhao.acelerar(5);
      displayFeedback('statusCaminhao', message, 'blue');
      playSound('somAcelerar');
  } else {
      displayAlert('Crie o caminhão primeiro!');
  }
}

function frearCaminhao() {
  if (meuCaminhao) {
      const message = meuCaminhao.frear(2);
      displayFeedback('statusCaminhao', message, 'orange');
      playSound('somFrear');
  } else {
      displayAlert('Crie o caminhão primeiro!');
  }
}

function carregarCaminhao() {
  if (meuCaminhao) {
      const quantidade = parseFloat(document.getElementById('quantidadeCarga').value);
      const message = meuCaminhao.carregar(quantidade);
      displayFeedback('statusCaminhao', message, 'black');
  } else {
      displayAlert('Crie o caminhão primeiro!');
  }
}

function descarregarCaminhao() {
  if (meuCaminhao) {
      const quantidade = parseFloat(document.getElementById('quantidadeCarga').value);
      const message = meuCaminhao.descarregar(quantidade);
      displayFeedback('statusCaminhao', message, 'black');
  } else {
      displayAlert('Crie o caminhão primeiro!');
  }
}

// Information and Interaction Functions
function exibirInfoCarroEsportivo() {
  if (meuCarroEsportivo) {
      document.getElementById('informacoesVeiculo').textContent = meuCarroEsportivo.exibirInformacoes();
  } else {
      document.getElementById('informacoesVeiculo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

function exibirInfoCaminhao() {
  if (meuCaminhao) {
      document.getElementById('informacoesVeiculo').textContent = meuCaminhao.exibirInformacoes();
  } else {
      document.getElementById('informacoesVeiculo').textContent = 'Crie o caminhão primeiro!';
  }
}

function interagirComCarroEsportivo() {
  if (meuCarroEsportivo) {
      document.getElementById('interacaoVeiculo').textContent = meuCarroEsportivo.interagir();
  } else {
      document.getElementById('interacaoVeiculo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

function interagirComCaminhao() {
  if (meuCaminhao) {
      document.getElementById('interacaoVeiculo').textContent = meuCaminhao.interagir();
  } else {
      document.getElementById('interacaoVeiculo').textContent = 'Crie o caminhão primeiro!';
  }
}

// Event Listeners

document.addEventListener('DOMContentLoaded', () => {
  // Carro Esportivo Event Listeners
  document.getElementById('criarCarroEsportivoBtn').addEventListener('click', criarCarroEsportivo);
  document.getElementById('ligarCarroEsportivoBtn').addEventListener('click', ligarCarroEsportivo);
  document.getElementById('desligarCarroEsportivoBtn').addEventListener('click', desligarCarroEsportivo);
  document.getElementById('acelerarCarroEsportivoBtn').addEventListener('click', acelerarCarroEsportivo);
  document.getElementById('frearCarroEsportivoBtn').addEventListener('click', frearCarroEsportivo);
  document.getElementById('ativarTurboBtn').addEventListener('click', ativarTurbo);
  document.getElementById('desativarTurboBtn').addEventListener('click', desativarTurbo);

  // Caminhao Event Listeners
  document.getElementById('criarCaminhaoBtn').addEventListener('click', criarCaminhao);
  document.getElementById('ligarCaminhaoBtn').addEventListener('click', ligarCaminhao);
  document.getElementById('desligarCaminhaoBtn').addEventListener('click', desligarCaminhao);
  document.getElementById('acelerarCaminhaoBtn').addEventListener('click', acelerarCaminhao);
  document.getElementById('frearCaminhaoBtn').addEventListener('click', frearCaminhao);
  document.getElementById('carregarCaminhaoBtn').addEventListener('click', carregarCaminhao);
  document.getElementById('descarregarCaminhaoBtn').addEventListener('click', descarregarCaminhao);

  // Information and Interaction Event Listeners
  document.getElementById('exibirInfoCarroEsportivoBtn').addEventListener('click', exibirInfoCarroEsportivo);
  document.getElementById('exibirInfoCaminhaoBtn').addEventListener('click', exibirInfoCaminhao);
  document.getElementById('interagirComCarroEsportivoBtn').addEventListener('click', interagirComCarroEsportivo);
  document.getElementById('interagirComCaminhaoBtn').addEventListener('click', interagirComCaminhao);
});