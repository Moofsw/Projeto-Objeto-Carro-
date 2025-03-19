// Classe Veiculo
class Veiculo {
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

// Classe Carro (Herda de Veiculo)
class Carro extends Veiculo {
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


// Classe CarroEsportivo (Herda de Carro)
class CarroEsportivo extends Carro {
  constructor(modelo, cor) {
    super(modelo, cor, 2); // Carros esportivos tipicamente têm 2 portas
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

// Classe Caminhao (Herda de Veiculo)
class Caminhao extends Veiculo {
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

// Variáveis globais para armazenar os objetos criados
let meuCarro;
let meuCarroEsportivo;
let meuCaminhao;

// Funções para criar os objetos
function criarCarroEsportivo() {
  const modelo = document.getElementById('modeloEsportivo').value;
  const cor = document.getElementById('corEsportivo').value;
  meuCarroEsportivo = new CarroEsportivo(modelo, cor);
  document.getElementById('statusCarroEsportivo').textContent = `Carro Esportivo ${modelo} criado!`;
}

function criarCaminhao() {
  const modelo = document.getElementById('modeloCaminhao').value;
  const cor = document.getElementById('corCaminhao').value;
  const capacidadeCarga = parseFloat(document.getElementById('capacidadeCaminhao').value);
  meuCaminhao = new Caminhao(modelo, cor, capacidadeCarga);
  document.getElementById('statusCaminhao').textContent = `Caminhão ${modelo} criado!`;
}

// Funções para interagir com o Carro Esportivo
function ligarCarroEsportivo() {
  if (meuCarroEsportivo) {
    document.getElementById('statusCarroEsportivo').textContent = meuCarroEsportivo.ligar();
  } else {
    document.getElementById('statusCarroEsportivo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

function desligarCarroEsportivo() {
  if (meuCarroEsportivo) {
    document.getElementById('statusCarroEsportivo').textContent = meuCarroEsportivo.desligar();
  } else {
    document.getElementById('statusCarroEsportivo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

function acelerarCarroEsportivo() {
  if (meuCarroEsportivo) {
    document.getElementById('statusCarroEsportivo').textContent = meuCarroEsportivo.acelerar(10);
  } else {
    document.getElementById('statusCarroEsportivo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

function frearCarroEsportivo() {
  if (meuCarroEsportivo) {
    document.getElementById('statusCarroEsportivo').textContent = meuCarroEsportivo.frear(5);
  } else {
    document.getElementById('statusCarroEsportivo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

function ativarTurbo() {
  if (meuCarroEsportivo) {
    document.getElementById('statusCarroEsportivo').textContent = meuCarroEsportivo.ativarTurbo();
  } else {
    document.getElementById('statusCarroEsportivo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

function desativarTurbo() {
  if (meuCarroEsportivo) {
    document.getElementById('statusCarroEsportivo').textContent = meuCarroEsportivo.desativarTurbo();
  } else {
    document.getElementById('statusCarroEsportivo').textContent = 'Crie o carro esportivo primeiro!';
  }
}

// Funções para interagir com o Caminhão
function ligarCaminhao() {
  if (meuCaminhao) {
    document.getElementById('statusCaminhao').textContent = meuCaminhao.ligar();
  } else {
    document.getElementById('statusCaminhao').textContent = 'Crie o caminhão primeiro!';
  }
}

function desligarCaminhao() {
  if (meuCaminhao) {
    document.getElementById('statusCaminhao').textContent = meuCaminhao.desligar();
  } else {
    document.getElementById('statusCaminhao').textContent = 'Crie o caminhão primeiro!';
  }
}

function acelerarCaminhao() {
  if (meuCaminhao) {
    document.getElementById('statusCaminhao').textContent = meuCaminhao.acelerar(5);
  } else {
    document.getElementById('statusCaminhao').textContent = 'Crie o caminhão primeiro!';
  }
}

function frearCaminhao() {
  if (meuCaminhao) {
    document.getElementById('statusCaminhao').textContent = meuCaminhao.frear(2);
  } else {
    document.getElementById('statusCaminhao').textContent = 'Crie o caminhão primeiro!';
  }
}

function carregarCaminhao() {
  if (meuCaminhao) {
    const quantidade = parseFloat(document.getElementById('quantidadeCarga').value);
    document.getElementById('statusCaminhao').textContent = meuCaminhao.carregar(quantidade);
  } else {
    document.getElementById('statusCaminhao').textContent = 'Crie o caminhão primeiro!';
  }
}

function descarregarCaminhao() {
  if (meuCaminhao) {
    const quantidade = parseFloat(document.getElementById('quantidadeCarga').value);
    document.getElementById('statusCaminhao').textContent = meuCaminhao.descarregar(quantidade);
  } else {
    document.getElementById('statusCaminhao').textContent = 'Crie o caminhão primeiro!';
  }
}

// Funções para exibir informações (Polimorfismo)
function exibirInfoCarro() {
    if (meuCarro) {
        document.getElementById('informacoesVeiculo').textContent = meuCarro.exibirInformacoes();
    } else {
        document.getElementById('informacoesVeiculo').textContent = "Crie um carro primeiro (não implementado no HTML).";
    }
}

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

// Funções para interação polimórfica (Garagem Inteligente)
function interagirComCarro() {
    if (meuCarro) {
        document.getElementById('interacaoVeiculo').textContent = meuCarro.interagir();
    } else {
        document.getElementById('interacaoVeiculo').textContent = "Crie um carro primeiro (não implementado no HTML).";
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

function criarCarroEsportivo() {
  const modelo = document.getElementById('modeloEsportivo').value;
  const cor = document.getElementById('corEsportivo').value;
  meuCarroEsportivo = new CarroEsportivo(modelo, cor);
  document.getElementById('statusCarroEsportivo').textContent = `Carro Esportivo ${modelo} criado!`;

  // Atualiza a imagem do Carro Esportivo
  const imagemCarroEsportivo = document.getElementById('carro-imagem.webp');
  imagemCarroEsportivo.src = `images/${modelo.toLowerCase().replace(' ', '_')}.jpg`; // Ajuste o nome do arquivo conforme necessário
  imagemCarroEsportivo.onerror = function() {  // Caso a imagem não seja encontrada
    imagemCarroEsportivo.src = 'images/placeholder.jpg'; // Use uma imagem placeholder
  };
}

function criarCaminhao() {
  const modelo = document.getElementById('modeloCaminhao').value;
  const cor = document.getElementById('corCaminhao').value;
  const capacidadeCarga = parseFloat(document.getElementById('capacidadeCaminhao').value);
  meuCaminhao = new Caminhao(modelo, cor, capacidadeCarga);
  document.getElementById('statusCaminhao').textContent = `Caminhão ${modelo} criado!`;

  // Atualiza a imagem do Caminhão
  const imagemCaminhao = document.getElementById('imagemCaminhao');
  imagemCaminhao.src = `images/${modelo.toLowerCase().replace(' ', '_')}.jpg`; // Ajuste o nome do arquivo conforme necessário
  imagemCaminhao.onerror = function() {  // Caso a imagem não seja encontrada
    imagemCaminhao.src = 'images/placeholder.jpg'; // Use uma imagem placeholder
  };
}
