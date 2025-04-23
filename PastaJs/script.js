// script.js

// --- CLASSES ---

/**
 * Represents a generic vehicle.
 */
class Vehicle {
    /**
     * Creates a Vehicle instance.
     * @param {string} modelo - The model of the vehicle.
     * @param {string} cor - The color of the vehicle.
     * @param {string|null} [id=null] - Optional existing ID. If null, a new unique ID is generated.
     */
    constructor(modelo, cor, id = null) {
        if (typeof modelo !== 'string' || !modelo.trim()) throw new Error("Modelo do veículo é obrigatório.");
        if (typeof cor !== 'string' || !cor.trim()) throw new Error("Cor do veículo é obrigatória.");

        this.id = id || `veh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.velocidade = 0;
        /** @type {Manutencao[]} */
        this.historicoManutencao = [];
        this._tipoVeiculo = "Veiculo"; // Used for reconstruction and identification
    }

    ligar() {
        if (this.ligado) return `${this.modelo} já está ligado.`;
        this.ligado = true;
        return `${this.modelo} ligado.`;
    }

    desligar() {
        if (!this.ligado) return `${this.modelo} já está desligado.`;
        // *** CORRECTION: Prevent turning off if moving ***
        if (this.velocidade > 0) {
            return `${this.modelo} precisa parar completamente (velocidade 0) antes de desligar.`;
        }
        this.ligado = false;
        this.velocidade = 0; // Ensure speed is 0
        return `${this.modelo} desligado.`;
    }

    /**
     * Accelerates the vehicle by a given increment.
     * @param {number|string} incremento - The amount to increase speed by (km/h). Must be positive.
     * @returns {string} Status message.
     */
    acelerar(incremento) {
        const incValue = parseFloat(incremento);
        if (isNaN(incValue) || incValue <= 0) {
             console.warn(`[acelerar] Tentativa de acelerar com valor inválido ou não positivo: ${incremento}`);
             return `${this.modelo} - Valor de aceleração inválido: ${incremento}. Deve ser um número positivo.`;
        }
        if (!this.ligado) {
            return `${this.modelo} precisa estar ligado para acelerar.`;
        }
        this.velocidade += incValue;
        return `${this.modelo} acelerou para ${this.velocidade.toFixed(1)} km/h.`; // Use toFixed for potential float results
    }

    /**
     * Decelerates the vehicle by a given decrement.
     * @param {number|string} decremento - The amount to decrease speed by (km/h). Must be positive.
     * @returns {string} Status message.
     */
    frear(decremento) {
        const decValue = parseFloat(decremento);
        if (isNaN(decValue) || decValue <= 0) {
            console.warn(`[frear] Tentativa de frear com valor inválido ou não positivo: ${decremento}`);
            return `${this.modelo} - Valor de frenagem inválido: ${decremento}. Deve ser um número positivo.`;
        }
        // Cannot go below 0 speed
        this.velocidade = Math.max(0, this.velocidade - decValue);
        return `${this.modelo} freou para ${this.velocidade.toFixed(1)} km/h.`; // Use toFixed
    }

    /**
     * Adds a maintenance record to the vehicle's history.
     * @param {Manutencao} manutencaoObj - An instance of the Manutencao class.
     * @returns {boolean} True if added successfully, false otherwise.
     */
    adicionarManutencao(manutencaoObj) {
        if (!(manutencaoObj instanceof Manutencao)) {
            console.error("Objeto inválido passado para adicionarManutencao. Apenas instâncias de Manutencao são permitidas.", manutencaoObj);
            displayGlobalAlert("Erro interno: Tentativa de adicionar registro de manutenção inválido.", "error");
            return false;
        }
        if (!manutencaoObj.veiculoId) {
             manutencaoObj.veiculoId = this.id;
        } else if (manutencaoObj.veiculoId !== this.id) {
            console.warn(`Manutenção ${manutencaoObj.id} (Veículo ${manutencaoObj.veiculoId}) sendo associada ao veículo ${this.id}. Verifique a lógica se inesperado.`);
            manutencaoObj.veiculoId = this.id; // Force correct ID association
        }

        this.historicoManutencao.push(manutencaoObj);
        // Sort by date descending (most recent first)
        this.historicoManutencao.sort((a, b) => {
            // Handle potential invalid dates during sort
            const dateA = new Date(a.data);
            const dateB = new Date(b.data);
            if (isNaN(dateA.getTime())) return 1; // Invalid dates go last
            if (isNaN(dateB.getTime())) return -1;
            return dateB - dateA;
        });
        console.log(`Manutenção adicionada ao ${this.modelo}: ${manutencaoObj.tipo}`);
        return true;
    }

    /**
     * Gets the maintenance history formatted as HTML list items.
     * @returns {string} HTML string (<li> elements) or a message if history is empty.
     */
    getHistoricoFormatado() {
        if (!this.historicoManutencao || this.historicoManutencao.length === 0) {
            return "<li class='empty-history'>Nenhum registro de manutenção encontrado.</li>";
        }
        // Defensive check: ensure items are Manutencao instances before formatting
        const historyItems = this.historicoManutencao
                 .filter(m => m instanceof Manutencao)
                 .map(m => `<li>${m.formatar()}</li>`).join('');

        return historyItems || "<li class='empty-history error'>Erro ao formatar histórico.</li>"; // Fallback
    }

    /**
     * Returns basic vehicle information as a string.
     * @returns {string} Basic info string.
     * @protected
     */
    exibirInformacoesBase() {
         // Using template literals for clarity
         return `Tipo: ${this._tipoVeiculo}, ID: ${this.id}, Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade.toFixed(1)} km/h`;
    }

    /**
     * Returns detailed vehicle information (can be overridden by subclasses).
     * @returns {string} Detailed info string.
     */
    exibirInformacoes() {
        return this.exibirInformacoesBase();
    }

    /**
     * Returns a generic interaction message (can be overridden).
     * @returns {string} Interaction message.
     */
    interagir() {
        return `Interagindo com ${this._tipoVeiculo.toLowerCase()}: ${this.modelo}.`;
    }

    /**
     * Creates a plain object representation suitable for JSON serialization.
     * Includes the type identifier for reconstruction.
     * @returns {object} Plain data object.
     */
    toJSON() {
        return {
            id: this.id,
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            velocidade: this.velocidade,
            // Ensure history contains valid Manutencao objects before serializing
            historicoManutencao: (this.historicoManutencao || [])
                                     .filter(m => m instanceof Manutencao && typeof m.toJSON === 'function')
                                     .map(m => m.toJSON()),
            _tipoVeiculo: this._tipoVeiculo // Crucial for reconstruction
        };
    }

     /**
     * Creates a Vehicle instance (or subclass) from a plain data object.
      * Relies on the `_tipoVeiculo` property in the data and the existence of `Manutencao.fromJSON`.
     * @param {object} data - The plain data object.
     * @returns {Vehicle|CarroEsportivo|Caminhao|null} The reconstructed vehicle instance, or null on failure.
     */
     static fromJSON(data) {
        // Basic validation of input data
        if (!data || typeof data !== 'object' || !data._tipoVeiculo || !data.id) {
             console.error("Dados inválidos ou ausentes para reconstrução do Veículo. '_tipoVeiculo' e 'id' são necessários.", data);
             return null;
        }
        // Check if the required Manutencao class and its fromJSON method are available
        if (typeof Manutencao?.fromJSON !== 'function') {
             console.error("Classe Manutencao ou método Manutencao.fromJSON não estão disponíveis. Impossível reconstruir histórico.");
             return null; // Cannot proceed without Manutencao reconstruction logic
        }

        let vehicle = null;
        try {
            // Instantiate the correct subclass based on _tipoVeiculo
            switch (data._tipoVeiculo) {
                case 'CarroEsportivo':
                    vehicle = new CarroEsportivo(data.modelo || 'Modelo Desconhecido', data.cor || 'Cor Desconhecida', data.id);
                    if (typeof data.turboAtivado === 'boolean') vehicle.turboAtivado = data.turboAtivado;
                    break;
                case 'Caminhao':
                    const capacidade = typeof data.capacidadeCarga === 'number' && data.capacidadeCarga >= 0 ? data.capacidadeCarga : 0;
                    vehicle = new Caminhao(data.modelo || 'Modelo Desconhecido', data.cor || 'Cor Desconhecida', capacidade, data.id);
                     if (typeof data.cargaAtual === 'number') {
                        vehicle.cargaAtual = Math.min(Math.max(0, data.cargaAtual), vehicle.capacidadeCarga);
                     }
                    break;
                case 'Veiculo': // Fallback for base Vehicle class
                default: // Handle unknown types gracefully
                    if (data._tipoVeiculo !== 'Veiculo') {
                        console.warn(`Tipo de veículo desconhecido ('${data._tipoVeiculo}') encontrado durante a reconstrução. Tratando como Veículo base.`);
                    }
                    vehicle = new Vehicle(data.modelo || 'Modelo Desconhecido', data.cor || 'Cor Desconhecida', data.id);
                    // Preserve original type string if it was unknown, in case it's useful for debugging
                    if (data._tipoVeiculo !== 'Veiculo') vehicle._tipoVeiculo = data._tipoVeiculo;
                    break;
            }

            // Restore common properties carefully, checking types
            vehicle.ligado = typeof data.ligado === 'boolean' ? data.ligado : false;
            vehicle.velocidade = typeof data.velocidade === 'number' ? Math.max(0, data.velocidade) : 0; // Ensure non-negative

            // Reconstruct Manutencao objects from the history array
            if (Array.isArray(data.historicoManutencao)) {
                vehicle.historicoManutencao = data.historicoManutencao
                    .map(m_data => Manutencao.fromJSON(m_data)) // Attempt reconstruction
                    .filter(m => m instanceof Manutencao);      // Keep only successful reconstructions

                // Re-sort after loading, as order might not be guaranteed in storage or reconstruction
                vehicle.historicoManutencao.sort((a, b) => {
                    const dateA = new Date(a.data);
                    const dateB = new Date(b.data);
                    if (isNaN(dateA.getTime())) return 1;
                    if (isNaN(dateB.getTime())) return -1;
                    return dateB - dateA;
                });
            } else {
                 vehicle.historicoManutencao = []; // Initialize as empty if missing or invalid
            }

            return vehicle;

        } catch (error) {
             // Catch errors during instantiation or property assignment
             console.error(`Erro crítico ao reconstruir veículo (ID: ${data.id}, Tipo: '${data._tipoVeiculo}') a partir de JSON:`, error.message, data);
             return null; // Return null if any error occurs during reconstruction
        }
    }
}

// --- CarroEsportivo Class ---
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
        return `${this.modelo}: Turbo ativado!`;
    }

    desativarTurbo() {
        if (!this.turboAtivado) return `${this.modelo} turbo já está desativado.`;
        this.turboAtivado = false;
        return `${this.modelo}: Turbo desativado.`;
    }

    // Override desligar to also turn off turbo for safety
    desligar() {
        // Check condition *before* calling super.desligar()
        if (this.velocidade > 0) {
             return `${this.modelo} precisa parar completamente (velocidade 0) antes de desligar.`;
        }
        // If stopped, call parent method
        const msgBase = super.desligar();
        // If parent call was successful (vehicle is now off)
        if (this.ligado === false) {
             this.turboAtivado = false; // Ensure turbo is off
             return msgBase + " Turbo também foi desativado.";
        }
        // This part should theoretically not be reached if super.desligar() only works when stopped
        return msgBase;
    }

    exibirInformacoes() {
        return `${super.exibirInformacoesBase()}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
    }

    interagir() {
        return `Acelerando o ${this.modelo} ${this.cor}${this.turboAtivado ? ' com o turbo LIGADO!' : ''}. Vruum!`;
    }

    toJSON() {
        const data = super.toJSON(); // Get base vehicle data
        data.turboAtivado = this.turboAtivado; // Add specific property
        return data;
    }
}

