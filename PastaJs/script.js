// script.js

// --- CLASSES ---

// Assume Manutencao class is defined in manutencao.js and loaded correctly.
// If not, you need to include its definition here or load it.
/*
// Example Manutencao class definition if not in separate file:
class Manutencao {
    constructor(data, tipo, custo, descricao = '', veiculoId = '') {
        if (!this.validarData(data)) throw new Error("Data inválida.");
        if (typeof tipo !== 'string' || !tipo.trim()) throw new Error("Tipo inválido.");
        const numCusto = parseFloat(custo);
        if (isNaN(numCusto) || numCusto < 0) throw new Error("Custo inválido.");
        this.data = data; this.tipo = tipo.trim(); this.custo = numCusto;
        this.descricao = descricao.trim(); this.veiculoId = veiculoId;
        this.id = `man_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    }
    validarData(dataStr) { return dataStr && !isNaN(new Date(dataStr).getTime()); }
    formatar() {
        try {
            const dt = new Date(this.data).toLocaleString('pt-BR', {dateStyle:'short', timeStyle:'short'});
            const cst = this.custo.toLocaleString('pt-BR', {style:'currency', currency:'BRL'});
            return `<strong>${this.tipo}</strong> em ${dt} - ${cst}${this.descricao ? ` (${this.descricao})` : ''}`;
        } catch(e) { return `Erro ao formatar: ${this.tipo}`; }
    }
    toJSON() { return {...this, _class: 'Manutencao'}; }
    static fromJSON(obj) {
        if (!obj || obj._class !== 'Manutencao') return null;
        try { return new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao, obj.veiculoId); }
        catch(e) { console.error("Erro Manutencao.fromJSON:", e, obj); return null; }
    }
}
*/


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
         // Check if Manutencao class exists before using instanceof
         if (typeof Manutencao === 'undefined' || !(manutencaoObj instanceof Manutencao)) {
            console.error("Objeto inválido ou classe Manutencao não definida. Não é possível adicionar manutenção.", manutencaoObj);
            displayGlobalAlert("Erro interno: Tipo de registro de manutenção inválido ou não definido.", "error");
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
        // Check if Manutencao exists before filtering/mapping
        if (typeof Manutencao === 'undefined') {
            return "<li class='empty-history error'>Erro: Classe Manutencao não definida.</li>";
        }

        const historyItems = this.historicoManutencao
                 .filter(m => m instanceof Manutencao && typeof m.formatar === 'function') // Ensure formatar exists
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
                                     .filter(m => typeof Manutencao !== 'undefined' && m instanceof Manutencao && typeof m.toJSON === 'function')
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
             // Decide whether to return null or proceed without history
             // return null; // Stricter approach
             console.warn("Continuando reconstrução do veículo sem histórico de manutenção.");
        }

        let vehicle = null;
        try {
            // Instantiate the correct subclass based on _tipoVeiculo
            switch (data._tipoVeiculo) {
                case 'CarroEsportivo':
                    // Ensure CarroEsportivo class exists
                    if (typeof CarroEsportivo === 'undefined') throw new Error("Classe CarroEsportivo não definida.");
                    vehicle = new CarroEsportivo(data.modelo || 'Modelo Desconhecido', data.cor || 'Cor Desconhecida', data.id);
                    if (typeof data.turboAtivado === 'boolean') vehicle.turboAtivado = data.turboAtivado;
                    break;
                case 'Caminhao':
                     // Ensure Caminhao class exists
                     if (typeof Caminhao === 'undefined') throw new Error("Classe Caminhao não definida.");
                    const capacidade = typeof data.capacidadeCarga === 'number' && data.capacidadeCarga >= 0 ? data.capacidadeCarga : 0;
                    vehicle = new Caminhao(data.modelo || 'Modelo Desconhecido', data.cor || 'Cor Desconhecida', capacidade, data.id);
                     if (typeof data.cargaAtual === 'number') {
                        // Validate cargaAtual against potentially different capacidadeCarga if loaded data is inconsistent
                        vehicle.cargaAtual = Math.min(Math.max(0, data.cargaAtual), vehicle.capacidadeCarga);
                     }
                    break;
                case 'Veiculo': // Fallback for base Vehicle class
                default: // Handle unknown types gracefully
                    if (data._tipoVeiculo !== 'Veiculo') {
                        console.warn(`Tipo de veículo desconhecido ('${data._tipoVeiculo}') encontrado durante a reconstrução. Tratando como Veículo base.`);
                    }
                     // Ensure Vehicle class exists
                     if (typeof Vehicle === 'undefined') throw new Error("Classe Vehicle base não definida.");
                    vehicle = new Vehicle(data.modelo || 'Modelo Desconhecido', data.cor || 'Cor Desconhecida', data.id);
                    // Preserve original type string if it was unknown, in case it's useful for debugging
                    if (data._tipoVeiculo !== 'Veiculo') vehicle._tipoVeiculo = data._tipoVeiculo;
                    break;
            }

            // Restore common properties carefully, checking types
            vehicle.ligado = typeof data.ligado === 'boolean' ? data.ligado : false;
            vehicle.velocidade = typeof data.velocidade === 'number' ? Math.max(0, data.velocidade) : 0; // Ensure non-negative

            // Reconstruct Manutencao objects only if Manutencao.fromJSON is available
            if (typeof Manutencao?.fromJSON === 'function' && Array.isArray(data.historicoManutencao)) {
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
                 vehicle.historicoManutencao = []; // Initialize as empty if missing, invalid, or Manutencao not available
            }

            return vehicle;

        } catch (error) {
             // Catch errors during instantiation or property assignment
             console.error(`Erro crítico ao reconstruir veículo (ID: ${data.id}, Tipo: '${data._tipoVeiculo}') a partir de JSON:`, error, data);
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
        // If super.desligar returned an error message (shouldn't happen if speed is 0)
        return msgBase;
    }

    exibirInformacoes() {
        // Make sure super method exists before calling
        const baseInfo = typeof super.exibirInformacoesBase === 'function' ? super.exibirInformacoesBase() : `Modelo: ${this.modelo}`;
        return `${baseInfo}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
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
        // Default to 0 if invalid
        this.capacidadeCarga = (!isNaN(capNum) && capNum >= 0) ? capNum : 0;
        if (this.capacidadeCarga !== parseFloat(capacidadeCarga) && parseFloat(capacidadeCarga) >= 0) { // Warn if value was changed due to invalid input but was not negative
            console.warn(`Capacidade de carga inválida ou não numérica (${capacidadeCarga}) para ${modelo}, definida para ${this.capacidadeCarga}kg.`);
        } else if (capNum < 0) {
             console.warn(`Capacidade de carga negativa (${capacidadeCarga}) inválida para ${modelo}, definida para ${this.capacidadeCarga}kg.`);
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
             // Avoid showing negative capacity if constructor fixed it
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

         if (this.cargaAtual <= 0) { // Check <= 0 for robustness
              this.cargaAtual = 0; // Ensure it's exactly 0 if it somehow became negative
              return `${this.modelo} está vazio, não há o que descarregar.`;
         }

         const descarregado = Math.min(quantNum, this.cargaAtual); // Cannot discharge more than available
         this.cargaAtual -= descarregado;
         // Ensure cargaAtual doesn't go below zero due to floating point issues
         this.cargaAtual = Math.max(0, this.cargaAtual);
         return `${this.modelo} descarregado em ${descarregado.toFixed(1)} kg. Carga atual: ${this.cargaAtual.toFixed(1)}/${this.capacidadeCarga.toFixed(1)} kg.`;
    }

    exibirInformacoes() {
         // Make sure super method exists before calling
         const baseInfo = typeof super.exibirInformacoesBase === 'function' ? super.exibirInformacoesBase() : `Modelo: ${this.modelo}`;
        return `${baseInfo}, Capacidade: ${this.capacidadeCarga.toFixed(1)} kg, Carga Atual: ${this.cargaAtual.toFixed(1)} kg`;
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
// Assume Garagem class is defined in garagem.js and loaded correctly.
/*
// Example Garagem class definition if not in separate file:
class Garagem {
    constructor() {
        this.veiculos = [];
        this.storageKey = 'garagemInteligente_v3_1_refactored_api'; // Updated key
        console.log(`Garagem inicializada. Usando chave de armazenamento: ${this.storageKey}`);
    }
    adicionarVeiculo(veiculo) { // ... (implementation as provided) ... }
    removerVeiculo(idVeiculo) { // ... (implementation as provided) ... }
    encontrarVeiculoPorId(idVeiculo) { // ... (implementation as provided) ... }
    salvar() { // ... (implementation as provided) ... }
    carregar() { // ... (implementation as provided) ... }
    listarTodosVeiculos() { // ... (implementation as provided) ... }
    listarAgendamentosFuturos() { // ... (implementation as provided) ... }
}
*/


// --- VARIÁVEIS GLOBAIS E ESTADO DA UI ---
let minhaGaragem; // Will be initialized in DOMContentLoaded
let globalStatusTimeout = null;
let vehicleStatusTimeouts = {};
let alertadosHoje = new Set();

// Cache DOM elements frequently accessed (will be assigned in DOMContentLoaded)
let globalStatusDiv, containerCarro, containerCaminhao, agendamentosListContainer,
    agendamentoModal, formAgendamento, agendamentoTituloVeiculo,
    agendamentoVeiculoIdInput, agendamentoDataInput, agendamentoTipoInput,
    agendamentoCustoInput, agendamentoDescricaoInput,
    // New elements for planner (simple weather)
    destinoInput, climaBtn, previsaoResultadoDiv;


// --- CONSTANTES ---
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! ATENÇÃO: NUNCA COLOQUE SUA CHAVE DE API REAL DIRETAMENTE NO CÓDIGO  !!!
// !!! DE FRONTEND EM UM PROJETO DE PRODUÇÃO! ELA FICARÁ EXPOSTA!         !!!
// !!! Para este exercício de APRENDIZADO, faremos isso, mas em um        !!!
// !!! projeto real, use um backend proxy ou variáveis de ambiente        !!!
// !!! seguras durante o build.                                           !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const OPENWEATHER_API_KEY = "32ad5f39fc17a3b18cec5953e7a3227e"; // <-- Chave para previsão SIMPLES

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! ATENÇÃO: ARMAZENAR A API KEY DIRETAMENTE NO CÓDIGO FRONTEND É INSEGURO!
// !!! Em uma aplicação real, a chave NUNCA deve ficar exposta aqui.
// !!! A forma correta envolve um backend (Node.js, Serverless) atuando como proxy.
// !!! Para FINS DIDÁTICOS nesta atividade, vamos usá-la aqui temporariamente.
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const OPENWEATHER_API_KEY_DETALHADA = "SUA_CHAVE_OPENWEATHERMAP_AQUI"; // <-- SUBSTITUA PELA SUA CHAVE REAL para previsão DETALHADA


// --- FUNÇÕES AUXILIARES UI ---

/**
 * Displays a global status message to the user.
 * @param {string} message The message to display.
 * @param {'info'|'success'|'warning'|'error'} type The type of message (affects styling).
 * @param {number} [duration=5000] How long to display the message in ms. 0 for permanent.
 */
function displayGlobalAlert(message, type = 'info', duration = 5000) {
    if (!globalStatusDiv) { // Check if element is cached
        console.error("Elemento #globalStatus não encontrado! Mensagem:", `[${type.toUpperCase()}] ${message}`);
        // Fallback to simple alert for critical errors if div missing
        if (type === 'error' || type === 'warning') {
             alert(`[${type.toUpperCase()}] ${message}`);
        }
        return;
    }

    clearTimeout(globalStatusTimeout); // Clear previous timeout

    globalStatusDiv.textContent = message;
    // Reset classes before adding new ones
    globalStatusDiv.className = '';
    globalStatusDiv.classList.add(`status-${type}`); // Set type class for styling

    globalStatusDiv.style.display = 'block'; // Make visible before adding transition class
    // Force reflow/repaint to ensure transition plays from hidden state
    void globalStatusDiv.offsetWidth;
    globalStatusDiv.classList.add('visible'); // Add visible class for transition effect

    // Hide after duration if duration is positive
    if (duration > 0) {
        globalStatusTimeout = setTimeout(() => {
            globalStatusDiv.classList.remove('visible');
            // Use transitionend event listener for cleaner removal after transition
             globalStatusDiv.addEventListener('transitionend', function handler() {
                 // Only hide if the 'visible' class is still removed (prevent race conditions)
                 if (!globalStatusDiv.classList.contains('visible')) {
                     globalStatusDiv.style.display = 'none';
                     globalStatusDiv.className = ''; // Clear classes fully
                 }
                 globalStatusDiv.removeEventListener('transitionend', handler); // Clean up listener
             }, { once: true }); // Ensure listener runs only once per timeout
             globalStatusTimeout = null; // Reset timeout ID
        }, duration);
    } else {
        // If duration is 0 or negative, ensure it stays visible without timeout
        globalStatusDiv.classList.add('visible');
        globalStatusDiv.style.display = 'block';
    }
}

/**
 * Plays a sound identified by its HTML element ID. Includes error handling.
 * @param {string} elementId The ID of the <audio> element.
 */
function playSound(elementId) {
    try {
        const audioElement = document.getElementById(elementId);
        // Check if it's a valid audio element
        if (!(audioElement instanceof HTMLAudioElement)) {
            // console.warn(`Elemento de áudio com ID '${elementId}' não encontrado ou não é <audio>.`);
            return;
        }

        // Stop and reset if already playing
        if (!audioElement.paused) {
             audioElement.pause();
             audioElement.currentTime = 0;
        }

        // Check if ready state allows playing (optional, but can prevent some errors)
        // HAVE_METADATA (1) or HAVE_CURRENT_DATA (2) should be enough to start play
        if (audioElement.readyState >= 1) {
             // Play returns a Promise
             const playPromise = audioElement.play();
             if (playPromise !== undefined) {
                 playPromise.catch(error => {
                     // Ignore user-not-interacted errors, log others
                     if (error.name === 'NotAllowedError') {
                        // console.log("Reprodução de áudio bloqueada pelo navegador (requer interação do usuário).");
                     } else {
                          console.warn(`Não foi possível reproduzir áudio '${elementId}':`, error.message);
                     }
                 });
             }
        } else {
            // If not ready, listen for when it can play (optional robustness)
            audioElement.addEventListener('canplay', () => {
                const playPromise = audioElement.play();
                if(playPromise !== undefined) {
                    playPromise.catch(e => { /* handle errors as above */ });
                }
            }, { once: true }); // Play only once when ready
        }

    } catch (error) {
        console.error(`Erro inesperado ao tentar reproduzir som '${elementId}':`, error);
    }
}


/**
 * Updates the status message area for a specific vehicle card.
 * @param {string} vehicleId The ID of the vehicle.
 * @param {string} message The message to display.
 * @param {'info'|'success'|'warning'|'error'|'turbo'} statusType Type for styling.
 * @param {number} [duration=4000] Duration in ms. 0 for permanent.
 */
function updateVehicleStatusUI(vehicleId, message, statusType = 'info', duration = 4000) {
    const statusElement = document.getElementById(`status-${vehicleId}`);
    if (!statusElement) {
        console.warn(`Elemento 'status-${vehicleId}' não encontrado. Usando alerta global.`);
        // Try to show related vehicle model in global alert if possible
        const vehicle = minhaGaragem?.encontrarVeiculoPorId(vehicleId);
        const prefix = vehicle ? `${vehicle.modelo}: ` : `Veículo ${vehicleId}: `;
        displayGlobalAlert(prefix + message, statusType, duration);
        return;
    }

    clearTimeout(vehicleStatusTimeouts[vehicleId]); // Clear previous timeout for this vehicle

    statusElement.textContent = message;
    statusElement.dataset.statusType = statusType; // Use data attribute for styling consistency

    // Ensure visible class is added *after* content/type update
    statusElement.classList.add('visible');

    if (duration > 0) {
        vehicleStatusTimeouts[vehicleId] = setTimeout(() => {
            statusElement.classList.remove('visible');
            // Optional: Clear text after fade out using transitionend
             statusElement.addEventListener('transitionend', function handler() {
                 if (!statusElement.classList.contains('visible')) {
                    statusElement.textContent = ''; // Clear text only if still hidden
                 }
                 statusElement.removeEventListener('transitionend', handler); // Clean up
             }, { once: true });
             delete vehicleStatusTimeouts[vehicleId]; // Clean up timeout id
        }, duration);
    }
     // If duration is 0 or negative, it remains visible indefinitely
}

// ========================================================================= //
// ===                   FUNÇÃO renderizarGaragem                          === //
// ========================================================================= //
/**
 * Renders the entire garage display, including vehicle cards, "Detalhes Extras" button,
 * and placeholder divs. Includes defensive checks and logging.
 */
function renderizarGaragem() {
    console.log("Iniciando renderizarGaragem...");

    if (!containerCarro || !containerCaminhao || !agendamentosListContainer) {
        console.error("ERRO FATAL: Containers HTML essenciais não encontrados! Renderização abortada.");
        if(globalStatusDiv) displayGlobalAlert("Erro crítico ao carregar interface da garagem.", "error", 0);
        return;
    }

    let carrosHtml = '';
    let caminhoesHtml = '';
    let carrosCount = 0;
    let caminhoesCount = 0;
    let veiculos = [];

    if (minhaGaragem instanceof Garagem && typeof minhaGaragem.listarTodosVeiculos === 'function') {
        try {
            veiculos = minhaGaragem.listarTodosVeiculos();
            console.log(`Garagem contém ${veiculos.length} veículo(s).`);
        } catch (listError) {
            console.error("Erro ao listar veículos da garagem:", listError);
            displayGlobalAlert("Erro interno ao buscar lista de veículos.", "error");
        }
    } else {
        console.error("Instância 'minhaGaragem' não é válida. Renderizando garagem vazia.");
        if(globalStatusDiv) displayGlobalAlert("Erro interno: Instância da Garagem inválida.", "error", 0);
    }

    veiculos.forEach((v, index) => {
        console.log(`Processando veículo ${index + 1}/${veiculos.length}: ID ${v?.id}`);
        if (!(v instanceof Vehicle) || !v.id || typeof v.modelo !== 'string' || typeof v._tipoVeiculo !== 'string') {
            console.warn("Item inválido na lista de veículos ignorado:", index, v);
            return;
        }

        const CarroEsportivoDefined = typeof CarroEsportivo !== 'undefined';
        const CaminhaoDefined = typeof Caminhao !== 'undefined';
        const isCarroEsportivo = CarroEsportivoDefined && v instanceof CarroEsportivo;
        const isCaminhao = CaminhaoDefined && v instanceof Caminhao;

        let imagePath = 'Imagens/default-vehicle.png';
        try {
             if (isCarroEsportivo) imagePath = 'Imagens/carro-imagem.webp';
             else if (isCaminhao) imagePath = 'Imagens/pngtree-red-truck-transport-png-image_11506094.png';
        } catch (e) { console.error(`Erro ao determinar imagem para ${v.id}:`, e); }

        try {
            const historicoHtml = typeof v.getHistoricoFormatado === 'function' ? v.getHistoricoFormatado() : "<li class='empty-history error'>Erro histórico.</li>";
            const velocidadeFormatada = typeof v.velocidade === 'number' ? v.velocidade.toFixed(1) : '0.0';
            const cargaAtualFormatada = (isCaminhao && typeof v.cargaAtual === 'number') ? v.cargaAtual.toFixed(1) : 'N/A';
            const capacidadeCargaFormatada = (isCaminhao && typeof v.capacidadeCarga === 'number') ? v.capacidadeCarga.toFixed(1) : 'N/A';
            const turboStatus = (isCarroEsportivo && typeof v.turboAtivado === 'boolean') ? (v.turboAtivado ? 'Ativado' : 'Desativado') : 'N/A';

            const veiculoCardHtml = `
                <div class="veiculo-item" id="veiculo-${v.id}" data-tipo="${v._tipoVeiculo}">
                    <img src="${imagePath}" alt="Imagem de ${v.modelo || 'Veículo'}" loading="lazy" onerror="this.onerror=null; this.src='Imagens/default-vehicle.png'; this.alt='Imagem padrão';">
                    <div class="veiculo-info">
                        <p><strong>${v.modelo || 'Sem Modelo'} (${v.cor || 'Sem Cor'})</strong></p>
                        <p><span class="detail-label">Status:</span> <span class="detail-value">${v.ligado ? 'Ligado' : 'Desligado'}</span></p>
                        <p><span class="detail-label">Velocidade:</span> <span class="detail-value">${velocidadeFormatada} km/h</span></p>
                        ${isCarroEsportivo ? `<p><span class="detail-label">Turbo:</span> <span class="detail-value">${turboStatus}</span></p>` : ''}
                        ${isCaminhao ? `<p><span class="detail-label">Carga:</span> <span class="detail-value">${cargaAtualFormatada} / ${capacidadeCargaFormatada} kg</span></p>` : ''}
                    </div>
                    <p id="status-${v.id}" class="status-veiculo" data-status-type="info" aria-live="polite"></p>
                    <div class="button-group-veiculo">
                        <button class="btn-veiculo-ligar" onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''} title="Ligar">Ligar</button>
                        <button class="btn-veiculo-desligar" onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado || v.velocidade > 0 ? 'disabled' : ''} title="Desligar">Desligar</button>
                        <button class="btn-veiculo-acelerar" onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''} title="Acelerar">Acelerar</button>
                        <button class="btn-veiculo-frear" onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade <= 0 ? 'disabled' : ''} title="Frear">Frear</button>
                        ${isCarroEsportivo ? `
                            <button class="btn-veiculo-turbo-on" onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')" ${!v.ligado || v.turboAtivado ? 'disabled' : ''} title="Turbo ON">Turbo ON</button>
                            <button class="btn-veiculo-turbo-off" onclick="executarAcaoVeiculo('${v.id}', 'desativarTurbo')" ${!v.ligado || !v.turboAtivado ? 'disabled' : ''} title="Turbo OFF">Turbo OFF</button>
                        ` : ''}
                        ${isCaminhao ? `
                            <button class="btn-veiculo-carregar" onclick="executarAcaoVeiculo('${v.id}', 'carregar')" ${(typeof v.cargaAtual !== 'number' || typeof v.capacidadeCarga !== 'number' || v.cargaAtual >= v.capacidadeCarga) ? 'disabled' : ''} title="Carregar">Carregar</button>
                            <button class="btn-veiculo-descarregar" onclick="executarAcaoVeiculo('${v.id}', 'descarregar')" ${(typeof v.cargaAtual !== 'number' || v.cargaAtual <= 0) ? 'disabled' : ''} title="Descarregar">Descarregar</button>
                        ` : ''}
                        <button class="btn-veiculo-agendar" onclick="mostrarFormAgendamento('${v.id}')" title="Histórico/Agendar">Histórico/Agendar</button>
                        <button class="btn-detalhes-api" onclick="mostrarDetalhesVeiculo('${v.id}')" id="btn-detalhes-${v.id}" title="Detalhes Extras">Ver Detalhes Extras</button>
                        <button class="btn-remover" onclick="removerVeiculoDaGaragem('${v.id}')" title="Remover">Remover</button>
                    </div>
                    <div class="detalhes-api-resultado" id="detalhes-${v.id}" aria-live="polite" style="display: none;"></div>
                    <div class="historico-manutencao">
                        <h4>Histórico de Manutenção:</h4>
                        <ul>${historicoHtml}</ul>
                    </div>
                </div>
            `;
             if (isCarroEsportivo) { carrosHtml += veiculoCardHtml; carrosCount++; }
             else if (isCaminhao) { caminhoesHtml += veiculoCardHtml; caminhoesCount++; }
        } catch (cardError) {
             console.error(`Erro ao gerar card HTML para ${v?.id}:`, cardError);
             const errorCardHtml = `<div class="veiculo-item error-placeholder"><p>Erro ao carregar dados do veículo ${v?.id || 'desconhecido'}.</p></div>`;
             if (isCarroEsportivo) { carrosHtml += errorCardHtml; }
             else if (isCaminhao) { caminhoesHtml += errorCardHtml; }
        }
    });

    console.log(`HTML gerado. Carros: ${carrosCount}, Caminhões: ${caminhoesCount}. Atualizando DOM...`);

    try {
        if (containerCarro) {
            containerCarro.innerHTML = `<h3>Carros Esportivos (${carrosCount})</h3>` +
                                       (carrosCount > 0 ? carrosHtml : '<p class="empty-list-placeholder">Nenhum carro esportivo.</p>');
        }
        if (containerCaminhao) {
            containerCaminhao.innerHTML = `<h3>Caminhões (${caminhoesCount})</h3>` +
                                          (caminhoesCount > 0 ? caminhoesHtml : '<p class="empty-list-placeholder">Nenhum caminhão.</p>');
        }
    } catch (domError) {
         console.error("Erro CRÍTICO ao atualizar innerHTML:", domError);
         if(globalStatusDiv) displayGlobalAlert("Erro ao exibir veículos. Verifique console.", "error", 0);
         return;
    }

    try {
        const ManutencaoAvailable = typeof Manutencao !== 'undefined';
        let agendamentos = [];
         if (minhaGaragem instanceof Garagem && typeof minhaGaragem.listarAgendamentosFuturos === 'function') {
             agendamentos = minhaGaragem.listarAgendamentosFuturos();
         }

        if (agendamentosListContainer) {
            if (agendamentos.length > 0) {
                agendamentosListContainer.innerHTML = agendamentos.map(item => {
                     if (item?.veiculo instanceof Vehicle && item.veiculo.modelo && item?.manutencao && item.manutencao.data && (!ManutencaoAvailable || item.manutencao instanceof Manutencao)) {
                         let dataFormatada = 'Data inválida';
                         let custoFormatado = 'Custo N/D';
                         let tipoServico = item.manutencao.tipo || 'Serviço Agendado';
                         try { dataFormatada = new Date(item.manutencao.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch(e){}
                         if (ManutencaoAvailable && item.manutencao instanceof Manutencao && typeof item.manutencao.custo === 'number') {
                             custoFormatado = item.manutencao.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                         } else if (typeof item.manutencao.custo === 'number') { custoFormatado = `R$ ${item.manutencao.custo.toFixed(2)}`; }
                        return `<li><strong>${item.veiculo.modelo}</strong>: ${tipoServico} em ${dataFormatada} (${custoFormatado})</li>`;
                     }
                     return '';
                }).join('');
            } else {
                agendamentosListContainer.innerHTML = '<li class="empty-list-placeholder">Nenhum agendamento futuro.</li>';
            }
        }
    } catch (agendError) {
         console.error("Erro ao renderizar agendamentos:", agendError);
         if(agendamentosListContainer) agendamentosListContainer.innerHTML = '<li class="empty-list-placeholder error-message">Erro ao carregar.</li>';
    }

    console.log("Renderização da garagem concluída.");
    if (typeof verificarAgendamentosProximos === 'function') {
        try { verificarAgendamentosProximos(); } catch (e) { console.error("Erro na verificação de agendamentos:", e); }
    }
}


// --- FUNÇÕES DE AÇÃO DO VEÍCULO ---

/** Creates a new vehicle from form input */
function criarNovoVeiculo(tipo) {
    const formIdPrefix = tipo === 'CarroEsportivo' ? 'Esportivo' : 'Caminhao';
    const modeloInput = document.getElementById(`modelo${formIdPrefix}`);
    const corInput = document.getElementById(`cor${formIdPrefix}`);
    const formElement = modeloInput?.closest('.form-adicionar');

    if (!modeloInput || !corInput || !formElement) {
        console.error(`Formulário para ${tipo} não encontrado.`);
        displayGlobalAlert(`Erro: Formulário de ${tipo} não encontrado.`, "error");
        return;
    }

    let veiculo;
    try {
        const modelo = modeloInput.value.trim();
        const cor = corInput.value.trim();
        let formIsValid = true;
        clearFormErrors(formElement);
        if (!modelo) { showFieldError(modeloInput, "Modelo obrigatório."); formIsValid = false; }
        if (!cor) { showFieldError(corInput, "Cor obrigatória."); formIsValid = false; }

        if (tipo === 'Caminhao') {
            const capacidadeInput = document.getElementById('capacidadeCaminhao');
            if (!capacidadeInput) throw new Error("Input de capacidade não encontrado.");
            const capacidadeStr = capacidadeInput.value;
            const capacidade = parseFloat(capacidadeStr);
             if (capacidadeStr === '' || isNaN(capacidade) || capacidade < 0) {
                showFieldError(capacidadeInput, "Capacidade inválida (>= 0)."); formIsValid = false;
             }
             if (formIsValid) {
                  if (typeof Caminhao === 'undefined') throw new Error("Classe Caminhao não definida.");
                 veiculo = new Caminhao(modelo, cor, capacidade);
             }
        } else if (tipo === 'CarroEsportivo') {
             if (formIsValid) {
                  if (typeof CarroEsportivo === 'undefined') throw new Error("Classe CarroEsportivo não definida.");
                 veiculo = new CarroEsportivo(modelo, cor);
             }
        } else {
            throw new Error(`Tipo desconhecido: ${tipo}`);
        }

        if (formIsValid && veiculo) {
             if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.adicionarVeiculo === 'function')) {
                 throw new Error("Instância da Garagem inválida.");
             }
            if (minhaGaragem.adicionarVeiculo(veiculo)) {
                displayGlobalAlert(`${veiculo.modelo} (${veiculo._tipoVeiculo}) adicionado!`, 'success');
                renderizarGaragem();
                modeloInput.value = ''; corInput.value = '';
                 if (tipo === 'Caminhao') {
                    const capInput = document.getElementById('capacidadeCaminhao');
                    if(capInput) capInput.value = '10000';
                 }
                formElement.classList.remove('form-error-highlight');
            }
        } else if (!formIsValid) {
             displayGlobalAlert("Corrija os erros no formulário.", "warning");
             formElement.classList.add('form-error-highlight');
             formElement.querySelector('.form-group.error input')?.focus();
        }
    } catch (error) {
        console.error(`Erro ao criar ${tipo}:`, error);
         displayGlobalAlert(`Erro ao criar ${tipo}: ${error.message}`, 'error');
         if(formElement) formElement.classList.add('form-error-highlight');
    }
}

/** Removes a vehicle after confirmation */
function removerVeiculoDaGaragem(idVeiculo) {
     if (!idVeiculo) {
         displayGlobalAlert("Erro: ID inválido para remoção.", "error");
         return;
     }
      if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function' && typeof minhaGaragem.removerVeiculo === 'function')) {
          displayGlobalAlert("Erro: Instância da Garagem inválida.", "error", 0);
          return;
      }
     const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
     const nomeVeiculo = veiculo ? `${veiculo.modelo} (${veiculo.cor})` : `ID ${idVeiculo}`;
     const tipoVeiculo = veiculo ? (veiculo._tipoVeiculo || "Veículo") : "Veículo";

     if (confirm(`Remover ${tipoVeiculo.toLowerCase()} ${nomeVeiculo}?\n\nIrreversível!`)) {
         if (confirm(`CONFIRMAÇÃO FINAL:\nApagar ${nomeVeiculo}?`)) {
             const veiculoCard = document.getElementById(`veiculo-${idVeiculo}`);
             if (minhaGaragem.removerVeiculo(idVeiculo)) {
                 displayGlobalAlert(`${nomeVeiculo} removido.`, 'success');
                 if (veiculoCard) {
                     veiculoCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease, max-height 0.5s ease, margin 0.5s ease, padding 0.5s ease, border 0.5s ease';
                     veiculoCard.style.opacity = '0';
                     veiculoCard.style.transform = 'scale(0.9)';
                     veiculoCard.style.maxHeight = '0px';
                     veiculoCard.style.paddingTop = '0'; veiculoCard.style.paddingBottom = '0';
                     veiculoCard.style.marginTop = '0'; veiculoCard.style.marginBottom = '0';
                     veiculoCard.style.borderWidth = '0';
                     veiculoCard.style.overflow = 'hidden';
                      veiculoCard.addEventListener('transitionend', () => {
                          veiculoCard.remove();
                          // renderizarGaragem(); // Optional full re-render
                      }, { once: true });
                 } else {
                      renderizarGaragem();
                 }
             } else {
                 renderizarGaragem();
             }
         } else {
              displayGlobalAlert("Remoção cancelada.", "info", 3000);
         }
    } else {
         displayGlobalAlert("Remoção cancelada.", "info", 3000);
    }
}


/** Executes an action on a vehicle */
function executarAcaoVeiculo(idVeiculo, acao, param = null) {
     if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function')) {
         displayGlobalAlert("Erro: Instância da Garagem inválida.", "error", 0);
         return;
     }
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo) {
        displayGlobalAlert(`Erro: Veículo ID ${idVeiculo} não encontrado. Atualizando...`, 'error', 6000);
        renderizarGaragem();
        return;
    }

    let message = '', statusType = 'info', soundId = null, finalParam = param;
    try {
        if (finalParam === null) {
            const isCaminhao = typeof Caminhao !== 'undefined' && veiculo instanceof Caminhao;
            switch (acao) {
                case 'acelerar': finalParam = isCaminhao ? 5 : 15; break;
                case 'frear': finalParam = isCaminhao ? 3 : 10; break;
                case 'carregar': finalParam = isCaminhao ? 1000 : null; break;
                case 'descarregar': finalParam = isCaminhao ? 500 : null; break;
            }
            if (param === null && finalParam !== null && ['acelerar', 'frear', 'carregar', 'descarregar'].includes(acao)) {
                 console.log(`[${acao} em ${veiculo.modelo}] Valor padrão: ${finalParam}`);
            }
        }
    } catch (e) { console.error("Erro ao determinar parâmetro padrão:", e); }

    try {
        if (typeof veiculo[acao] === 'function') {
            message = veiculo[acao](finalParam);
            statusType = 'info'; soundId = null;
             const lowerMsg = message.toLowerCase();
             if (lowerMsg.includes('inválido') || lowerMsg.includes('não é possível') || lowerMsg.includes('precisa estar') || lowerMsg.includes('precisa parar')) statusType = 'warning';
             else if (lowerMsg.includes('erro')) statusType = 'error';
             else if (lowerMsg.includes('ligado') || lowerMsg.includes('desligado') || lowerMsg.includes('ativado') || lowerMsg.includes('desativado') || lowerMsg.includes('carregado') || lowerMsg.includes('descarregado') || lowerMsg.includes('sucesso')) statusType = 'success';

            if (statusType !== 'error' && statusType !== 'warning') {
                 switch (acao) {
                     case 'ligar': soundId = 'somLigar'; statusType = 'success'; break;
                     case 'desligar': soundId = 'somDesligar'; statusType = 'success'; break;
                     case 'acelerar': soundId = 'somAcelerar'; statusType = 'info'; break;
                     case 'frear': if (veiculo.velocidade >= 0) { soundId = 'somFrear'; statusType = 'info'; } break;
                     case 'ativarTurbo': soundId = 'somAcelerar'; statusType = 'turbo'; break;
                     case 'desativarTurbo': statusType = 'info'; break;
                     case 'carregar': statusType = 'success'; break;
                     case 'descarregar': statusType = 'success'; break;
                 }
            }
             if (acao === 'desligar' && lowerMsg.includes('precisa parar')) statusType = 'warning';
             if (acao === 'carregar' && (lowerMsg.includes('excedida') || lowerMsg.includes('máxima'))) statusType = 'warning';
             if (acao === 'descarregar' && lowerMsg.includes('vazio')) statusType = 'info';

            if (soundId) playSound(soundId);
            updateVehicleStatusUI(idVeiculo, message, statusType);
            minhaGaragem.salvar();
            renderizarGaragem();
        } else {
            message = `Ação '${acao}' inválida para ${veiculo.modelo} (${veiculo._tipoVeiculo}).`;
            statusType = 'error';
            console.error(message, veiculo);
            updateVehicleStatusUI(idVeiculo, message, statusType, 6000);
        }
    } catch (error) {
        console.error(`Erro na ação '${acao}' no veículo ${idVeiculo}:`, error);
        message = `Erro ao executar '${acao}': ${error.message || 'Erro desconhecido'}`;
        statusType = 'error';
        updateVehicleStatusUI(idVeiculo, message, statusType, 8000);
    }
}

// --- FUNÇÕES DE AGENDAMENTO / HISTÓRICO ---

 function clearFormErrors(formElement) {
     if (!formElement) return;
     formElement.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
     formElement.querySelectorAll('.error-message').forEach(el => el.remove());
 }

 function showFieldError(inputElement, message) {
     const formGroup = inputElement?.closest('.form-group');
     if (!formGroup) return;
     formGroup.querySelector('.error-message')?.remove();
     formGroup.classList.add('error');
     const errorSpan = document.createElement('span');
     errorSpan.className = 'error-message';
     errorSpan.setAttribute('role', 'alert');
     errorSpan.textContent = message;
     const smallHelp = formGroup.querySelector('small');
     if (smallHelp) smallHelp.after(errorSpan);
     else inputElement.after(errorSpan);
 }

function mostrarFormAgendamento(idVeiculo) {
    if (!agendamentoModal || !formAgendamento || !agendamentoTituloVeiculo || !agendamentoVeiculoIdInput || !agendamentoDataInput || !agendamentoTipoInput || !agendamentoCustoInput || !agendamentoDescricaoInput) {
        displayGlobalAlert("Erro: Elementos do modal de agendamento não encontrados.", "error", 0);
        return;
    }
     if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function')) {
         displayGlobalAlert("Erro: Instância da Garagem inválida.", "error", 0);
         return;
     }
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo) {
        displayGlobalAlert("Erro: Veículo não encontrado.", "error");
        return;
    }

    agendamentoVeiculoIdInput.value = idVeiculo;
    agendamentoTituloVeiculo.textContent = `Histórico / Agendar: ${veiculo.modelo} (${veiculo.cor})`;
    formAgendamento.reset();
    clearFormErrors(formAgendamento);

    try {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        now.setSeconds(0); now.setMilliseconds(0);
        const defaultDateTimeStr = now.toISOString().slice(0, 16);
        agendamentoDataInput.min = defaultDateTimeStr;
        agendamentoDataInput.value = defaultDateTimeStr;
    } catch(e) {
        console.error("Erro ao definir data/hora padrão:", e);
        try { agendamentoDataInput.min = new Date().toISOString().split("T")[0]; } catch (e2) {}
        agendamentoDataInput.value = '';
    }
    agendamentoModal.style.display = 'block';
    agendamentoModal.setAttribute('aria-hidden', 'false');
    agendamentoTipoInput.focus();
}

function fecharFormAgendamento() {
     if (agendamentoModal) {
        agendamentoModal.style.display = 'none';
        agendamentoModal.setAttribute('aria-hidden', 'true');
    }
    if (formAgendamento) {
         formAgendamento.reset();
         clearFormErrors(formAgendamento);
    }
    if (agendamentoVeiculoIdInput) agendamentoVeiculoIdInput.value = '';
}

function salvarAgendamento(event) {
    event.preventDefault();
    if (!formAgendamento || !agendamentoVeiculoIdInput) {
         displayGlobalAlert("Erro interno ao salvar agendamento.", "error");
         return;
    }
    clearFormErrors(formAgendamento);
    const veiculoId = agendamentoVeiculoIdInput.value;
    const data = agendamentoDataInput.value;
    const tipo = agendamentoTipoInput.value.trim();
    const custoStr = agendamentoCustoInput.value;
    const descricao = agendamentoDescricaoInput.value.trim();

     if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function')) {
         displayGlobalAlert("Erro: Instância da Garagem inválida.", "error", 0);
         return;
     }
    const veiculo = minhaGaragem.encontrarVeiculoPorId(veiculoId);
    if (!veiculo) {
        displayGlobalAlert("Erro: Veículo não encontrado!", "error", 8000);
        fecharFormAgendamento();
        renderizarGaragem();
        return;
    }

    let isValid = true;
    if (!data) { showFieldError(agendamentoDataInput, "Data e Hora obrigatórios."); isValid = false; }
    else {
        if (typeof Manutencao?.prototype?.validarData === 'function') {
            if (!Manutencao.prototype.validarData(data)) { showFieldError(agendamentoDataInput, "Formato Data/Hora inválido."); isValid = false; }
        } else {
            try { if (isNaN(new Date(data).getTime())) { showFieldError(agendamentoDataInput, "Formato Data/Hora inválido."); isValid = false; }}
            catch (e) { showFieldError(agendamentoDataInput, "Erro ao validar Data/Hora."); isValid = false; }
        }
    }
    if (!tipo) { showFieldError(agendamentoTipoInput, "Tipo obrigatório."); isValid = false; }
    const custoNum = parseFloat(custoStr);
    if (custoStr === '' || isNaN(custoNum) || custoNum < 0) {
        showFieldError(agendamentoCustoInput, "Custo obrigatório (>= 0)."); isValid = false;
    }
    if (!isValid) {
         displayGlobalAlert("Corrija os erros no formulário.", "warning");
         formAgendamento.querySelector('.form-group.error input, .form-group.error textarea')?.focus();
        return;
    }

    try {
        if (typeof Manutencao === 'undefined') throw new Error("Classe Manutencao não definida.");
        const novaManutencao = new Manutencao(data, tipo, custoNum, descricao, veiculoId);
        if (typeof veiculo.adicionarManutencao !== 'function') throw new Error("Método adicionarManutencao não encontrado.");

        if (veiculo.adicionarManutencao(novaManutencao)) {
             minhaGaragem.salvar();
             renderizarGaragem();
             fecharFormAgendamento();
             displayGlobalAlert("Registro de manutenção salvo!", "success");
        } else {
             displayGlobalAlert("Falha ao adicionar registro.", "error");
        }
    } catch (error) {
        console.error("Erro ao salvar manutenção:", error);
        displayGlobalAlert(`Erro ao salvar: ${error.message || 'Verifique os dados.'}`, "error", 7000);
         formAgendamento.classList.add('form-error-highlight');
    }
}

// --- VERIFICAÇÃO DE AGENDAMENTOS PRÓXIMOS ---
function verificarAgendamentosProximos() {
    if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.listarTodosVeiculos === 'function') || !globalStatusDiv) return;
     const ManutencaoAvailable = typeof Manutencao !== 'undefined';
     if (!ManutencaoAvailable) return;
     if (minhaGaragem.listarTodosVeiculos().length === 0) return;

    let agendamentosFuturos = [];
    try { agendamentosFuturos = minhaGaragem.listarAgendamentosFuturos(); }
    catch (e) { console.error("Erro ao listar agendamentos:", e); return; }
    if (agendamentosFuturos.length === 0) return;

    const agora = new Date();
    const amanhaFimDoDia = new Date(agora);
    amanhaFimDoDia.setDate(agora.getDate() + 1);
    amanhaFimDoDia.setHours(23, 59, 59, 999);
    const hojeStr = agora.toDateString();

    if (!alertadosHoje.has(hojeStr)) {
        alertadosHoje.clear();
        alertadosHoje.add(hojeStr);
    }

    agendamentosFuturos.forEach(item => {
         if (!(item?.veiculo instanceof Vehicle) || !(item?.manutencao instanceof Manutencao) || !item.manutencao.id || !item.manutencao.data) return;
         const manutId = item.manutencao.id;
         if (alertadosHoje.has(manutId)) return;

        try {
            const dataManutencao = new Date(item.manutencao.data);
            if (isNaN(dataManutencao.getTime())) return;

            if (dataManutencao >= agora && dataManutencao <= amanhaFimDoDia) {
                 const dataHoraFormatada = dataManutencao.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'});
                 const diaFormatado = dataManutencao.toDateString() === hojeStr ? "HOJE" : "Amanhã";
                 const tipoServico = item.manutencao.tipo || "Manutenção";
                 const nomeVeiculo = item.veiculo.modelo || "Veículo";
                 displayGlobalAlert(
                     `Lembrete (${diaFormatado}): ${tipoServico} para ${nomeVeiculo} às ${dataHoraFormatada}!`,
                     'warning', 15000
                 );
                 alertadosHoje.add(manutId);
            }
        } catch (e) { console.error(`Erro ao processar data agendamento ${manutId}:`, e); }
    });
}


// --- PARTE 1: FUNÇÕES DA API SIMULADA ---
/**
 * Fetches additional vehicle details from the simulated local API (JSON file).
 * @param {string} vehicleId The unique ID of the vehicle to look up.
 * @returns {Promise<object|null>} A promise that resolves with the details object or null if not found/error.
 */
async function buscarDetalhesVeiculoAPI(vehicleId) {
    const apiUrl = './dados_veiculos_api.json';
    if (!vehicleId) {
         console.error("buscarDetalhesVeiculoAPI chamado sem vehicleId.");
         return null;
    }
    try {
        const response = await fetch(apiUrl, {
             method: 'GET', headers: { 'Accept': 'application/json' }, cache: 'no-cache'
        });
        if (!response.ok) {
             console.error(`Erro HTTP ${response.status} ao buscar ${apiUrl}: ${response.statusText}`);
            throw new Error(`Não foi possível carregar detalhes (Erro ${response.status}).`);
        }
        const allData = await response.json();
        if (allData && typeof allData === 'object' && allData.hasOwnProperty(vehicleId)) {
            return allData[vehicleId];
        } else {
            console.log(`Detalhes para ID ${vehicleId} não encontrados em ${apiUrl}.`);
            return null;
        }
    } catch (error) {
        console.error(`Falha ao buscar/processar ${apiUrl} para ID ${vehicleId}:`, error);
         return { error: true, message: error.message || `Falha ao buscar ${apiUrl}` };
    }
}

/**
 * Displays the extra vehicle details fetched from the simulated API in the UI.
 * Handles loading states and errors.
 * @param {string} vehicleId The ID of the vehicle whose details are to be shown.
 */
async function mostrarDetalhesVeiculo(vehicleId) {
    const resultDiv = document.getElementById(`detalhes-${vehicleId}`);
    const button = document.getElementById(`btn-detalhes-${vehicleId}`);
    if (!resultDiv || !button) {
        console.error(`UI elements não encontrados para detalhes ${vehicleId}`);
        displayGlobalAlert(`Erro interno: Não é possível exibir detalhes ${vehicleId}.`, "error");
        return;
    }
    resultDiv.innerHTML = '<p class="loading-message">Carregando detalhes...</p>';
    resultDiv.className = 'detalhes-api-resultado';
    resultDiv.style.display = 'block';
    button.disabled = true; button.textContent = 'Carregando...';

    try {
        const detalhes = await buscarDetalhesVeiculoAPI(vehicleId);
        if (detalhes?.error) throw new Error(detalhes.message);

        if (detalhes && typeof detalhes === 'object') {
            let detailsHtml = '<h5>Detalhes Adicionais (Simulado)</h5>';
            const addDetail = (label, value, isLink = false) => {
                if (value !== null && value !== undefined && String(value).trim() !== '') {
                     const displayValue = String(value);
                     if (isLink) {
                         if (displayValue.startsWith('http://') || displayValue.startsWith('https://')) {
                             return `<p><strong>${label}:</strong> <a href="${displayValue}" target="_blank" rel="noopener noreferrer">Acessar Link</a></p>`;
                         }
                         return `<p><strong>${label}:</strong> Link inválido</p>`;
                     }
                     const escapedValue = displayValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                     return `<p><strong>${label}:</strong> ${escapedValue}</p>`;
                } return '';
            };
            detailsHtml += addDetail('Valor FIPE (Aprox)', detalhes.valorFipeAprox);
            detailsHtml += addDetail('Último Recall', detalhes.ultimoRecall || 'Nenhum');
            detailsHtml += addDetail('Dica Manutenção', detalhes.dicaManutencao);
            detailsHtml += addDetail('Manual Online', detalhes.linkManual, true);
            detailsHtml += addDetail('Consumo Urbano (Aprox)', detalhes.consumoMedioUrbano || detalhes.consumoMedioCarregado);
            detailsHtml += addDetail('Consumo Rodoviário (Aprox)', detalhes.consumoMedioRodoviario);
            detailsHtml += addDetail('Intervalo Revisão', detalhes.intervaloRevisao);
            resultDiv.innerHTML = detailsHtml;
            resultDiv.className = 'detalhes-api-resultado';
        } else {
            resultDiv.innerHTML = '<p class="not-found-message">Detalhes não disponíveis.</p>';
            resultDiv.className = 'detalhes-api-resultado';
        }
    } catch (error) {
        console.error(`Erro ao buscar/exibir detalhes para ${vehicleId}:`, error);
        resultDiv.innerHTML = `<p class="error-message">Erro: ${error.message || 'Tente novamente.'}</p>`;
        resultDiv.className = 'detalhes-api-resultado';
    } finally {
        button.disabled = false; button.textContent = 'Ver Detalhes Extras';
    }
}


// --- PARTE 2: FUNÇÕES DA API REAL (OpenWeatherMap - Previsão SIMPLES) ---
/**
 * Fetches current weather data from OpenWeatherMap API.
 * @param {string} nomeCidade The name of the city.
 * @returns {Promise<object>} A promise resolving to weather data or an error object.
 */
async function buscarPrevisaoTempo(nomeCidade) {
    if (!nomeCidade || typeof nomeCidade !== 'string' || nomeCidade.trim() === '') {
        return { error: true, message: "Digite uma cidade válida." };
    }
    const cidadeTrimmed = nomeCidade.trim();
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "COLOQUE_SUA_CHAVE_API_OPENWEATHERMAP_AQUI") { // Check simple key
         return { error: true, message: "Erro config. serviço de clima." };
    }
    const cidadeCodificada = encodeURIComponent(cidadeTrimmed);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidadeCodificada}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    console.log(`Buscando previsão (simples) para: ${cidadeTrimmed}`);
    try {
        const response = await fetch(url);
        let data;
        try { data = await response.json(); }
        catch (jsonError) { throw new Error(`Resposta inválida do serviço de clima (Status: ${response.status}).`); }

        if (!response.ok || String(data.cod) !== '200') {
            let errMsg = `Erro ${data.cod || response.status}: ${data.message || response.statusText || 'Não foi possível obter a previsão.'}`;
            if (String(data.cod) === '401') errMsg = "Erro autenticação serviço clima.";
            else if (String(data.cod) === '404') errMsg = `Cidade "${cidadeTrimmed}" não encontrada.`;
            else if (String(data.cod) === '429') errMsg = "Limite de requisições excedido.";
            throw new Error(errMsg);
        }
        const clima = {
            error: false, nomeCidade: data.name ?? cidadeTrimmed, pais: data.sys?.country ?? '',
            temperatura: data.main?.temp?.toFixed(1) ?? 'N/D', sensacao: data.main?.feels_like?.toFixed(1) ?? 'N/D',
            minima: data.main?.temp_min?.toFixed(1) ?? 'N/D', maxima: data.main?.temp_max?.toFixed(1) ?? 'N/D',
            descricao: data.weather?.[0]?.description ? (data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)) : 'N/D',
            icone: data.weather?.[0]?.icon ?? null, umidade: data.main?.humidity ?? 'N/D',
            ventoVelocidade: data.wind?.speed?.toFixed(1) ?? 'N/D', nuvens: data.clouds?.all ?? 'N/D',
        };
        return clima;
    } catch (error) {
        console.error(`Falha na previsão (simples) OpenWeatherMap:`, error);
        return { error: true, message: error.message || "Erro de rede/processamento previsão." };
    }
}

/**
 * Handles click for "Verificar Clima" (simple forecast).
 */
async function verificarClimaHandler() {
    if (!destinoInput || !previsaoResultadoDiv || !climaBtn) {
        displayGlobalAlert("Erro: Interface do planejador simples indisponível.", "error", 0); return;
    }
    const cidade = destinoInput.value.trim();
    if (!cidade) {
        previsaoResultadoDiv.innerHTML = '<p class="error-message">Digite nome da cidade.</p>';
        previsaoResultadoDiv.className = 'weather-results error'; destinoInput.focus(); return;
    }
    previsaoResultadoDiv.innerHTML = '<p>Buscando previsão...</p>';
    previsaoResultadoDiv.className = 'weather-results loading';
    climaBtn.disabled = true; climaBtn.textContent = 'Buscando...';

    const resultadoClima = await buscarPrevisaoTempo(cidade);
    if (resultadoClima.error) {
        previsaoResultadoDiv.innerHTML = `<p class="error-message">${resultadoClima.message}</p>`;
        previsaoResultadoDiv.className = 'weather-results error';
    } else {
        let climaHtml = `<h5>Clima Atual em ${resultadoClima.nomeCidade} (${resultadoClima.pais || ''})</h5>`;
        climaHtml += `<p class="weather-description">`;
        if (resultadoClima.icone) {
             climaHtml += `<img src="https://openweathermap.org/img/wn/${resultadoClima.icone}@2x.png" alt="${resultadoClima.descricao}" class="weather-icon" title="${resultadoClima.descricao}"> `;
        }
        climaHtml += `<strong>${resultadoClima.descricao}</strong></p>`;
        climaHtml += `<p><span title="Temperatura Atual">🌡️ Temp.:</span> ${resultadoClima.temperatura}°C (Sensação: ${resultadoClima.sensacao}°C)</p>`;
        climaHtml += `<p><span title="Temperaturas Mínima e Máxima">📊 Mín/Máx:</span> ${resultadoClima.minima}°C / ${resultadoClima.maxima}°C</p>`;
        climaHtml += `<p><span title="Umidade Relativa">💧 Umidade:</span> ${resultadoClima.umidade}%</p>`;
        if (resultadoClima.ventoVelocidade !== 'N/D') {
             try { const ventoKmH = (parseFloat(resultadoClima.ventoVelocidade) * 3.6).toFixed(1);
                  climaHtml += `<p><span title="Velocidade do Vento">💨 Vento:</span> ${ventoKmH} km/h</p>`;
             } catch (e) { climaHtml += `<p><span title="Velocidade do Vento">💨 Vento:</span> ${resultadoClima.ventoVelocidade} m/s</p>`; }
        }
         if (resultadoClima.nuvens !== 'N/D') climaHtml += `<p><span title="Nebulosidade">☁️ Nuvens:</span> ${resultadoClima.nuvens}%</p>`;
        previsaoResultadoDiv.innerHTML = climaHtml;
        previsaoResultadoDiv.className = 'weather-results';
    }
    climaBtn.disabled = false; climaBtn.textContent = 'Verificar Clima';
}


// =============================================================================== //
// === FUNÇÕES PARA PREVISÃO DO TEMPO DETALHADA (B2.P1.A3)                     === //
// =============================================================================== //

/**
 * Busca os dados de previsão do tempo detalhada (forecast 5 dias / 3 horas) para uma cidade.
 * @param {string} cidade O nome da cidade para buscar a previsão.
 * @param {HTMLElement} resultadoDiv O elemento div onde as mensagens de loading/erro serão exibidas.
 * @returns {Promise<Object|null>} Uma promessa que resolve com os dados da API ou null em caso de erro.
 */
async function buscarPrevisaoDetalhada(cidade, resultadoDiv) {
    // Validação da API Key (use OPENWEATHER_API_KEY_DETALHADA ou a sua chave principal)
    if (!OPENWEATHER_API_KEY_DETALHADA || OPENWEATHER_API_KEY_DETALHADA === "SUA_CHAVE_OPENWEATHERMAP_AQUI") {
        console.error("Chave da API OpenWeatherMap para previsão detalhada não configurada!");
        if (resultadoDiv) {
            resultadoDiv.innerHTML = '<p class="error-message">Erro de configuração do serviço de clima detalhado.</p>';
            resultadoDiv.className = 'error'; // Use a class consistent with other error displays
        }
        return null;
    }

    const cidadeCodificada = encodeURIComponent(cidade);
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${cidadeCodificada}&appid=${OPENWEATHER_API_KEY_DETALHADA}&units=metric&lang=pt_br`;
    
    if (resultadoDiv) {
        resultadoDiv.innerHTML = '<p class="loading-message">Buscando previsão detalhada (5 dias)...</p>';
        resultadoDiv.className = 'loading'; // Use a class consistent with other loading displays
    }

    try {
        const response = await fetch(url);
        const responseData = await response.json(); // Parse JSON once

        if (!response.ok) { // Check HTTP status first
            let errorMessage = `Erro ${responseData.cod || response.status}`; // Use cod from JSON if available
            if (responseData && responseData.message) { // API often provides a message
                errorMessage += `: ${responseData.message}`;
            } else if (response.status === 401) {
                errorMessage += " - Chave de API inválida ou não autorizada.";
            } else if (response.status === 404) {
                errorMessage += " - Cidade não encontrada.";
            } else {
                errorMessage += " - Não foi possível buscar a previsão detalhada.";
            }
            console.error("Erro da API OpenWeather (Forecast):", errorMessage, responseData);
            throw new Error(errorMessage); // Throw after logging
        }
        // Log success if needed: console.log("Dados da API (Forecast):", responseData);
        return responseData; // Return the full data object
    } catch (error) { // Catches fetch errors or errors thrown above
        console.error("Erro ao buscar previsão detalhada:", error);
        if (resultadoDiv) {
            // error.message should contain the user-friendly message from above
            resultadoDiv.innerHTML = `<p class="error-message">${error.message || 'Falha na comunicação com o serviço de clima.'}</p>`;
            resultadoDiv.className = 'error';
        }
        return null; // Indicate failure
    }
}

