// script.js

// --- CLASSES ---

// Vehicle Class - Optional: Make methods slightly more robust
class Vehicle {
    constructor(modelo, cor, id = null) {
        this.id = id || `veh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
        this.historicoManutencao = [];
        this._tipoVeiculo = "Veiculo";
    }

    ligar() {
        if (this.ligado) return `${this.modelo} já está ligado.`;
        this.ligado = true;
        return `${this.modelo} ligado.`;
    }

    desligar() {
        if (!this.ligado) return `${this.modelo} já está desligado.`;
        this.ligado = false;
        this.velocidade = 0; // Reset speed when turned off
        return `${this.modelo} desligado.`;
    }

    acelerar(incremento) {
        const incValue = parseFloat(incremento);
        if (isNaN(incValue) || incValue <= 0) { // Increment must be positive
             console.warn(`[acelerar] Incremento inválido ou não positivo (${incremento}).`);
             return `${this.modelo} - Valor de aceleração inválido: ${incremento}`;
        }

        if (this.ligado) {
            this.velocidade += incValue;
            return `${this.modelo} acelerou para ${this.velocidade} km/h.`;
        } else {
            return `${this.modelo} precisa estar ligado para acelerar.`;
        }
    }

    frear(decremento) {
        const decValue = parseFloat(decremento);
        if (isNaN(decValue) || decValue <= 0) { // Decrement must be positive
            console.warn(`[frear] Decremento inválido ou não positivo (${decremento}).`);
             return `${this.modelo} - Valor de frenagem inválido: ${decremento}`;
        }
        // Speed cannot go below 0
        this.velocidade = Math.max(0, this.velocidade - decValue);
        return `${this.modelo} freou para ${this.velocidade} km/h.`;
    }

    adicionarManutencao(manutencaoObj) {
        // Ensure Manutencao class is available (might need explicit check if not using modules/bundlers)
        if (typeof Manutencao === 'undefined' || !(manutencaoObj instanceof Manutencao)) {
            console.error("Objeto inválido ou classe Manutencao não definida. Apenas instâncias de Manutencao podem ser adicionadas.");
            displayAlert("Erro: Objeto de manutenção inválido.", "error");
            return false;
        }
        if (!manutencaoObj.veiculoId) {
             manutencaoObj.veiculoId = this.id;
        } else if (manutencaoObj.veiculoId !== this.id) {
            console.warn(`Manutenção ${manutencaoObj.id} (Veículo ${manutencaoObj.veiculoId}) sendo adicionada ao histórico do veículo ${this.id}.`);
            // Decide if this is allowed or should be an error
        }

        this.historicoManutencao.push(manutencaoObj);
        this.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data));
        console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencaoObj.formatar()}`);
        return true;
    }

    getHistoricoFormatado() {
        if (!this.historicoManutencao || this.historicoManutencao.length === 0) {
            return "<li>Nenhum registro de manutenção.</li>"; // Return as LI for consistency
        }
        // Ensure all items are valid Manutencao objects before formatting
        return this.historicoManutencao
                 .filter(m => m instanceof Manutencao) // Extra safety check
                 .map(m => `<li>${m.formatar()}</li>`).join('');
    }

    exibirInformacoesBase() {
         // Added vehicle type for clarity
         return `Tipo: ${this._tipoVeiculo}, ID: ${this.id}, Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade} km/h`;
    }

    exibirInformacoes() {
        return this.exibirInformacoesBase();
    }

    interagir() {
        return `Interagindo com ${this._tipoVeiculo.toLowerCase()}: ${this.modelo}.`;
    }

    toJSON() {
        return {
            id: this.id,
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            velocidade: this.velocidade,
            // Ensure historico has valid objects before calling toJSON on them
            historicoManutencao: this.historicoManutencao
                                     .filter(m => m instanceof Manutencao && typeof m.toJSON === 'function')
                                     .map(m => m.toJSON()),
            _tipoVeiculo: this._tipoVeiculo
        };
    }

     static fromJSON(data) {
        if (!data || !data._tipoVeiculo || typeof Manutencao?.fromJSON !== 'function') {
             console.error("Dados inválidos ou classe Manutencao/fromJSON não disponível para reconstrução do Veículo.", data);
             return null;
        }

        let vehicle = null;
        try {
            switch (data._tipoVeiculo) {
                case 'CarroEsportivo':
                    vehicle = new CarroEsportivo(data.modelo, data.cor, data.id);
                     if (typeof data.turboAtivado !== 'undefined') {
                        vehicle.turboAtivado = data.turboAtivado;
                     }
                    break;
                case 'Caminhao':
                    vehicle = new Caminhao(data.modelo, data.cor, data.capacidadeCarga || 0, data.id);
                     if (typeof data.cargaAtual !== 'undefined') {
                        vehicle.cargaAtual = data.cargaAtual;
                     }
                    break;
                case 'Veiculo':
                default:
                    vehicle = new Vehicle(data.modelo, data.cor, data.id);
                    break;
            }

            // Restore common properties carefully
            vehicle.ligado = typeof data.ligado === 'boolean' ? data.ligado : false;
            vehicle.velocidade = typeof data.velocidade === 'number' ? data.velocidade : 0;

            // Reconstruct Manutencao objects, checking array existence and type
            if (data.historicoManutencao && Array.isArray(data.historicoManutencao)) {
                vehicle.historicoManutencao = data.historicoManutencao
                    .map(m_data => Manutencao.fromJSON(m_data)) // Use Manutencao's static method
                    .filter(m => m !== null); // Filter out any nulls if reconstruction failed
                vehicle.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data));
            } else {
                 vehicle.historicoManutencao = [];
            }
            return vehicle;

        } catch (error) {
             console.error(`Erro ao reconstruir veículo tipo '${data._tipoVeiculo}' a partir de JSON:`, error, data);
             return null; // Return null if any error occurs during reconstruction
        }
    }
}