// --- Caminhao Class ---
class Caminhao extends Vehicle {
    constructor(modelo, cor, capacidadeCarga, id = null) {
        super(modelo, cor, id);
        // Ensure capacidadeCarga is a non-negative number during construction
        const capNum = parseFloat(capacidadeCarga);
        this.capacidadeCarga = !isNaN(capNum) && capNum >= 0 ? capNum : 0;
        if (this.capacidadeCarga !== capNum) { // Warn if value was changed
            console.warn(`Capacidade de carga inválida (${capacidadeCarga}) para ${modelo}, definida para ${this.capacidadeCarga}.`);
        }
        this.cargaAtual = 0; // Start empty
        this._tipoVeiculo = "Caminhao";
    }

    /**
     * Loads cargo onto the truck.
     * @param {number|string} quantidade - Amount of cargo to load (kg). Must be positive.
     * @returns {string} Status message.
     */
    carregar(quantidade) {
         const quantNum = parseFloat(quantidade);
         if (isNaN(quantNum) || quantNum <= 0) return "Quantidade inválida para carregar. Deve ser um número positivo.";

        const espacoDisponivel = this.capacidadeCarga - this.cargaAtual;
        if (espacoDisponivel <= 0) {
             return `${this.modelo} já está na capacidade máxima (${this.capacidadeCarga.toFixed(1)} kg). Não é possível carregar mais.`;
        }

        const cargaAdicionada = Math.min(quantNum, espacoDisponivel);
        this.cargaAtual += cargaAdicionada;

        if (cargaAdicionada < quantNum) {
             // Loaded only partially
             return `Capacidade máxima (${this.capacidadeCarga.toFixed(1)} kg) excedida. Carregado com os ${cargaAdicionada.toFixed(1)} kg restantes. Carga atual: ${this.cargaAtual.toFixed(1)}/${this.capacidadeCarga.toFixed(1)} kg.`;
        } else {
            // Loaded fully
            return `${this.modelo} carregado com ${cargaAdicionada.toFixed(1)} kg. Carga atual: ${this.cargaAtual.toFixed(1)}/${this.capacidadeCarga.toFixed(1)} kg.`;
        }
    }