/**
 * Processa os dados brutos da API de forecast (5 dias / 3 horas) e agrupa as informações por dia.
 * @param {Object} dataApi Os dados retornados pela API OpenWeatherMap (endpoint forecast).
 * @returns {Array<Object>} Um array de objetos, onde cada objeto representa um resumo da previsão para um dia.
 */
function processarDadosForecast(dataApi) {
    if (!dataApi || !dataApi.list || dataApi.list.length === 0) {
        console.warn("Dados da API de forecast inválidos ou vazios para processamento.");
        return [];
    }

    const previsoesPorDia = {}; // Objeto para agrupar previsões por data "AAAA-MM-DD"

    dataApi.list.forEach(item => {
        const dataHoraTexto = item.dt_txt; // ex: "2023-10-27 12:00:00"
        const dataApenas = dataHoraTexto.split(' ')[0]; // "2023-10-27"
        
        if (!previsoesPorDia[dataApenas]) {
            previsoesPorDia[dataApenas] = {
                temps: [],
                descricoes: {}, // Para contar ocorrências de descrições e escolher a mais comum
                icones: {},     // Para contar ocorrências de ícones e escolher o mais comum
                umidades: [],
                ventoVelocidades: [], // m/s
                dt_timestamps: [] // Store timestamps to pick a representative one if needed (e.g., for icon)
            };
        }
        previsoesPorDia[dataApenas].temps.push(item.main.temp);
        previsoesPorDia[dataApenas].umidades.push(item.main.humidity);
        previsoesPorDia[dataApenas].ventoVelocidades.push(item.wind.speed);
        previsoesPorDia[dataApenas].dt_timestamps.push(item.dt);


        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;
        
        previsoesPorDia[dataApenas].descricoes[desc] = (previsoesPorDia[dataApenas].descricoes[desc] || 0) + 1;
        previsoesPorDia[dataApenas].icones[icon] = (previsoesPorDia[dataApenas].icones[icon] || 0) + 1;
    });

    const resumoDiario = Object.keys(previsoesPorDia).map(dataKey => {
        const diaInfo = previsoesPorDia[dataKey];
        const tempMin = Math.min(...diaInfo.temps);
        const tempMax = Math.max(...diaInfo.temps);
        const umidadeMedia = diaInfo.umidades.reduce((a, b) => a + b, 0) / diaInfo.umidades.length;
        const ventoMedioMs = diaInfo.ventoVelocidades.reduce((a, b) => a + b, 0) / diaInfo.ventoVelocidades.length;
        const ventoMedioKmh = ventoMedioMs * 3.6; // Converter m/s para km/h

        let descricaoMaisFrequente = 'N/D';
        if (Object.keys(diaInfo.descricoes).length > 0) {
            descricaoMaisFrequente = Object.keys(diaInfo.descricoes).reduce((a, b) => diaInfo.descricoes[a] > diaInfo.descricoes[b] ? a : b);
        }
        
        // Pick icon: either most frequent or one from midday if available
        let iconeMaisFrequente = '01d'; // Default icon
        if (Object.keys(diaInfo.icones).length > 0) {
            iconeMaisFrequente = Object.keys(diaInfo.icones).reduce((a, b) => diaInfo.icones[a] > diaInfo.icones[b] ? a : b);
        }
        
        const [ano, mes, diaNum] = dataKey.split('-');
        // More robust date formatting for display, ensuring correct day of week etc. can be done here or in display
        const dataObj = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(diaNum));
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });


        return {
            data: dataFormatada, // e.g., "sex, 27/10"
            dataISO: dataKey, // Keep YYYY-MM-DD for sorting or other logic if needed
            temp_min: tempMin.toFixed(1),
            temp_max: tempMax.toFixed(1),
            umidade: umidadeMedia.toFixed(0),
            vento: ventoMedioKmh.toFixed(1), // km/h
            descricao: descricaoMaisFrequente.charAt(0).toUpperCase() + descricaoMaisFrequente.slice(1),
            icone: iconeMaisFrequente
        };
    }).sort((a, b) => new Date(a.dataISO) - new Date(b.dataISO)); // Ensure sorted by date
    
    return resumoDiario.slice(0, 5); // Guarantees no maximum 5 days, API usually returns data for 5-6 days
}

