// Definição da Classe Carro
class Carro {
    constructor(modelo, cor) {
      this.modelo = modelo;
      this.cor = cor;
      this.ligado = false;
      this.velocidade = 0;
    }
  
    ligar() {
      this.ligado = true;
      console.log("Carro ligado!");
    }
  
    desligar() {
      this.ligado = false;
      this.velocidade = 0;
      console.log("Carro desligado!");
    }
  
    acelerar(incremento) {
      if (this.ligado) {
        this.velocidade += incremento;
        console.log(`Acelerando para ${this.velocidade} km/h`);
      } else {
        console.log("O carro precisa estar ligado para acelerar!");
      }
    }
  
    frear(decremento) {
      if (this.velocidade > 0) {
        this.velocidade -= decremento;
        console.log(`Freando para ${this.velocidade} km/h`);
      } else {
        console.log("O carro já está parado!");
      }
    }
  
    exibirStatus() {
      return `Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado}, Velocidade: ${this.velocidade} km/h`;
    }
  }

  class CarroEsportivo extends Carro {
    constructor(modelo, cor) {
      super(modelo, cor); // Chama o construtor da classe pai (Carro)
      this.turboAtivado = false;
    }
  
    ativarTurbo() {
      if (this.ligado) {
        this.turboAtivado = true;
        this.velocidade += 50; // Aumenta a velocidade com o turbo
        console.log("Turbo ativado! Acelerando!");
      } else {
        console.log("O carro precisa estar ligado para ativar o turbo!");
      }
    }
  
    desativarTurbo() {
        this.turboAtivado = false;
        console.log("Turbo desativado!");
    }
  
    exibirStatus() {
      return super.exibirStatus() + `, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
    }
  }

  class Caminhao extends Carro {
    constructor(modelo, cor, capacidadeCarga) {
      super(modelo, cor);
      this.capacidadeCarga = capacidadeCarga;
      this.cargaAtual = 0;
    }
  
    carregar(quantidade) {
      if (this.cargaAtual + quantidade <= this.capacidadeCarga) {
        this.cargaAtual += quantidade;
        console.log(`Caminhão carregado com ${quantidade} kg. Carga atual: ${this.cargaAtual} kg`);
      } else {
        console.log("Capacidade máxima excedida!");
      }
    }
  
    descarregar(quantidade) {
      if (this.cargaAtual - quantidade >= 0) {
        this.cargaAtual -= quantidade;
        console.log(`Caminhão descarregado com ${quantidade} kg. Carga atual: ${this.cargaAtual} kg`);
      } else {
        console.log("Não é possível descarregar mais do que a carga atual.");
      }
    }
  
    exibirStatus() {
      return super.exibirStatus() + `, Carga: ${this.cargaAtual} kg / ${this.capacidadeCarga} kg`;
    }
  }

  // Variáveis globais para armazenar os objetos
let carroEsportivo;
let caminhao;

// Funções para o Carro Esportivo
function criarCarroEsportivo() {
  const modelo = document.getElementById("modeloEsportivo").value;
  const cor = document.getElementById("corEsportivo").value;
  carroEsportivo = new CarroEsportivo(modelo, cor);
  atualizarStatusCarroEsportivo();
}

function ligarCarroEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.ligar();
    atualizarStatusCarroEsportivo();
  }
}

function desligarCarroEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.desligar();
    atualizarStatusCarroEsportivo();
  }
}

function acelerarCarroEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.acelerar(10); // Incremento de 10 km/h
    atualizarStatusCarroEsportivo();
  }
}

function frearCarroEsportivo() {
  if (carroEsportivo) {
    carroEsportivo.frear(5); // Decremento de 5 km/h
    atualizarStatusCarroEsportivo();
  }
}

function ativarTurbo() {
  if (carroEsportivo) {
    carroEsportivo.ativarTurbo();
    atualizarStatusCarroEsportivo();
  }
}

function desativarTurbo() {
  if (carroEsportivo) {
    carroEsportivo.desativarTurbo();
    atualizarStatusCarroEsportivo();
  }
}

function atualizarStatusCarroEsportivo() {
  if (carroEsportivo) {
    document.getElementById("statusCarroEsportivo").textContent = carroEsportivo.exibirStatus();
  } else {
    document.getElementById("statusCarroEsportivo").textContent = "Nenhum carro esportivo criado.";
  }
}

// Funções para o Caminhão
function criarCaminhao() {
  const modelo = document.getElementById("modeloCaminhao").value;
  const cor = document.getElementById("corCaminhao").value;
  const capacidadeCarga = parseInt(document.getElementById("capacidadeCaminhao").value);
  caminhao = new Caminhao(modelo, cor, capacidadeCarga);
  atualizarStatusCaminhao();
}

function ligarCaminhao() {
  if (caminhao) {
    caminhao.ligar();
    atualizarStatusCaminhao();
  }
}

function desligarCaminhao() {
  if (caminhao) {
    caminhao.desligar();
    atualizarStatusCaminhao();
  }
}

function acelerarCaminhao() {
  if (caminhao) {
    caminhao.acelerar(5); // Incremento de 5 km/h
    atualizarStatusCaminhao();
  }
}

function frearCaminhao() {
  if (caminhao) {
    caminhao.frear(2); // Decremento de 2 km/h
    atualizarStatusCaminhao();
  }
}

function carregarCaminhao() {
  if (caminhao) {
    const quantidade = parseInt(document.getElementById("quantidadeCarga").value);
    caminhao.carregar(quantidade);
    atualizarStatusCaminhao();
  }
}

function descarregarCaminhao() {
  if (caminhao) {
    const quantidade = parseInt(document.getElementById("quantidadeCarga").value);
    caminhao.descarregar(quantidade);
    atualizarStatusCaminhao();
  }
}

function atualizarStatusCaminhao() {
  if (caminhao) {
    document.getElementById("statusCaminhao").textContent = caminhao.exibirStatus();
  } else {
    document.getElementById("statusCaminhao").textContent = "Nenhum caminhão criado.";
  }
}