    /**
     * Unloads cargo from the truck.
     * @param {number|string} quantidade - Amount of cargo to unload (kg). Must be positive.
     * @returns {string} Status message.
     */
    descarregar(quantidade) {
         const quantNum = parseFloat(quantidade);
         if (isNaN(quantNum) || quantNum <= 0) return "Quantidade inválida para descarregar. Deve ser um número positivo.";

         if (this.cargaAtual === 0) return `${this.modelo} está vazio, não há o que descarregar.`;

         const descarregado = Math.min(quantNum, this.cargaAtual); // Cannot discharge more than available
         this.cargaAtual -= descarregado;
         return `${this.modelo} descarregado em ${descarregado.toFixed(1)} kg. Carga atual: ${this.cargaAtual.toFixed(1)}/${this.capacidadeCarga.toFixed(1)} kg.`;
    }

    exibirInformacoes() {
        return `${super.exibirInformacoesBase()}, Capacidade: ${this.capacidadeCarga.toFixed(1)} kg, Carga Atual: ${this.cargaAtual.toFixed(1)} kg`;
    }

    interagir() {
        return `Transportando ${this.cargaAtual.toFixed(1)} kg de carga com o caminhão ${this.modelo}.`;
    }

     toJSON() {
        const data = super.toJSON();
        data.capacidadeCarga = this.capacidadeCarga;
        data.cargaAtual = this.cargaAtual;
        return data;
    }
}

// --- GARAGEM (Gerenciamento Central) ---
/**
 * Manages the collection of vehicles and persistence.
 */
class Garagem {
    constructor() {
        /** @type {Array<Vehicle|CarroEsportivo|Caminhao>} */
        this.veiculos = [];
        this.storageKey = 'garagemInteligente_v3_1'; // Version bump
        console.log(`Garagem inicializada. Usando chave de armazenamento: ${this.storageKey}`);
    }

    /**
     * Adds a vehicle instance to the garage. Prevents duplicates by ID.
     * @param {Vehicle|CarroEsportivo|Caminhao} veiculo - An instance of Vehicle or its subclasses.
     * @returns {boolean} True if added successfully, false otherwise.
     */
    adicionarVeiculo(veiculo) {
        if (!(veiculo instanceof Vehicle)) {
            console.error("Tentativa de adicionar objeto inválido à garagem.", veiculo);
             displayGlobalAlert("Erro interno: Tipo de veículo inválido.", "error");
            return false;
        }
        if (this.veiculos.some(v => v.id === veiculo.id)) {
             console.warn(`Veículo com ID ${veiculo.id} (${veiculo.modelo}) já existe. Adição ignorada.`);
             displayGlobalAlert(`Veículo ${veiculo.modelo} (ID: ${veiculo.id}) já existe!`, 'warning');
             return false;
        }

        this.veiculos.push(veiculo);
        console.log(`Veículo ${veiculo.modelo} (ID: ${veiculo.id}) adicionado.`);
        this.salvar();
        return true;
    }

    /**
     * Removes a vehicle from the garage by its ID.
     * @param {string} idVeiculo - The ID of the vehicle to remove.
     * @returns {boolean} True if removed successfully, false if not found.
     */
    removerVeiculo(idVeiculo) {
        const index = this.veiculos.findIndex(v => v.id === idVeiculo);
        if (index > -1) {
            const removido = this.veiculos.splice(index, 1)[0];
            console.log(`Veículo ${removido?.modelo} (ID: ${idVeiculo}) removido.`);
            this.salvar();
            return true;
        } else {
            console.warn(`Tentativa de remover veículo com ID ${idVeiculo} não encontrado.`);
            return false; // Feedback handled by caller
        }
    }

    /**
     * Finds a vehicle in the garage by its ID.
     * @param {string} idVeiculo - The ID of the vehicle to find.
     * @returns {Vehicle|CarroEsportivo|Caminhao|undefined} The vehicle instance if found, otherwise undefined.
     */
    encontrarVeiculoPorId(idVeiculo) {
        return this.veiculos.find(v => v.id === idVeiculo);
    }