/**
 * Exibe a previsão do tempo detalhada processada (resumo diário) na interface do usuário.
 * @param {Array<Object>} previsaoProcessada Array com os dados diários processados.
 * @param {string} nomeCidadeExibicao O nome da cidade para exibição no título.
 * @param {HTMLElement} resultadoDiv O elemento div onde a previsão será renderizada.
 */
function exibirPrevisaoDetalhada(previsaoProcessada, nomeCidadeExibicao, resultadoDiv) {
    if (!resultadoDiv) return;

    resultadoDiv.innerHTML = ''; 
    resultadoDiv.className = 'weather-results-detailed'; // Use a more specific class name

    if (!previsaoProcessada || previsaoProcessada.length === 0) {
        resultadoDiv.innerHTML = `<p class="not-found-message">Não há dados de previsão detalhada para exibir para ${nomeCidadeExibicao}.</p>`;
        return;
    }

    let html = `<h3>Previsão para ${nomeCidadeExibicao} (Próximos ${previsaoProcessada.length} dias)</h3>`;
    html += '<div class="previsao-dias-container">'; 

    previsaoProcessada.forEach(dia => {
        html += `
            <div class="previsao-dia-card">
                <h4>${dia.data}</h4>
                <img src="https://openweathermap.org/img/wn/${dia.icone}@2x.png" alt="${dia.descricao}" class="weather-icon" title="${dia.descricao}">
                <p class="descricao-tempo">${dia.descricao}</p>
                <p><span title="Temperatura Mínima">Mín:</span> ${dia.temp_min}°C</p>
                <p><span title="Temperatura Máxima">Máx:</span> ${dia.temp_max}°C</p>
                <p><span title="Umidade Média">Umidade:</span> ${dia.umidade}%</p>
                <p><span title="Velocidade Média do Vento">Vento:</span> ${dia.vento} km/h</p>
            </div>
        `;
    });
    html += '</div>';
    resultadoDiv.innerHTML = html;
}