// CarroEsportivo Class
class CarroEsportivo extends Vehicle {
    constructor(modelo, cor, id = null) {
        super(modelo, cor, id);
        this.turboAtivado = false;
        this._tipoVeiculo = "CarroEsportivo";
    }

    ativarTurbo() {
        if (!this.ligado) return `${this.modelo} precisa estar ligado para ativar o turbo.`;
        if (this.turboAtivado) return `${this.modelo} turbo já está ativado.`;
        this.turboAtivado = true;
        // Maybe add a speed boost?
        // this.acelerar(20); // Example: Turbo gives an extra boost
        return 'Turbo ativado!';
    }

    desativarTurbo() {
        if (!this.turboAtivado) return `${this.modelo} turbo já está desativado.`;
        this.turboAtivado = false;
        return 'Turbo desativado.';
    }

    // Override desligar to also turn off turbo
    desligar() {
        const msg = super.desligar(); // Call parent desligar first
        this.turboAtivado = false; // Ensure turbo is off
        return msg + " Turbo desativado.";
    }


    exibirInformacoes() {
        return `${super.exibirInformacoesBase()}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
    }

    interagir() {
        return `Interagindo com ${this._tipoVeiculo.toLowerCase()}: ${this.modelo} com turbo ${this.turboAtivado ? 'ativado' : 'desativado'}.`;
    }

    toJSON() {
        const data = super.toJSON();
        data.turboAtivado = this.turboAtivado;
        return data;
    }
}

// Caminhao Class
class Caminhao extends Vehicle {
    constructor(modelo, cor, capacidadeCarga, id = null) {
        super(modelo, cor, id);
        // Ensure capacidadeCarga is a non-negative number
        this.capacidadeCarga = Math.max(0, parseFloat(capacidadeCarga) || 0);
        this.cargaAtual = 0;
         this._tipoVeiculo = "Caminhao";
    }

    carregar(quantidade) {
         const quantNum = parseFloat(quantidade);
         if (isNaN(quantNum) || quantNum <= 0) return "Quantidade inválida para carregar.";

         if (!this.ligado) { // Maybe trucks need to be on to load/unload? Optional rule.
            // return `${this.modelo} precisa estar ligado para carregar.`;
         }

        const espacoDisponivel = this.capacidadeCarga - this.cargaAtual;
        if (quantNum <= espacoDisponivel) {
            this.cargaAtual += quantNum;
            return `Caminhão carregado com ${quantNum} kg. Carga atual: ${this.cargaAtual} kg.`;
        } else {
            const podeCarregar = espacoDisponivel;
            if (podeCarregar > 0) {
                 this.cargaAtual += podeCarregar; // Load only what fits
                 return `Capacidade máxima (${this.capacidadeCarga} kg) excedida. Carregado com ${podeCarregar} kg (restante). Carga atual: ${this.cargaAtual} kg.`;
            } else {
                return `Caminhão já está na capacidade máxima (${this.capacidadeCarga} kg). Não é possível carregar mais.`;
            }
        }
    }

    descarregar(quantidade) {
         const quantNum = parseFloat(quantidade);
         if (isNaN(quantNum) || quantNum <= 0) return "Quantidade inválida para descarregar.";

         if (!this.ligado) { // Optional rule
             // return `${this.modelo} precisa estar ligado para descarregar.`;
         }

         const descarregado = Math.min(quantNum, this.cargaAtual); // Cannot discharge more than available
         this.cargaAtual -= descarregado;
         return `Caminhão descarregado em ${descarregado} kg. Carga atual: ${this.cargaAtual} kg.`;
    }

    exibirInformacoes() {
        return `${super.exibirInformacoesBase()}, Capacidade: ${this.capacidadeCarga} kg, Carga Atual: ${this.cargaAtual} kg`;
    }

    interagir() {
        return `Interagindo com ${this._tipoVeiculo.toLowerCase()}: ${this.modelo} com carga atual de ${this.cargaAtual} kg.`;
    }

     toJSON() {
        const data = super.toJSON();
        data.capacidadeCarga = this.capacidadeCarga;
        data.cargaAtual = this.cargaAtual;
        return data;
    }
}

// --- GARAGEM (Gerenciamento Central) ---
class Garagem {
    constructor() {
        this.veiculos = [];
        this.storageKey = 'garagemInteligente_v2'; // Consider versioning key if structure changes significantly
    }

    adicionarVeiculo(veiculo) {
        if (!(veiculo instanceof Vehicle)) {
            console.error("Apenas instâncias de Vehicle (ou subclasses) podem ser adicionadas.");
            return false;
        }
        if (this.veiculos.some(v => v.id === veiculo.id)) {
             console.warn(`Veículo com ID ${veiculo.id} (${veiculo.modelo}) já existe na garagem. Adição ignorada.`);
             displayAlert(`Veículo ${veiculo.modelo} já existe!`, 'warning');
             return false;
        }
        this.veiculos.push(veiculo);
        this.salvar();
        return true;
    }

    removerVeiculo(idVeiculo) {
        const index = this.veiculos.findIndex(v => v.id === idVeiculo);
        if (index > -1) {
            const removido = this.veiculos.splice(index, 1);
            console.log(`Veículo ${removido[0]?.modelo} removido.`);
            this.salvar();
            return true;
        }
        console.warn(`Tentativa de remover veículo com ID ${idVeiculo} não encontrado.`);
        return false;
    }

    encontrarVeiculoPorId(idVeiculo) {
        return this.veiculos.find(v => v.id === idVeiculo);
    }

    salvar() {
        try {
            const dataToSave = this.veiculos.map(v => v.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            console.log(`${this.veiculos.length} veículos salvos no LocalStorage (${this.storageKey}).`);
        } catch (error) {
            console.error("Erro ao salvar garagem no LocalStorage:", error);
            // Consider more specific error handling (e.g., quota exceeded)
            displayAlert("Erro Crítico: Não foi possível salvar os dados da garagem. Verifique o console.", "error");
        }
    }

    carregar() {
        try {
            const dataString = localStorage.getItem(this.storageKey);
            if (dataString) {
                const dataFromStorage = JSON.parse(dataString);
                // Ensure it's an array before mapping
                if (Array.isArray(dataFromStorage)) {
                    this.veiculos = dataFromStorage
                        .map(v_data => Vehicle.fromJSON(v_data)) // Use the static factory method
                        .filter(v => v !== null); // Filter out nulls if reconstruction failed
                    console.log(`${this.veiculos.length} veículos carregados do LocalStorage (${this.storageKey}).`);
                } else {
                     console.warn("Dado inválido encontrado no LocalStorage. Esperado um array.", dataFromStorage);
                     this.veiculos = [];
                     localStorage.removeItem(this.storageKey); // Clear invalid data
                }
            } else {
                this.veiculos = [];
                console.log(`Nenhuma garagem salva encontrada no LocalStorage (${this.storageKey}).`);
            }
        } catch (error) {
            console.error("Erro ao carregar/parsear garagem do LocalStorage:", error);
            displayAlert("Erro ao carregar dados da garagem. Resetando para vazio. Verifique o console.", "error");
            this.veiculos = []; // Reset on error
             // Optionally clear the corrupted storage item
             localStorage.removeItem(this.storageKey);
        }
    }

    listarTodosVeiculos() {
        return this.veiculos;
    }

    listarAgendamentosFuturos() {
        const agora = new Date();
        const futuros = [];
        this.veiculos.forEach(v => {
            // Check if historicoManutencao exists and is an array
            if (v.historicoManutencao && Array.isArray(v.historicoManutencao)) {
                v.historicoManutencao.forEach(m => {
                    // Ensure 'm' is a valid Manutencao object with a data property
                    if (m instanceof Manutencao && m.data) {
                         try {
                            const dataManutencao = new Date(m.data);
                            // Check if date is valid AND in the future
                            if (!isNaN(dataManutencao.getTime()) && dataManutencao > agora) {
                                futuros.push({ veiculo: v, manutencao: m });
                            }
                         } catch (dateError){
                              console.warn("Erro ao processar data de manutenção:", dateError, m);
                         }
                    }
                });
            }
        });
        futuros.sort((a, b) => new Date(a.manutencao.data) - new Date(b.manutencao.data));
        return futuros;
    }
}

// --- VARIÁVEIS GLOBAIS ---
let minhaGaragem = new Garagem();

// --- FUNÇÕES AUXILIARES UI ---

// Replace basic alert with a more user-friendly notification system if possible
function displayAlert(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Using alert is intrusive, consider a toast/snackbar library or a dedicated div
    alert(`[${type.toUpperCase()}] ${message}`);
    // Example: Update a status div
    // const statusDiv = document.getElementById('globalStatus');
    // if (statusDiv) {
    //     statusDiv.textContent = message;
    //     statusDiv.className = `status-${type}`; // Add classes for styling
    //     setTimeout(() => statusDiv.textContent = '', 5000); // Clear after 5s
    // }
}

function playSound(elementId) {
    try {
        const element = document.getElementById(elementId);
        if (element && typeof element.play === 'function') {
            element.currentTime = 0;
            element.play().catch(e => console.warn(`Audio play failed for ${elementId}:`, e.message));
        } else {
             console.warn(`Audio element ${elementId} not found or cannot play.`);
        }
    } catch (error) {
        console.error(`Error playing sound ${elementId}:`, error);
    }
}


function renderizarGaragem() {
    const containerCarro = document.getElementById('listaCarros');
    const containerCaminhao = document.getElementById('listaCaminhoes');
    const containerAgendamentos = document.getElementById('agendamentosFuturos');

    if (!containerCarro || !containerCaminhao || !containerAgendamentos) {
        console.error("Um ou mais containers HTML (listaCarros, listaCaminhoes, agendamentosFuturos) não encontrados!");
        return;
    }

    // Clear existing content
    containerCarro.innerHTML = '<h2>Carros Esportivos na Garagem</h2>';
    containerCaminhao.innerHTML = '<h2>Caminhões na Garagem</h2>';
    containerAgendamentos.innerHTML = '<h2>Agendamentos Futuros</h2><ul></ul>'; // Init with UL

    const veiculos = minhaGaragem.listarTodosVeiculos();
    let carrosHtml = '';
    let caminhoesHtml = '';

    if (veiculos.length === 0) {
        containerCarro.innerHTML += '<p>Nenhum carro esportivo na garagem.</p>';
        containerCaminhao.innerHTML += '<p>Nenhum caminhão na garagem.</p>';
    } else {
        veiculos.forEach(v => {
            // Basic check if v is a valid vehicle object
            if (!v || !v.id || typeof v.exibirInformacoes !== 'function' || typeof v.getHistoricoFormatado !== 'function') {
                console.warn("Item inválido encontrado na lista de veículos:", v);
                return; // Skip rendering this invalid item
            }

            const isCarroEsportivo = v instanceof CarroEsportivo;
            const isCaminhao = v instanceof Caminhao;

            // Determine image path safely
            let imagePath = 'Imagens/default-vehicle.png'; // Fallback image
            if (isCarroEsportivo) imagePath = 'Imagens/carro-imagem.webp';
            else if (isCaminhao) imagePath = 'Imagens/pngtree-red-truck-transport-png-image_11506094.png';

            const veiculoHtml = `
                <div class="veiculo-item" id="veiculo-${v.id}">
                    <img src="${imagePath}" alt="${v.modelo || 'Veículo'}" onerror="this.onerror=null; this.src='Imagens/default-vehicle.png';">
                    <div class="veiculo-info">
                        <p><strong>${v.modelo || 'Sem Modelo'} (${v.cor || 'Sem Cor'})</strong></p>
                        <p>Status: ${v.ligado ? 'Ligado' : 'Desligado'} | Velocidade: ${v.velocidade} km/h</p>
                        ${isCarroEsportivo ? `<p>Turbo: ${v.turboAtivado ? 'Ativado' : 'Desativado'}</p>` : ''}
                        ${isCaminhao ? `<p>Carga: ${v.cargaAtual} / ${v.capacidadeCarga} kg</p>` : ''}
                        <p id="status-${v.id}" class="status-veiculo"></p> <!-- Status message area -->
                    </div>
                    <div class="button-group-veiculo">
                        <button onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''}>Ligar</button>
                        <button onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado ? 'disabled' : ''}>Desligar</button>
                        <button onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''}>Acelerar</button>
                        <button onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade === 0 ? 'disabled' : ''}>Frear</button>
                        ${isCarroEsportivo ? `
                            <button onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')" ${!v.ligado || v.turboAtivado ? 'disabled' : ''}>Turbo ON</button>
                            <button onclick="executarAcaoVeiculo('${v.id}', 'desativarTurbo')" ${!v.turboAtivado ? 'disabled' : ''}>Turbo OFF</button>
                        ` : ''}
                        ${isCaminhao ? `
                            <button onclick="executarAcaoVeiculo('${v.id}', 'carregar', 1000)" ${v.cargaAtual >= v.capacidadeCarga ? 'disabled' : ''}>Carregar 1000</button>
                            <button onclick="executarAcaoVeiculo('${v.id}', 'descarregar', 500)" ${v.cargaAtual === 0 ? 'disabled' : ''}>Descarregar 500</button>
                        ` : ''}
                        <button onclick="mostrarFormAgendamento('${v.id}')">Agendar Manutenção</button>
                        <button onclick="removerVeiculoDaGaragem('${v.id}')" class="btn-remover">Remover</button>
                    </div>
                    <div class="historico-manutencao">
                        <h4>Histórico de Manutenção:</h4>
                        <ul>${v.getHistoricoFormatado()}</ul>
                    </div>
                </div>
            `;
            if (isCarroEsportivo) {
                carrosHtml += veiculoHtml;
            } else if (isCaminhao) {
                caminhoesHtml += veiculoHtml;
            } else {
                // Handle generic vehicles or other types if necessary
                console.warn("Veículo de tipo não renderizado especificamente:", v._tipoVeiculo, v);
            }
        });

        containerCarro.innerHTML += carrosHtml || '<p>Nenhum carro esportivo na garagem.</p>';
        containerCaminhao.innerHTML += caminhoesHtml || '<p>Nenhum caminhão na garagem.</p>';
    }

    // Renderizar Agendamentos Futuros
    const agendamentos = minhaGaragem.listarAgendamentosFuturos();
    const ulAgendamentos = containerAgendamentos.querySelector('ul');
    if (ulAgendamentos) {
        if (agendamentos.length > 0) {
            ulAgendamentos.innerHTML = agendamentos.map(item => {
                // Check if item and its properties are valid before formatting
                 if (item && item.veiculo && item.manutencao instanceof Manutencao) {
                    return `<li>${item.veiculo.modelo || 'Veículo Desconhecido'}: ${item.manutencao.formatar()}</li>`;
                 }
                 return ''; // Return empty string for invalid items
            }).join('');
        } else {
            ulAgendamentos.innerHTML = '<li>Nenhum agendamento futuro.</li>';
        }
    }


    verificarAgendamentosProximos(); // Check for alerts after rendering
}


function updateVehicleStatusUI(vehicleId, message, color = 'black') {
    const statusElement = document.getElementById(`status-${vehicleId}`);
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = color;
        // Clear message after a few seconds for better UX
        setTimeout(() => {
            // Check if the message is still the same one we set before clearing
            if (statusElement.textContent === message) {
                statusElement.textContent = '';
                 statusElement.style.color = 'black'; // Reset color
            }
        }, 4000); // Clear after 4 seconds
    } else {
        // Fallback to global alert if specific status element not found
        console.warn(`Elemento de status para ${vehicleId} não encontrado. Exibindo alerta global.`);
        displayAlert(`Veículo ${vehicleId}: ${message}`, color === 'red' ? 'error' : 'info');
    }
}


// --- FUNÇÕES DE AÇÃO DO VEÍCULO ---

function criarNovoVeiculo(tipo) {
    let veiculo;
    try {
        let modelo, cor, capacidade;
        if (tipo === 'CarroEsportivo') {
            modelo = document.getElementById('modeloEsportivo').value.trim() || 'Esportivo Padrão';
            cor = document.getElementById('corEsportivo').value.trim() || 'Preto';
             if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Carro Esportivo.");
            veiculo = new CarroEsportivo(modelo, cor);
        } else if (tipo === 'Caminhao') {
            modelo = document.getElementById('modeloCaminhao').value.trim() || 'Caminhão Padrão';
            cor = document.getElementById('corCaminhao').value.trim() || 'Branco';
            capacidade = parseFloat(document.getElementById('capacidadeCaminhao').value) || 5000;
             if (!modelo || !cor) throw new Error("Modelo e Cor são obrigatórios para Caminhão.");
             if (isNaN(capacidade) || capacidade < 0) throw new Error("Capacidade de carga inválida.");
            veiculo = new Caminhao(modelo, cor, capacidade);
        } else {
            throw new Error("Tipo de veículo desconhecido para criação");
        }

        // Try adding to garage, check return value
        if (minhaGaragem.adicionarVeiculo(veiculo)) {
            displayAlert(`${veiculo.modelo} adicionado com sucesso!`, 'success');
            renderizarGaragem(); // Re-render the garage UI

            // Clear input fields only on success
            if (tipo === 'CarroEsportivo') {
                document.getElementById('modeloEsportivo').value = '';
                document.getElementById('corEsportivo').value = '';
            } else {
                document.getElementById('modeloCaminhao').value = '';
                document.getElementById('corCaminhao').value = '';
                document.getElementById('capacidadeCaminhao').value = '';
            }
        } // If adicionarVeiculo returned false, it already showed a warning

    } catch (error) {
        console.error("Erro ao criar veículo:", error);
        displayAlert(`Erro ao criar veículo: ${error.message}`, 'error');
    }
}

function removerVeiculoDaGaragem(idVeiculo) {
     const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
     const nomeVeiculo = veiculo ? veiculo.modelo : `ID ${idVeiculo}`;
    // Use confirm for simple cases, or a custom modal for better UX
    if (confirm(`Tem certeza que deseja remover o veículo ${nomeVeiculo}? Esta ação não pode ser desfeita.`)) {
         if(minhaGaragem.removerVeiculo(idVeiculo)) {
            displayAlert(`Veículo ${nomeVeiculo} removido com sucesso.`, 'success');
            renderizarGaragem(); // Update UI immediately
         } else {
            // This case might happen if the vehicle was removed between render and click
            displayAlert(`Erro: Não foi possível encontrar ou remover o veículo ${nomeVeiculo}.`, 'error');
         }
    }
}


/**
 * Executes an action on a specific vehicle by its ID.
 * This is the corrected version handling default parameters.
 */
function executarAcaoVeiculo(idVeiculo, acao, param = null) {
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo) {
        displayAlert(`Veículo com ID ${idVeiculo} não encontrado. Pode ter sido removido.`, 'error');
        renderizarGaragem(); // Re-render to remove potentially stale elements
        return;
    }

    let message = '';
    let messageColor = 'black';
    let soundId = null;

    // <<< --- CORE FIX STARTS HERE --- >>>
    // Determine the actual parameter value to use, providing defaults if necessary.
    let finalParam = param;

    if (finalParam === null) { // Only set default if no param was explicitly passed by the button's onclick
        switch (acao) {
            case 'acelerar':
                finalParam = (veiculo instanceof Caminhao) ? 5 : 10; // Default 5 for truck, 10 for sports car
                console.log(`[Ação ${acao}] Usando incremento padrão: ${finalParam}`);
                break;
            case 'frear':
                finalParam = (veiculo instanceof Caminhao) ? 2 : 5; // Default 2 for truck, 5 for sports car
                console.log(`[Ação ${acao}] Usando decremento padrão: ${finalParam}`);
                break;
            case 'carregar': // Provide default if button didn't specify
                 if (veiculo instanceof Caminhao) finalParam = 1000; // Example default
                 else finalParam = 0; // Cannot load non-trucks
                 console.log(`[Ação ${acao}] Usando carga padrão: ${finalParam}`);
                 break;
            case 'descarregar': // Provide default if button didn't specify
                 if (veiculo instanceof Caminhao) finalParam = 500; // Example default
                 else finalParam = 0; // Cannot unload non-trucks
                 console.log(`[Ação ${acao}] Usando descarga padrão: ${finalParam}`);
                 break;
             // Actions like 'ligar', 'desligar', 'ativarTurbo', 'desativarTurbo' don't need a param here
        }
    }
    // <<< --- CORE FIX ENDS HERE --- >>>


    try {
        // Check if the method actually exists on the object
        if (typeof veiculo[acao] === 'function') {

            // <<< --- CORRECTED CALL --- >>>
            // Call the method with the determined parameter (could be the original param or the default)
            // Methods like ligar/desligar will ignore the param if they don't expect one.
            message = veiculo[acao](finalParam);
            // <<< --- END CORRECTED CALL --- >>>

            // Assign UI feedback based on action
            switch (acao) {
                case 'ligar':         messageColor = 'green'; soundId = 'somLigar'; break;
                case 'desligar':      messageColor = 'red'; soundId = 'somDesligar'; break;
                case 'acelerar':      messageColor = 'blue'; soundId = 'somAcelerar'; break;
                case 'frear':         messageColor = 'orange'; soundId = 'somFrear'; break;
                case 'ativarTurbo':   messageColor = 'purple'; soundId = 'somAcelerar'; break; // Reuse accelerate sound?
                case 'desativarTurbo': messageColor = 'gray'; break;
                case 'carregar':      messageColor = 'darkgreen'; break; // Give feedback color
                case 'descarregar':   messageColor = 'darkorange'; break; // Give feedback color
                 default:             messageColor = 'black'; break;
            }

             if (soundId) {
                 playSound(soundId);
             }
             // Update status immediately for responsiveness before full re-render
             updateVehicleStatusUI(idVeiculo, message, messageColor);
             minhaGaragem.salvar(); // Save the new state of the vehicle
             // Re-render the entire garage to update displayed speed, status, button states, etc.
             renderizarGaragem();

        } else {
            message = `Ação '${acao}' é desconhecida ou não aplicável para ${veiculo.modelo}.`;
            messageColor = 'red';
            updateVehicleStatusUI(idVeiculo, message, messageColor); // Show error in status
            console.error(message);
        }
    } catch (error) {
        // Catch errors thrown by the vehicle methods themselves
        console.error(`Erro ao executar ação '${acao}' no veículo ${idVeiculo} (${veiculo.modelo}):`, error);
        message = `Erro na ação '${acao}': ${error.message}`;
        messageColor = 'red';
        updateVehicleStatusUI(idVeiculo, message, messageColor); // Show error in status
         // Optionally re-render even on error if state might be inconsistent
         renderizarGaragem();
    }
}


// --- FUNÇÕES DE AGENDAMENTO ---

const formAgendamento = document.getElementById('formAgendamento');
const agendamentoModal = document.getElementById('agendamentoModal');

function mostrarFormAgendamento(idVeiculo) {
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo) {
        displayAlert("Veículo não encontrado para agendamento.", "error");
        return;
    }

    document.getElementById('agendamentoVeiculoId').value = idVeiculo;
    document.getElementById('agendamentoTituloVeiculo').textContent = `Agendar Manutenção para: ${veiculo.modelo} (${veiculo.cor})`;
    formAgendamento.reset(); // Clear previous form data

    // Set min date for input to prevent scheduling in the past
    try {
        // Format required for datetime-local is YYYY-MM-DDTHH:mm
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Adjust for local timezone
         now.setSeconds(0); // Optional: zero out seconds
         now.setMilliseconds(0); // Optional: zero out milliseconds
        const todayStr = now.toISOString().slice(0, 16); // Get YYYY-MM-DDTHH:mm
        document.getElementById('agendamentoData').min = todayStr;
    } catch(e) {
        console.error("Error setting min date:", e);
         // Fallback: disable past date selection in a simpler way if ISO fails
         document.getElementById('agendamentoData').min = new Date().toISOString().split("T")[0];
    }


    if (agendamentoModal) {
        agendamentoModal.style.display = 'block';
    } else {
        console.error("Modal de agendamento não encontrado no HTML.");
        formAgendamento.style.display = 'block'; // Fallback if no modal div
    }
}

function fecharFormAgendamento() {
     if (agendamentoModal) {
        agendamentoModal.style.display = 'none';
    } else {
        formAgendamento.style.display = 'none';
    }
     document.getElementById('agendamentoVeiculoId').value = ''; // Clear hidden field
     formAgendamento.reset(); // Clear form on close
}

function salvarAgendamento(event) {
    event.preventDefault(); // Prevent default form submission which reloads page

    const veiculoId = document.getElementById('agendamentoVeiculoId').value;
    const data = document.getElementById('agendamentoData').value; // Format YYYY-MM-DDTHH:mm
    const tipo = document.getElementById('agendamentoTipo').value.trim();
    const custo = document.getElementById('agendamentoCusto').value; // String initially
    const descricao = document.getElementById('agendamentoDescricao').value.trim();

    const veiculo = minhaGaragem.encontrarVeiculoPorId(veiculoId);

    if (!veiculo) {
        displayAlert("Erro Crítico: Veículo selecionado para agendamento não existe mais.", "error");
        fecharFormAgendamento();
        return;
    }

    // --- Client-side Validation ---
    let errors = [];
    if (!data) errors.push("Data e Hora são obrigatórios.");
    if (!tipo) errors.push("Tipo de Serviço é obrigatório.");
    if (custo === '' || isNaN(parseFloat(custo)) || parseFloat(custo) < 0) {
         errors.push("Custo é obrigatório e deve ser um número positivo ou zero.");
    }
     // Optional: Check if date is in the past (although 'min' attribute helps)
     try {
        if (new Date(data) < new Date()) {
            // Allow saving past maintenance (as records), but maybe warn if it's far past?
            // Or strictly enforce future dates for 'scheduling'
            // For now, allow past dates as records of completed work.
            // console.warn("Data da manutenção está no passado.");
        }
     } catch(e){ errors.push("Formato de Data inválido.");}


    if (errors.length > 0) {
        displayAlert("Erro no formulário:\n- " + errors.join("\n- "), "error");
        return; // Stop processing
    }
    // --- End Validation ---

    try {
        // Create Manutencao object - Constructor now handles internal validation
        const novaManutencao = new Manutencao(data, tipo, parseFloat(custo), descricao, veiculoId);

        // Add to vehicle history using the vehicle's method
        if (veiculo.adicionarManutencao(novaManutencao)) {
             minhaGaragem.salvar(); // Save the updated garage data (with new maintenance)
             renderizarGaragem(); // Update the UI (shows new history/schedule)
             fecharFormAgendamento(); // Close the form/modal
             displayAlert("Manutenção agendada/registrada com sucesso!", "success");
        } else {
             // This case should be rare now if Manutencao constructor succeeds
             displayAlert("Falha desconhecida ao adicionar manutenção ao histórico.", "error");
        }

    } catch (error) {
        // Catch errors from Manutencao constructor (e.g., invalid data format)
        console.error("Erro ao criar ou agendar manutenção:", error);
        displayAlert(`Erro no agendamento: ${error.message}`, "error");
        // Keep the form open so user can correct the error
    }
}

// --- VERIFICAÇÃO DE AGENDAMENTOS ---
let alertadosHoje = new Set(); // Track alerts shown today to avoid repetition

function verificarAgendamentosProximos() {
    const agendamentos = minhaGaragem.listarAgendamentosFuturos();
    const agora = new Date();
    const amanha = new Date();
    amanha.setDate(agora.getDate() + 1);
    amanha.setHours(23, 59, 59, 999); // End of tomorrow

    const hojeStr = agora.toDateString(); // Get "Mon Apr 01 2024" format

    // Clear alerts from previous days if necessary
    if (!alertadosHoje.has(hojeStr)) {
        alertadosHoje.clear();
        alertadosHoje.add(hojeStr); // Mark today as having checked alerts
    }

    agendamentos.forEach(item => {
         if (!item || !item.manutencao || !item.manutencao.id) return; // Skip invalid items

        const manutId = item.manutencao.id;
         if (alertadosHoje.has(manutId)) return; // Skip if already alerted today

        try {
            const dataManutencao = new Date(item.manutencao.data);
            if (isNaN(dataManutencao.getTime())) return; // Skip invalid dates

            // Check if appointment is today or tomorrow
            if (dataManutencao > agora && dataManutencao <= amanha) {
                 const dataFormatada = dataManutencao.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
                 const diaFormatado = dataManutencao.toDateString() === agora.toDateString() ? "hoje" : "amanhã";

                 displayAlert(`Lembrete: ${item.veiculo.modelo} - ${item.manutencao.tipo} agendado para ${diaFormatado} às ${dataFormatada}!`, 'warning');
                 alertadosHoje.add(manutId); // Mark this specific alert as shown today
            }
            // Add more conditions (e.g., next week) if needed
        } catch (e) {
             console.warn("Erro ao processar data de agendamento para alerta:", e, item);
        }
    });
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Inicializando Garagem...");
    // Load garage data from LocalStorage first
    minhaGaragem.carregar();

    // Initial rendering of the garage UI based on loaded data
    renderizarGaragem();

    // --- Botões de Criação ---
    const criarCarroBtn = document.getElementById('criarCarroEsportivoBtn');
    const criarCaminhaoBtn = document.getElementById('criarCaminhaoBtn');

    if (criarCarroBtn) {
        criarCarroBtn.addEventListener('click', () => criarNovoVeiculo('CarroEsportivo'));
    } else console.error("Botão criarCarroEsportivoBtn não encontrado.");

    if (criarCaminhaoBtn) {
        criarCaminhaoBtn.addEventListener('click', () => criarNovoVeiculo('Caminhao'));
    } else console.error("Botão criarCaminhaoBtn não encontrado.");


     // --- Formulário de Agendamento ---
    if (formAgendamento) {
        formAgendamento.addEventListener('submit', salvarAgendamento);
    } else console.error("Formulário formAgendamento não encontrado.");

    // Close button/icon for the modal
    const closeBtn = document.querySelector('.modal .close-button');
     if (closeBtn) {
         closeBtn.addEventListener('click', fecharFormAgendamento);
     } else console.warn("Botão de fechar do modal (.close-button) não encontrado.");

     // Close modal if clicking outside the form content
     if (agendamentoModal) {
        agendamentoModal.addEventListener('click', (event) => {
             // Check if the click was directly on the modal background (event.target)
             // and not on its children (modal-content or elements inside it)
            if (event.target === agendamentoModal) {
                fecharFormAgendamento();
            }
        });
     } else console.error("Elemento do modal agendamentoModal não encontrado.");


    // --- Limpar LocalStorage (para testes) ---
    const limparStorageBtn = document.getElementById('limparStorageBtn');
    if (limparStorageBtn) {
        limparStorageBtn.addEventListener('click', () => {
            if (confirm("ATENÇÃO!\nTem certeza que deseja limpar TODOS os dados salvos da garagem?\nEsta ação é irreversível.")) {
                try {
                    localStorage.removeItem(minhaGaragem.storageKey);
                    minhaGaragem.veiculos = []; // Clear in-memory array too
                    alertadosHoje.clear(); // Reset alerts tracking
                    renderizarGaragem(); // Update UI to show empty garage
                    displayAlert("Dados da garagem limpos com sucesso.", "info");
                     console.log("LocalStorage limpo.");
                } catch(e) {
                    console.error("Erro ao limpar LocalStorage:", e);
                    displayAlert("Erro ao tentar limpar os dados.", "error");
                }
            }
        });
    } else console.warn("Botão limparStorageBtn não encontrado.");

    // Set interval to check for upcoming appointments periodically (e.g., every 5 minutes)
     setInterval(verificarAgendamentosProximos, 5 * 60 * 1000); // 5 minutes in milliseconds

    console.log("Inicialização da Garagem concluída.");
});