    /**
     * Saves the current state of the garage (all vehicles) to LocalStorage.
     */
    salvar() {
        try {
            const dataToSave = this.veiculos.map(v => v.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            // console.log(`${this.veiculos.length} veículos salvos.`); // Reduce noise
        } catch (error) {
            console.error("Erro CRÍTICO ao salvar garagem no LocalStorage:", error);
            let message = "Erro Crítico: Não foi possível salvar os dados da garagem.";
            if (error.name === 'QuotaExceededError' || (error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                 message += " O armazenamento local está cheio.";
                 console.error("LocalStorage Quota Exceeded!");
            }
             message += " Verifique o console.";
             displayGlobalAlert(message, "error", 0); // Persistent error
        }
    }

    /**
     * Loads the garage state from LocalStorage. Handles potential errors during parsing or reconstruction.
     */
    carregar() {
        console.log(`Tentando carregar dados da chave: ${this.storageKey}`);
        const dataString = localStorage.getItem(this.storageKey);
        if (!dataString) {
            this.veiculos = [];
            console.log(`Nenhuma garagem salva encontrada (${this.storageKey}).`);
            return;
        }

        try {
            const dataFromStorage = JSON.parse(dataString);

            // *** CORRECTION: Validate loaded data is an array ***
            if (!Array.isArray(dataFromStorage)) {
                 console.error("Dado corrompido encontrado no LocalStorage! Esperado um array.", dataFromStorage);
                 this.veiculos = [];
                 try {
                     localStorage.removeItem(this.storageKey);
                      displayGlobalAlert("Dados da garagem corrompidos foram removidos. Começando do zero.", "error", 10000);
                 } catch (removeError) {
                     console.error("Falha ao remover dados corrompidos:", removeError);
                     displayGlobalAlert("Dados da garagem corrompidos. Falha ao limpar automaticamente.", "error", 0);
                 }
                 return;
            }

            // Reconstruct vehicles and filter invalid ones
            const loadedVehicles = dataFromStorage
                .map(v_data => Vehicle.fromJSON(v_data))
                .filter(v => v instanceof Vehicle);

            const discardedCount = dataFromStorage.length - loadedVehicles.length;
            if (discardedCount > 0) {
                 console.warn(`${discardedCount} itens inválidos foram descartados durante o carregamento.`);
                 displayGlobalAlert(`${discardedCount} registro(s) de veículo(s) inválido(s) foram ignorados durante o carregamento.`, 'warning', 8000);
            }

            this.veiculos = loadedVehicles;
            console.log(`${this.veiculos.length} veículos carregados e validados.`);

        } catch (error) {
            console.error("Erro CRÍTICO ao carregar/parsear garagem:", error);
            displayGlobalAlert("Erro grave ao carregar dados. Resetando para vazio.", "error", 0);
            this.veiculos = [];
            // Consider clearing storage cautiously
            // localStorage.removeItem(this.storageKey);
        }
    }

    /**
     * Returns a list of all vehicles currently in the garage.
     * @returns {Array<Vehicle|CarroEsportivo|Caminhao>} An array of vehicle instances.
     */
    listarTodosVeiculos() {
        return [...this.veiculos]; // Return shallow copy
    }

    /**
     * Finds all future maintenance appointments across all vehicles.
     * @returns {Array<{veiculo: Vehicle|CarroEsportivo|Caminhao, manutencao: Manutencao}>} An array of objects containing the vehicle and the future maintenance record, sorted by date ascending.
     */
    listarAgendamentosFuturos() {
        const agora = new Date();
        const futuros = [];

        this.veiculos.forEach(v => {
            if (v instanceof Vehicle && Array.isArray(v.historicoManutencao)) {
                v.historicoManutencao.forEach(m => {
                    if (m instanceof Manutencao && m.data) {
                         try {
                            const dataManutencao = new Date(m.data);
                            if (!isNaN(dataManutencao.getTime()) && dataManutencao >= agora) {
                                futuros.push({ veiculo: v, manutencao: m });
                            }
                         } catch (dateError){ /* Ignore date parsing errors silently */ }
                    }
                });
            }
        });

        // Sort ascending (soonest first)
        futuros.sort((a, b) => {
            const dateA = new Date(a.manutencao.data);
            const dateB = new Date(b.manutencao.data);
             if (isNaN(dateA.getTime())) return 1;
             if (isNaN(dateB.getTime())) return -1;
             return dateA - dateB;
        });
        return futuros;
    }
}

// --- VARIÁVEIS GLOBAIS E ESTADO DA UI ---
let minhaGaragem; // Will be initialized in DOMContentLoaded
let globalStatusTimeout = null;
let vehicleStatusTimeouts = {};
let alertadosHoje = new Set();

// Cache DOM elements frequently accessed (will be assigned in DOMContentLoaded)
let globalStatusDiv, containerCarro, containerCaminhao, agendamentosListContainer,
    agendamentoModal, formAgendamento, agendamentoTituloVeiculo,
    agendamentoVeiculoIdInput, agendamentoDataInput, agendamentoTipoInput,
    agendamentoCustoInput, agendamentoDescricaoInput;


// --- FUNÇÕES AUXILIARES UI ---

/**
 * Displays a global status message to the user.
 * @param {string} message The message to display.
 * @param {'info'|'success'|'warning'|'error'} type The type of message (affects styling).
 * @param {number} [duration=5000] How long to display the message in ms. 0 for permanent.
 */
function displayGlobalAlert(message, type = 'info', duration = 5000) {
    if (!globalStatusDiv) { // Check if element is cached
        console.error("Elemento #globalStatus não encontrado!");
        console.log(`[${type.toUpperCase()}] ${message}`);
        if (type === 'error' || type === 'warning') alert(`[${type.toUpperCase()}] ${message}`);
        return;
    }

    clearTimeout(globalStatusTimeout); // Clear previous timeout

    globalStatusDiv.textContent = message;
    globalStatusDiv.className = `status-${type}`; // Set type class
    globalStatusDiv.style.display = 'block'; // Make visible for transition
    // Force reflow to ensure transition plays
    void globalStatusDiv.offsetWidth;
    globalStatusDiv.classList.add('visible'); // Add visible class for transition

    if (duration > 0) {
        globalStatusTimeout = setTimeout(() => {
            globalStatusDiv.classList.remove('visible');
            // Set display to none after transition ends
            setTimeout(() => {
                if (!globalStatusDiv.classList.contains('visible')) {
                     globalStatusDiv.style.display = 'none';
                     globalStatusDiv.className = ''; // Clear classes
                }
            }, 400); // Match CSS transition duration (0.4s)
             globalStatusTimeout = null;
        }, duration);
    }
}

/**
 * Plays a sound identified by its HTML element ID.
 * @param {string} elementId The ID of the <audio> element.
 */
function playSound(elementId) {
    try {
        const audioElement = document.getElementById(elementId);
        if (audioElement instanceof HTMLAudioElement && !audioElement.paused) {
             audioElement.pause(); // Stop if already playing
             audioElement.currentTime = 0;
        }
         if (audioElement instanceof HTMLAudioElement && typeof audioElement.play === 'function') {
             audioElement.play().catch(e => {
                 if (e.name !== 'NotAllowedError') { // Ignore common autoplay block error
                      console.warn(`Não foi possível reproduzir áudio ${elementId}:`, e.message);
                 }
             });
        }
    } catch (error) {
        console.error(`Erro ao reproduzir som ${elementId}:`, error);
    }
}

/**
 * Updates the status message area for a specific vehicle card.
 * @param {string} vehicleId The ID of the vehicle.
 * @param {string} message The message to display.
 * @param {'info'|'success'|'warning'|'error'|'turbo'} statusType Type for styling.
 * @param {number} [duration=4000] Duration in ms.
 */
function updateVehicleStatusUI(vehicleId, message, statusType = 'info', duration = 4000) {
    const statusElement = document.getElementById(`status-${vehicleId}`);
    if (!statusElement) {
        console.warn(`Elemento 'status-${vehicleId}' não encontrado. Usando alerta global.`);
        displayGlobalAlert(`${vehicleId}: ${message}`, statusType, duration);
        return;
    }

    clearTimeout(vehicleStatusTimeouts[vehicleId]); // Clear previous timeout for this vehicle

    statusElement.textContent = message;
    statusElement.dataset.statusType = statusType;
    statusElement.classList.add('visible');

    vehicleStatusTimeouts[vehicleId] = setTimeout(() => {
        statusElement.classList.remove('visible');
         delete vehicleStatusTimeouts[vehicleId];
    }, duration);
}

/**
 * Renders the entire garage display.
 */
function renderizarGaragem() {
    if (!containerCarro || !containerCaminhao || !agendamentosListContainer) {
        console.error("Erro Fatal: Containers HTML essenciais não encontrados! Renderização abortada.");
        return;
    }
    console.log("Renderizando garagem...");

    let carrosHtml = '';
    let caminhoesHtml = '';
    let carrosCount = 0;
    let caminhoesCount = 0;
    const veiculos = minhaGaragem.listarTodosVeiculos();

    veiculos.forEach(v => {
        if (!(v instanceof Vehicle) || !v.id) {
            console.warn("Item inválido na lista de veículos ignorado:", v);
            return;
        }
        const isCarroEsportivo = v instanceof CarroEsportivo;
        const isCaminhao = v instanceof Caminhao;
        let imagePath = 'Imagens/default-vehicle.png';
        if (isCarroEsportivo) imagePath = 'Imagens/carro-imagem.webp';
        else if (isCaminhao) imagePath = 'Imagens/pngtree-red-truck-transport-png-image_11506094.png';

        const veiculoCardHtml = `
            <div class="veiculo-item" id="veiculo-${v.id}">
                <img src="${imagePath}" alt="${v.modelo || 'Veículo'}" loading="lazy" onerror="this.onerror=null; this.src='Imagens/default-vehicle.png';">
                <div class="veiculo-info">
                    <p><strong>${v.modelo || 'Sem Modelo'} (${v.cor || 'Sem Cor'})</strong></p>
                    <p><span class="detail-label">Status:</span> <span class="detail-value">${v.ligado ? 'Ligado' : 'Desligado'}</span></p>
                    <p><span class="detail-label">Velocidade:</span> <span class="detail-value">${v.velocidade.toFixed(1)} km/h</span></p>
                    ${isCarroEsportivo ? `<p><span class="detail-label">Turbo:</span> <span class="detail-value">${v.turboAtivado ? 'Ativado' : 'Desativado'}</span></p>` : ''}
                    ${isCaminhao ? `<p><span class="detail-label">Carga:</span> <span class="detail-value">${v.cargaAtual.toFixed(1)} / ${v.capacidadeCarga.toFixed(1)} kg</span></p>` : ''}
                </div>
                <p id="status-${v.id}" class="status-veiculo" data-status-type="info"></p>
                <div class="button-group-veiculo">
                    <button class="btn-veiculo-ligar" onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''}>Ligar</button>
                    <button class="btn-veiculo-desligar" onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado || v.velocidade > 0 ? 'disabled' : ''}>Desligar</button>
                    <button class="btn-veiculo-acelerar" onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''}>Acelerar</button>
                    <button class="btn-veiculo-frear" onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade === 0 ? 'disabled' : ''}>Frear</button>
                    ${isCarroEsportivo ? `
                        <button class="btn-veiculo-turbo-on" onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')" ${!v.ligado || v.turboAtivado ? 'disabled' : ''}>Turbo ON</button>
                        <button class="btn-veiculo-turbo-off" onclick="executarAcaoVeiculo('${v.id}', 'desativarTurbo')" ${!v.turboAtivado || !v.ligado ? 'disabled' : ''}>Turbo OFF</button>
                    ` : ''}
                    ${isCaminhao ? `
                        <button class="btn-veiculo-carregar" onclick="executarAcaoVeiculo('${v.id}', 'carregar')" ${v.cargaAtual >= v.capacidadeCarga ? 'disabled' : ''}>Carregar</button>
                        <button class="btn-veiculo-descarregar" onclick="executarAcaoVeiculo('${v.id}', 'descarregar')" ${v.cargaAtual === 0 ? 'disabled' : ''}>Descarregar</button>
                    ` : ''}
                    <button class="btn-veiculo-agendar" onclick="mostrarFormAgendamento('${v.id}')">Histórico/Agendar</button>
                    <button class="btn-remover" onclick="removerVeiculoDaGaragem('${v.id}')">Remover</button>
                </div>
                <div class="historico-manutencao">
                    <h4>Histórico de Manutenção:</h4>
                    <ul>${v.getHistoricoFormatado()}</ul>
                </div>
            </div>
        `;
        if (isCarroEsportivo) { carrosHtml += veiculoCardHtml; carrosCount++; }
        else if (isCaminhao) { caminhoesHtml += veiculoCardHtml; caminhoesCount++; }
    });

    // Update DOM
    containerCarro.innerHTML = '<h3>Carros Esportivos</h3>' + (carrosCount > 0 ? carrosHtml : '<p class="empty-list-placeholder">Nenhum carro esportivo na garagem.</p>');
    containerCaminhao.innerHTML = '<h3>Caminhões</h3>' + (caminhoesCount > 0 ? caminhoesHtml : '<p class="empty-list-placeholder">Nenhum caminhão na garagem.</p>');

    // Render Appointments
    const agendamentos = minhaGaragem.listarAgendamentosFuturos();
    if (agendamentos.length > 0) {
        agendamentosListContainer.innerHTML = agendamentos.map(item => {
             if (item?.veiculo instanceof Vehicle && item?.manutencao instanceof Manutencao) {
                 let dataFormatada = 'Data inválida';
                 try { dataFormatada = new Date(item.manutencao.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }); } catch(e){}
                return `<li><strong>${item.veiculo.modelo || 'Veículo'}</strong>: ${item.manutencao.tipo} em ${dataFormatada} (R$ ${item.manutencao.custo.toFixed(2)})</li>`;
             } return '';
        }).join('');
    } else {
        agendamentosListContainer.innerHTML = '<li class="empty-list-placeholder">Nenhum agendamento futuro encontrado.</li>';
    }
    console.log(`Renderização concluída.`);
    verificarAgendamentosProximos(); // Check alerts after render
}

// --- FUNÇÕES DE AÇÃO DO VEÍCULO ---

/** Creates a new vehicle from form input */
function criarNovoVeiculo(tipo) {
    const formIdPrefix = tipo === 'CarroEsportivo' ? 'Esportivo' : 'Caminhao';
    const modeloInput = document.getElementById(`modelo${formIdPrefix}`);
    const corInput = document.getElementById(`cor${formIdPrefix}`);
    const formElement = modeloInput?.closest('.form-adicionar');
    let veiculo;

    try {
        const modelo = modeloInput?.value.trim();
        const cor = corInput?.value.trim();
        if (!modelo) throw new Error(`Modelo é obrigatório.`);
        if (!cor) throw new Error(`Cor é obrigatória.`);

        if (tipo === 'CarroEsportivo') {
            veiculo = new CarroEsportivo(modelo, cor);
        } else if (tipo === 'Caminhao') {
            const capacidadeInput = document.getElementById('capacidadeCaminhao');
            const capacidadeStr = capacidadeInput?.value;
            const capacidade = parseFloat(capacidadeStr);
             if (capacidadeStr === '' || isNaN(capacidade) || capacidade < 0) {
                throw new Error("Capacidade de carga inválida.");
             }
            veiculo = new Caminhao(modelo, cor, capacidade);
        } else {
            throw new Error(`Tipo de veículo desconhecido: ${tipo}`);
        }

        if (minhaGaragem.adicionarVeiculo(veiculo)) {
            displayGlobalAlert(`${veiculo.modelo} (${veiculo._tipoVeiculo}) adicionado!`, 'success');
            renderizarGaragem();
            modeloInput.value = ''; // Clear fields on success
            corInput.value = '';
            if (tipo === 'Caminhao') document.getElementById('capacidadeCaminhao').value = '10000';
            formElement?.classList.remove('form-error-highlight');
        } // Error handled by adicionarVeiculo

    } catch (error) {
        console.error(`Erro ao criar ${tipo}:`, error);
         displayGlobalAlert(`Erro ao criar ${tipo}: ${error.message}`, 'error');
         if(formElement) { // Highlight form on error
             formElement.classList.add('form-error-highlight');
             formElement.querySelector('input, textarea')?.focus();
             setTimeout(() => formElement.classList.remove('form-error-highlight'), 3000);
         }
    }
}

/** Removes a vehicle after confirmation */
function removerVeiculoDaGaragem(idVeiculo) {
     const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
     const nomeVeiculo = veiculo ? `${veiculo.modelo} (${veiculo.cor})` : `ID ${idVeiculo}`;

     if (confirm(`Remover ${nomeVeiculo}?\n\nAção irreversível!`)) {
         if (confirm("CONFIRMAÇÃO FINAL: Apagar este veículo?")) {
             const veiculoCard = document.getElementById(`veiculo-${idVeiculo}`);
             if (minhaGaragem.removerVeiculo(idVeiculo)) {
                 displayGlobalAlert(`Veículo ${nomeVeiculo} removido.`, 'success');
                 if (veiculoCard) { // Animate removal
                     veiculoCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease, height 0.5s ease, margin 0.5s ease, padding 0.5s ease';
                     veiculoCard.style.opacity = '0';
                     veiculoCard.style.transform = 'scale(0.9)';
                     veiculoCard.style.height = '0px';
                     veiculoCard.style.padding = '0';
                     veiculoCard.style.margin = '0';
                     setTimeout(() => renderizarGaragem(), 500); // Re-render after animation
                 } else { renderizarGaragem(); } // Re-render immediately if card not found
             } else {
                 displayGlobalAlert(`Erro: Não foi possível remover ${nomeVeiculo}.`, 'error');
                 renderizarGaragem();
             }
         } else { console.log(`Remoção cancelada (confirmação final).`); }
    } else { console.log(`Remoção cancelada.`); }
}


/** Executes an action on a vehicle */
function executarAcaoVeiculo(idVeiculo, acao, param = null) {
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo) {
        displayGlobalAlert(`Veículo ID ${idVeiculo} não encontrado. Atualizando...`, 'warning', 6000);
        renderizarGaragem();
        return;
    }