/**
 * Manipulador de evento para o botão de verificar clima detalhado.
 */
async function verificarClimaDetalhadoHandler() {
    const inputEl = document.getElementById('destino-viagem-detalhada');
    const resultadoEl = document.getElementById('previsao-tempo-detalhada-resultado');
    const btnEl = document.getElementById('verificar-clima-detalhado-btn');

    if (!inputEl || !resultadoEl || !btnEl) {
        console.error("Elementos da UI para previsão detalhada não encontrados.");
        displayGlobalAlert("Erro interno: Interface de previsão detalhada indisponível.", "error");
        return;
    }

    const cidade = inputEl.value.trim();
    if (!cidade) {
        resultadoEl.innerHTML = '<p class="error-message">Por favor, digite o nome da cidade.</p>';
        resultadoEl.className = 'weather-results-detailed error'; // Consistent class
        inputEl.focus();
        return;
    }

    btnEl.disabled = true;
    btnEl.textContent = 'Buscando...';
    // resultadoEl will be updated by buscarPrevisaoDetalhada during loading/error

    const dadosBrutosApi = await buscarPrevisaoDetalhada(cidade, resultadoEl); 
    
    if (dadosBrutosApi && dadosBrutosApi.city) { 
        const nomeCidadeApi = dadosBrutosApi.city.name || cidade; 
        const previsaoProcessada = processarDadosForecast(dadosBrutosApi);
        exibirPrevisaoDetalhada(previsaoProcessada, nomeCidadeApi, resultadoEl);
    } else if (dadosBrutosApi && !dadosBrutosApi.city && dadosBrutosApi.list && dadosBrutosApi.list.length > 0) {
        // Case where city info might be missing but list is present (less likely with forecast API)
        console.warn("Dados da API (Forecast) recebidos, mas falta a propriedade 'city'. Usando nome digitado.", dadosBrutosApi);
        const previsaoProcessada = processarDadosForecast(dadosBrutosApi);
        exibirPrevisaoDetalhada(previsaoProcessada, cidade, resultadoEl); // Use inputted city name
    } else if (!dadosBrutosApi) {
        // Error message already handled by buscarPrevisaoDetalhada in resultadoEl
        console.log("Falha ao buscar dados detalhados, mensagem de erro já exibida.");
    } else {
        // Fallback for unexpected structure or empty list where buscarPrevisaoDetalhada didn't set error
        resultadoEl.innerHTML = `<p class="error-message">Não foi possível obter a previsão detalhada para ${cidade}.</p>`;
        resultadoEl.className = 'weather-results-detailed error';
        console.warn("Dados da API (Forecast) com estrutura inesperada ou lista vazia:", dadosBrutosApi);
    }

    btnEl.disabled = false;
    btnEl.textContent = 'Ver Previsão Detalhada';
}



