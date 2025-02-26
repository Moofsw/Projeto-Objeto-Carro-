// Definição da Classe Carro
class Carro {
    constructor(modelo, cor) {
        this.modelo = modelo;
        this.cor = cor;
        this.velocidade = 0;
        this.ligado = false;
        this.somAceleracao = new Audio("Car Accelerating - Sound Effect.mp3");
        this.atualizarStatusNaTela();
    }

    ligar() {
        if (!this.ligado) {
            this.ligado = true;
            this.atualizarStatusNaTela();
            console.log("Carro ligado!");
        } else {
            console.log("O carro já está ligado.");
        }
    }

    desligar() {
        if (this.ligado) {
            this.ligado = false;
            this.velocidade = 0;
            this.atualizarVelocidadeNaTela();
            this.atualizarStatusNaTela();
            console.log("Carro desligado!");
        } else {
            console.log("O carro já está desligado.");
        }
    }

    acelerar(incremento) {
        if (this.ligado) {
            this.velocidade += incremento;
            this.atualizarVelocidadeNaTela();
            console.log("Acelerando... Velocidade atual: " + this.velocidade + " km/h");
            this.tocarSomAceleracao();
        } else {
            console.log("O carro precisa estar ligado para acelerar.");
        }
    }

    atualizarVelocidadeNaTela() {
        document.getElementById("velocidade").textContent = this.velocidade;
    }

    tocarSomAceleracao() {
        this.somAceleracao.currentTime = 0;
        this.somAceleracao.play();
    }

    atualizarStatusNaTela() {
        const statusElement = document.getElementById("status");
        statusElement.textContent = this.ligado ? "Ligado" : "Desligado";

        // Adiciona ou remove as classes CSS
        if (this.ligado) {
            statusElement.classList.add("ligado");
            statusElement.classList.remove("desligado");
        } else {
            statusElement.classList.add("desligado");
            statusElement.classList.remove("ligado");
        }
    }
}

// Criação de um Objeto Carro
const meuCarro = new Carro("Sedan", "Vermelho");

// Manipulação dos Botões
document.getElementById("ligar").addEventListener("click", function() {
    meuCarro.ligar();
});

document.getElementById("desligar").addEventListener("click", function() {
    meuCarro.desligar();
});

document.getElementById("acelerar").addEventListener("click", function() {
    meuCarro.acelerar(10); // Acelera em 10 km/h a cada clique
});