    let message = '', statusType = 'info', soundId = null, finalParam = param;

    // Determine default parameters ONLY if param is explicitly null
    if (finalParam === null) {
        switch (acao) {
            case 'acelerar': finalParam = (veiculo instanceof Caminhao) ? 5 : 15; break;
            case 'frear': finalParam = (veiculo instanceof Caminhao) ? 3 : 10; break;
            case 'carregar': finalParam = (veiculo instanceof Caminhao) ? 1000 : 0; break;
            case 'descarregar': finalParam = (veiculo instanceof Caminhao) ? 500 : 0; break;
        }
        if (param === null && finalParam !== null && finalParam !== 0) {
             console.log(`[Ação ${acao}] Valor padrão: ${finalParam}`);
        }
    }

    try {
        if (typeof veiculo[acao] === 'function') {
            message = veiculo[acao](finalParam); // Call method

            // Determine feedback type/sound
            switch (acao) {
                case 'ligar': statusType = 'success'; soundId = 'somLigar'; break;
                case 'desligar': statusType = message.includes('precisa parar') ? 'warning' : 'success'; if(statusType === 'success') soundId = 'somDesligar'; break;
                case 'acelerar': statusType = 'info'; soundId = 'somAcelerar'; break;
                case 'frear': statusType = 'info'; soundId = 'somFrear'; break;
                case 'ativarTurbo': statusType = 'turbo'; soundId = 'somAcelerar'; break;
                case 'desativarTurbo': statusType = 'info'; break;
                case 'carregar': statusType = message.includes('excedida') || message.includes('máxima') ? 'warning' : 'success'; break;
                case 'descarregar': statusType = 'success'; break;
                default: statusType = 'info';
            }
             // Override status if message indicates user error
             if (message.toLowerCase().includes('inválido') || message.toLowerCase().includes('precisa estar') || message.toLowerCase().includes('não é possível')) {
                 statusType = 'warning';
             }

            if (soundId) playSound(soundId);
            updateVehicleStatusUI(idVeiculo, message, statusType);
            minhaGaragem.salvar(); // Save state change
            renderizarGaragem(); // Update UI completely

        } else {
            message = `Ação '${acao}' desconhecida para ${veiculo.modelo}.`;
            statusType = 'error';
            console.error(message, veiculo);
            updateVehicleStatusUI(idVeiculo, message, statusType, 6000);
        }
    } catch (error) {
        console.error(`Erro na ação '${acao}' (${idVeiculo}):`, error);
        message = `Erro em '${acao}': ${error.message || 'Erro desconhecido'}`;
        statusType = 'error';
        updateVehicleStatusUI(idVeiculo, message, statusType, 6000);
        renderizarGaragem(); // Re-render to potentially reset state
    }
}