// --- EVENT LISTENERS E INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Inicializando Garagem v3.1 + APIs...");

    // --- Cache DOM Elements ---
    try {
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

        // Cache Planner elements (SIMPLE weather)
        destinoInput = document.getElementById('destino-viagem'); // Might be null if HTML doesn't have it
        climaBtn = document.getElementById('verificar-clima-btn'); // Might be null
        previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado'); // Might be null

        // Cache DETAILED forecast elements
        const destinoInputDetalhada = document.getElementById('destino-viagem-detalhada');
        const climaDetalhadoBtn = document.getElementById('verificar-clima-detalhado-btn');
        // previsaoDetalhadaResultadoDiv is accessed within its handler

         if (!globalStatusDiv || !containerCarro || !containerCaminhao || !agendamentosListContainer || !agendamentoModal || !formAgendamento || !destinoInputDetalhada || !climaDetalhadoBtn) {
             throw new Error("Um ou mais elementos essenciais da UI (incluindo previsão detalhada) não foram encontrados no DOM.");
         }
    } catch (error) {
        console.error("Erro Crítico ao buscar elementos do DOM essenciais:", error);
        if (typeof displayGlobalAlert === 'function' && globalStatusDiv) {
             displayGlobalAlert(`Erro grave ao carregar a interface: ${error.message}. Aplicação pode não funcionar.`, "error", 0);
        } else {
             alert(`ERRO GRAVE AO CARREGAR INTERFACE:\n${error.message}\n\nA aplicação pode não funcionar.`);
        }
        return; 
    }


    // --- Initialize Garage ---
    try {
        if (typeof Garagem === 'undefined') {
            throw new Error("Classe Garagem não definida. Verifique garagem.js.");
        }
        minhaGaragem = new Garagem(); 
        minhaGaragem.carregar();     
    } catch (e) {
         console.error("Erro Fatal na inicialização/carregamento da Garagem:", e);
         displayGlobalAlert("ERRO GRAVE AO CARREGAR DADOS DA GARAGEM.", "error", 0);
         if (!(minhaGaragem instanceof Garagem)) {
             try {
                  if (typeof Garagem !== 'undefined') minhaGaragem = new Garagem();
                  else throw new Error("Classe Garagem ainda não definida para fallback.");
             } catch (initError) {
                  console.error("Falha ao criar Garagem vazia:", initError);
                  displayGlobalAlert("Falha crítica na inicialização.", "error", 0);
                  return;
             }
         }
    }
    
    try {
        if (typeof renderizarGaragem === 'function') renderizarGaragem();
        else throw new Error("Função renderizarGaragem não definida.");
    } catch (renderError) {
         console.error("Erro Fatal na renderização inicial:", renderError);
         displayGlobalAlert("ERRO GRAVE AO EXIBIR GARAGEM.", "error", 0);
         if(containerCarro) containerCarro.innerHTML = '<h3>Carros</h3><p class="empty-list-placeholder error-message">Erro render.</p>';
         if(containerCaminhao) containerCaminhao.innerHTML = '<h3>Caminhões</h3><p class="empty-list-placeholder error-message">Erro render.</p>';
    }
    
    try {
        document.getElementById('criarCarroEsportivoBtn')?.addEventListener('click', () => criarNovoVeiculo('CarroEsportivo'));
        document.getElementById('criarCaminhaoBtn')?.addEventListener('click', () => criarNovoVeiculo('Caminhao'));

        if (formAgendamento) {
            formAgendamento.addEventListener('submit', salvarAgendamento);
            formAgendamento.querySelector('button[type="button"].btn-secondary')?.addEventListener('click', fecharFormAgendamento);
        }
        if (agendamentoModal) {
             agendamentoModal.querySelector('.close-button')?.addEventListener('click', fecharFormAgendamento);
             agendamentoModal.addEventListener('click', (event) => {
                 if (event.target === agendamentoModal) fecharFormAgendamento();
             });
        }
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape' && agendamentoModal?.style.display === 'block') fecharFormAgendamento();
         });

        const limparBtn = document.getElementById('limparStorageBtn');
        if (limparBtn) {
            limparBtn.addEventListener('click', () => {
                if (confirm("ATENÇÃO!\nLimpar TODOS os dados da garagem?\n\nIRREVERSÍVEL!")) {
                     if (confirm("CONFIRMAÇÃO FINAL:\nApagar TUDO?")) {
                         try {
                             if (!(minhaGaragem instanceof Garagem)) throw new Error("Garagem inválida.");
                             localStorage.removeItem(minhaGaragem.storageKey);
                             minhaGaragem = new Garagem();
                             alertadosHoje.clear(); vehicleStatusTimeouts = {};
                             renderizarGaragem();
                             // Clear simple planner UI
                             if(destinoInput) destinoInput.value = '';
                             if(previsaoResultadoDiv) {
                                 previsaoResultadoDiv.innerHTML = '<p>Digite cidade e clique "Verificar Clima".</p>';
                                 previsaoResultadoDiv.className = 'weather-results';
                             }
                             // Clear detailed planner UI
                             const destinoDetInput = document.getElementById('destino-viagem-detalhada');
                             const previsaoDetResDiv = document.getElementById('previsao-tempo-detalhada-resultado');
                             if(destinoDetInput) destinoDetInput.value = '';
                             if(previsaoDetResDiv) {
                                previsaoDetResDiv.innerHTML = ''; // Clear content
                                previsaoDetResDiv.className = 'weather-results-detailed'; // Reset class
                             }
                             displayGlobalAlert("Dados da garagem limpos.", "info");
                         } catch(e) { displayGlobalAlert("Erro ao limpar dados.", "error"); }
                     } else { displayGlobalAlert("Limpeza cancelada.", "info", 3000); }
                } else { displayGlobalAlert("Limpeza cancelada.", "info", 3000); }
            });
        }

        // Listener for SIMPLE Weather Button (if elements exist)
        if (climaBtn && destinoInput) {
            climaBtn.addEventListener('click', verificarClimaHandler);
            destinoInput.addEventListener('keypress', (event) => {
                 if (event.key === 'Enter') {
                     event.preventDefault(); 
                     verificarClimaHandler(); 
                 }
             });
        } else { console.warn("Elementos para previsão SIMPLES não encontrados. Funcionalidade desativada."); }

        // Listener for DETAILED Weather Button
        const climaDetalhadoBtn = document.getElementById('verificar-clima-detalhado-btn');
        const destinoInputDetalhada = document.getElementById('destino-viagem-detalhada');
        if (climaDetalhadoBtn && destinoInputDetalhada) {
            climaDetalhadoBtn.addEventListener('click', verificarClimaDetalhadoHandler);
            destinoInputDetalhada.addEventListener('keypress', (event) => {
                 if (event.key === 'Enter') {
                     event.preventDefault(); 
                     verificarClimaDetalhadoHandler(); 
                 }
             });
        } else { console.warn("Botão/Input para previsão DETALHADA não encontrado."); }

    } catch (listenerError) {
         console.error("Erro ao configurar event listeners:", listenerError);
         displayGlobalAlert("Erro ao configurar interações.", "error", 0);
    }

    const checkIntervalMinutes = 5;
    try {
        if (typeof verificarAgendamentosProximos === 'function') {
            setInterval(verificarAgendamentosProximos, checkIntervalMinutes * 60 * 1000);
            console.log(`Verificação periódica de agendamentos ativa (${checkIntervalMinutes} min).`);
        }
    } catch (intervalError) { console.error("Erro ao iniciar verificação periódica:", intervalError); }

    console.log("Inicialização da Garagem Inteligente v3.1 + APIs concluída.");
    // API Key status checks
    let messages = [];
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "COLOQUE_SUA_CHAVE_API_OPENWEATHERMAP_AQUI" || OPENWEATHER_API_KEY === "32ad5f39fc17a3b18cec5953e7a3227e" /* Example key, treat as unconfigured */) {
        if (destinoInput) messages.push("Previsão SIMPLES desativada (API Key não configurada)");
    }
    if (!OPENWEATHER_API_KEY_DETALHADA || OPENWEATHER_API_KEY_DETALHADA === "SUA_CHAVE_OPENWEATHERMAP_AQUI") {
        messages.push("Previsão DETALHADA desativada (API Key não configurada)");
    }

    if (messages.length > 0) {
        displayGlobalAlert(`Garagem carregada. ${messages.join('; ')}.`, "warning", 10000);
    } else {
         displayGlobalAlert("Garagem Inteligente pronta!", "success", 3000);
    }
});