// --- FUNÇÕES DE AGENDAMENTO / HISTÓRICO ---

/** Clears form validation errors visually */
 function clearFormErrors(formElement) {
     if (!formElement) return;
     formElement.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
     formElement.querySelectorAll('.error-message').forEach(el => el.remove());
 }

 /** Shows validation error message for a field */
 function showFieldError(inputElement, message) {
     const formGroup = inputElement?.closest('.form-group');
     if (!formGroup) return;
     formGroup.querySelector('.error-message')?.remove(); // Remove old one
     formGroup.classList.add('error');
     const errorSpan = document.createElement('span');
     errorSpan.className = 'error-message';
     errorSpan.setAttribute('role', 'alert');
     errorSpan.textContent = message;
     formGroup.querySelector('small')?.after(errorSpan) || inputElement.after(errorSpan);
 }

/** Displays the maintenance modal */
function mostrarFormAgendamento(idVeiculo) {
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo || !agendamentoModal || !formAgendamento || !agendamentoTituloVeiculo || !agendamentoVeiculoIdInput || !agendamentoDataInput) {
        displayGlobalAlert("Erro ao abrir formulário de agendamento.", "error");
        console.error("Veículo ou elementos do modal não encontrados.");
        return;
    }

    agendamentoVeiculoIdInput.value = idVeiculo;
    agendamentoTituloVeiculo.textContent = `Histórico / Agendar: ${veiculo.modelo}`;
    formAgendamento.reset();
    clearFormErrors(formAgendamento);

    // Set min/default date
    try {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        now.setSeconds(0); now.setMilliseconds(0);
        const minDateTimeStr = now.toISOString().slice(0, 16);
        agendamentoDataInput.min = minDateTimeStr;
        agendamentoDataInput.value = minDateTimeStr; // Default to now
    } catch(e) {
        console.error("Erro ao definir data/hora:", e);
        agendamentoDataInput.min = new Date().toISOString().split("T")[0]; // Fallback min
        agendamentoDataInput.value = '';
    }

    // TODO: Populate history list in modal if needed

    agendamentoModal.style.display = 'block';
    agendamentoModal.setAttribute('aria-hidden', 'false');
    agendamentoTipoInput.focus(); // Focus first main field
}

/** Closes the maintenance modal */
function fecharFormAgendamento() {
     if (agendamentoModal) {
        agendamentoModal.style.display = 'none';
        agendamentoModal.setAttribute('aria-hidden', 'true');
    }
    if (formAgendamento) formAgendamento.reset();
    if (agendamentoVeiculoIdInput) agendamentoVeiculoIdInput.value = '';
    clearFormErrors(formAgendamento);
}

/** Handles saving maintenance/appointment */
function salvarAgendamento(event) {
    event.preventDefault();
    clearFormErrors(formAgendamento);

    const veiculoId = agendamentoVeiculoIdInput.value;
    const data = agendamentoDataInput.value;
    const tipo = agendamentoTipoInput.value.trim();
    const custoStr = agendamentoCustoInput.value;
    const descricao = agendamentoDescricaoInput.value.trim();
    const veiculo = minhaGaragem.encontrarVeiculoPorId(veiculoId);

    if (!veiculo) {
        displayGlobalAlert("Erro Crítico: Veículo não existe mais!", "error", 8000);
        fecharFormAgendamento(); renderizarGaragem(); return;
    }

    // Validation
    let isValid = true;
    if (!data) { showFieldError(agendamentoDataInput, "Data e Hora obrigatórios."); isValid = false; }
    else { try { if (isNaN(new Date(data).getTime())) { showFieldError(agendamentoDataInput, "Formato inválido."); isValid = false; }} catch (e) { showFieldError(agendamentoDataInput, "Erro data."); isValid = false; }}
    if (!tipo) { showFieldError(agendamentoTipoInput, "Tipo obrigatório."); isValid = false; }
    const custoNum = parseFloat(custoStr);
    if (custoStr === '' || isNaN(custoNum) || custoNum < 0) { showFieldError(agendamentoCustoInput, "Custo obrigatório (0+)."); isValid = false; }

    if (!isValid) {
         displayGlobalAlert("Corrija os erros no formulário.", "warning");
         formAgendamento.querySelector('.form-group.error input, .form-group.error textarea')?.focus();
        return;
    }

    try {
        const novaManutencao = new Manutencao(data, tipo, custoNum, descricao, veiculoId);
        if (veiculo.adicionarManutencao(novaManutencao)) {
             minhaGaragem.salvar();
             renderizarGaragem();
             fecharFormAgendamento();
             displayGlobalAlert("Registro salvo!", "success");
        } else { displayGlobalAlert("Falha ao adicionar registro.", "error"); }
    } catch (error) {
        console.error("Erro ao salvar registro:", error);
        displayGlobalAlert(`Erro: ${error.message || 'Verifique os dados.'}`, "error", 7000);
    }
}

// --- VERIFICAÇÃO DE AGENDAMENTOS PRÓXIMOS ---

/** Checks and alerts for upcoming appointments */
function verificarAgendamentosProximos() {
    if (minhaGaragem.listarTodosVeiculos().length === 0 || !globalStatusDiv) return;

    const agendamentosFuturos = minhaGaragem.listarAgendamentosFuturos();
    if (agendamentosFuturos.length === 0) return;

    const agora = new Date();
    const amanhaFimDoDia = new Date(agora); // Clone 'agora'
    amanhaFimDoDia.setDate(agora.getDate() + 1);
    amanhaFimDoDia.setHours(23, 59, 59, 999);
    const hojeStr = agora.toDateString();

    // Reset daily alert tracking if needed
    if (!alertadosHoje.has(hojeStr)) {
        console.log("Novo dia, resetando alertas diários.");
        alertadosHoje.clear();
        alertadosHoje.add(hojeStr);
    }

    let alertsShownThisCheck = 0;
    agendamentosFuturos.forEach(item => {
         if (!(item?.manutencao instanceof Manutencao) || !item.manutencao.id || !(item?.veiculo instanceof Vehicle)) return;
         const manutId = item.manutencao.id;
         if (alertadosHoje.has(manutId)) return; // Skip if alerted today

        try {
            const dataManutencao = new Date(item.manutencao.data);
            if (isNaN(dataManutencao.getTime())) return; // Skip invalid dates

            if (dataManutencao >= agora && dataManutencao <= amanhaFimDoDia) {
                 const dataHoraFormatada = dataManutencao.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'});
                 const diaFormatado = dataManutencao.toDateString() === hojeStr ? "HOJE" : "Amanhã";
                 displayGlobalAlert(
                     `Lembrete (${diaFormatado}): ${item.veiculo.modelo} - "${item.manutencao.tipo}" às ${dataHoraFormatada}!`,
                     'warning', 15000
                 );
                 alertadosHoje.add(manutId); // Mark alerted
                 alertsShownThisCheck++;
            }
        } catch (e) { /* Ignore date processing errors silently */ }
    });
     // if(alertsShownThisCheck > 0) console.log(`${alertsShownThisCheck} alertas exibidos.`);
}

// --- EVENT LISTENERS E INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Inicializando Garagem v3.1...");

    // --- Cache DOM Elements ---
    globalStatusDiv = document.getElementById('globalStatus');
    containerCarro = document.getElementById('listaCarros');
    containerCaminhao = document.getElementById('listaCaminhoes');
    agendamentosListContainer = document.getElementById('agendamentosFuturosLista');
    agendamentoModal = document.getElementById('agendamentoModal');
    formAgendamento = document.getElementById('formAgendamento');
    agendamentoTituloVeiculo = document.getElementById('agendamentoTituloVeiculo');
    agendamentoVeiculoIdInput = document.getElementById('agendamentoVeiculoId');
    agendamentoDataInput = document.getElementById('agendamentoData');
    agendamentoTipoInput = document.getElementById('agendamentoTipo');
    agendamentoCustoInput = document.getElementById('agendamentoCusto');
    agendamentoDescricaoInput = document.getElementById('agendamentoDescricao');

    // --- Initialize Garage ---
    minhaGaragem = new Garagem(); // Initialize the garage instance
    try {
        minhaGaragem.carregar();
    } catch (e) {
         console.error("Erro Fatal no carregamento inicial:", e);
         displayGlobalAlert("ERRO GRAVE AO CARREGAR DADOS. Verifique console.", "error", 0);
    }

    // --- Initial Render ---
    try {
        renderizarGaragem();
    } catch (renderError) {
         console.error("Erro Fatal na renderização inicial:", renderError);
         displayGlobalAlert("ERRO GRAVE AO EXIBIR GARAGEM.", "error", 0);
    }

    // --- Setup Event Listeners ---
    document.getElementById('criarCarroEsportivoBtn')?.addEventListener('click', () => criarNovoVeiculo('CarroEsportivo'));
    document.getElementById('criarCaminhaoBtn')?.addEventListener('click', () => criarNovoVeiculo('Caminhao'));

    if (formAgendamento) {
        formAgendamento.addEventListener('submit', salvarAgendamento);
        formAgendamento.querySelector('button[type="button"].btn-secondary')?.addEventListener('click', fecharFormAgendamento);
    }

    if (agendamentoModal) {
         agendamentoModal.querySelector('.close-button')?.addEventListener('click', fecharFormAgendamento);
         agendamentoModal.addEventListener('click', (event) => { if (event.target === agendamentoModal) fecharFormAgendamento(); });
    }
     document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && agendamentoModal?.style.display === 'block') fecharFormAgendamento(); });

    document.getElementById('limparStorageBtn')?.addEventListener('click', () => {
        if (confirm("ATENÇÃO!\nLimpar TODOS os dados salvos?\nAÇÃO IRREVERSÍVEL!")) {
             if (confirm("CONFIRMAÇÃO FINAL: Apagar TUDO?")) {
                 try {
                     localStorage.removeItem(minhaGaragem.storageKey);
                     minhaGaragem = new Garagem(); // Re-initialize empty
                     alertadosHoje.clear(); vehicleStatusTimeouts = {};
                     renderizarGaragem();
                     displayGlobalAlert("Dados limpos.", "info");
                     console.log(`LocalStorage (${minhaGaragem.storageKey}) limpo.`);
                 } catch(e) { console.error("Erro ao limpar LocalStorage:", e); displayGlobalAlert("Erro ao limpar dados.", "error"); }
             } else { console.log("Limpeza cancelada."); }
        } else { console.log("Limpeza cancelada."); }
    });

    // --- Periodic Check ---
    const checkIntervalMinutes = 5;
    setInterval(verificarAgendamentosProximos, checkIntervalMinutes * 60 * 1000);
    console.log(`Verificação periódica de agendamentos ativa (intervalo: ${checkIntervalMinutes} min).`);

    console.log("Inicialização Garagem v3.1 concluída.");
    displayGlobalAlert("Garagem pronta!", "success", 3000);
});