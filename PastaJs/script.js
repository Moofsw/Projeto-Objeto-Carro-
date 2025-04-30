javascript
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
/**
 * Manages the collection of vehicles and persistence.
 */
class Garagem {
    constructor() {
        /** @type {Array<Vehicle|CarroEsportivo|Caminhao>} */
        this.veiculos = [];
        this.storageKey = 'garagemInteligente_v3_1_refactored_api'; // Updated key
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
        console.log(`Veículo ${veiculo.modelo} (ID: ${veiculo.id}, Tipo: ${veiculo._tipoVeiculo}) adicionado.`);
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
             displayGlobalAlert(`Erro: Veículo com ID ${idVeiculo} não encontrado para remoção.`, 'error');
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
            // Ensure all vehicles are valid before calling toJSON
            const dataToSave = this.veiculos
                .filter(v => v instanceof Vehicle && typeof v.toJSON === 'function')
                .map(v => v.toJSON());
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
             // Use a persistent error to ensure user sees it
             displayGlobalAlert(message, "error", 0);
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

            // *** VALIDATION: Ensure loaded data is an array ***
            if (!Array.isArray(dataFromStorage)) {
                 console.error("Dado corrompido encontrado no LocalStorage! Esperado um array.", dataFromStorage);
                 this.veiculos = []; // Reset to safe state
                 try {
                     localStorage.removeItem(this.storageKey);
                      displayGlobalAlert("Dados da garagem corrompidos foram removidos. Começando do zero.", "error", 10000);
                 } catch (removeError) {
                     console.error("Falha ao remover dados corrompidos:", removeError);
                     displayGlobalAlert("Dados da garagem corrompidos. Falha ao limpar automaticamente.", "error", 0);
                 }
                 return;
            }

            // Reconstruct vehicles using Vehicle.fromJSON and filter invalid ones
            const loadedVehicles = dataFromStorage
                .map(v_data => Vehicle.fromJSON(v_data)) // Vehicle.fromJSON handles subclass creation
                .filter(v => v instanceof Vehicle);      // Filter out nulls or invalid objects

            const discardedCount = dataFromStorage.length - loadedVehicles.length;
            if (discardedCount > 0) {
                 console.warn(`${discardedCount} itens inválidos ou não reconstruíveis foram descartados durante o carregamento.`);
                 displayGlobalAlert(`${discardedCount} registro(s) de veículo(s) inválido(s) foram ignorados durante o carregamento.`, 'warning', 8000);
            }

            this.veiculos = loadedVehicles;
            console.log(`${this.veiculos.length} veículos carregados e validados.`);

        } catch (error) {
            console.error("Erro CRÍTICO ao carregar/parsear garagem do LocalStorage:", error);
            displayGlobalAlert("Erro grave ao carregar dados salvos. Resetando para vazio. Verifique o console.", "error", 0);
            this.veiculos = []; // Reset to safe state on critical error
            // Consider clearing storage cautiously, but maybe not automatically
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
        // Check if Manutencao class is available
        const ManutencaoAvailable = typeof Manutencao !== 'undefined';

        this.veiculos.forEach(v => {
            // Ensure vehicle is valid and has history array
            if (v instanceof Vehicle && Array.isArray(v.historicoManutencao)) {
                v.historicoManutencao.forEach(m => {
                    // Ensure record is a Manutencao instance (if class exists) and has a date
                    if (ManutencaoAvailable && m instanceof Manutencao && m.data) {
                         try {
                            const dataManutencao = new Date(m.data);
                            // Ensure date is valid AND in the future/present
                            if (!isNaN(dataManutencao.getTime()) && dataManutencao >= agora) {
                                futuros.push({ veiculo: v, manutencao: m });
                            }
                         } catch (dateError){ console.warn(`Erro ao processar data de manutenção ${m.data}: ${dateError.message}`); }
                    } else if (!ManutencaoAvailable && m && m.data) {
                        // Basic check if Manutencao class is missing but data exists
                        try {
                            const dataManutencao = new Date(m.data);
                            if (!isNaN(dataManutencao.getTime()) && dataManutencao >= agora) {
                                futuros.push({ veiculo: v, manutencao: m }); // Push raw data if class missing
                            }
                        } catch (dateError){ console.warn(`Erro ao processar data de manutenção ${m.data}: ${dateError.message}`); }
                    }
                });
            }
        });

        // Sort ascending (soonest first), handling potentially invalid dates robustly
        futuros.sort((a, b) => {
            try {
                const dateA = new Date(a.manutencao.data);
                const dateB = new Date(b.manutencao.data);
                 if (isNaN(dateA.getTime())) return 1; // Invalid dates last
                 if (isNaN(dateB.getTime())) return -1;// Invalid dates last
                 return dateA - dateB; // Sort valid dates
            } catch (sortError) {
                 console.error("Erro durante a ordenação de agendamentos:", sortError);
                 return 0; // Maintain original order on error
            }
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
    agendamentoCustoInput, agendamentoDescricaoInput,
    // New elements for planner
    destinoInput, climaBtn, previsaoResultadoDiv;


// --- CONSTANTES ---
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! ATENÇÃO: NUNCA COLOQUE SUA CHAVE DE API REAL DIRETAMENTE NO CÓDIGO  !!!
// !!! DE FRONTEND EM UM PROJETO DE PRODUÇÃO! ELA FICARÁ EXPOSTA!         !!!
// !!! Para este exercício de APRENDIZADO, faremos isso, mas em um        !!!
// !!! projeto real, use um backend proxy ou variáveis de ambiente        !!!
// !!! seguras durante o build.                                           !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const OPENWEATHER_API_KEY = "32ad5f39fc17a3b18cec5953e7a3227e"; // <-- SUBSTITUA PELA SUA CHAVE REAL


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
// ===                   NOVA FUNÇÃO renderizarGaragem                   === //
// ========================================================================= //
/**
 * Renders the entire garage display, now including the "Detalhes Extras" button
 * and placeholder div. Added more defensive checks and logging.
 */
function renderizarGaragem() {
    console.log("Iniciando renderizarGaragem..."); // Log início

    // Ensure containers exist
    if (!containerCarro || !containerCaminhao || !agendamentosListContainer) {
        console.error("ERRO FATAL: Containers HTML essenciais (listaCarros, listaCaminhoes, agendamentosFuturosLista) não encontrados! Renderização abortada.");
        if(globalStatusDiv) displayGlobalAlert("Erro crítico ao carregar interface da garagem.", "error", 0);
        // Se os containers principais não existem, não há muito o que fazer.
        return;
    }

    let carrosHtml = '';
    let caminhoesHtml = '';
    let carrosCount = 0;
    let caminhoesCount = 0;
    let veiculos = []; // Default to empty array

    // Defensively get vehicles from the garage instance
    if (minhaGaragem instanceof Garagem && typeof minhaGaragem.listarTodosVeiculos === 'function') {
        try {
            veiculos = minhaGaragem.listarTodosVeiculos();
            console.log(`Garagem contém ${veiculos.length} veículo(s).`);
        } catch (listError) {
            console.error("Erro ao listar veículos da garagem:", listError);
            displayGlobalAlert("Erro interno ao buscar lista de veículos.", "error");
            // Leave veiculos as empty array, UI will show "nenhum veículo"
        }
    } else {
        console.error("Instância 'minhaGaragem' não é válida ou não possui método listarTodosVeiculos. Renderizando garagem vazia.");
        if(globalStatusDiv) displayGlobalAlert("Erro interno: Instância da Garagem inválida.", "error", 0);
    }

    // --- Render Vehicle Cards ---
    veiculos.forEach((v, index) => {
        console.log(`Processando veículo ${index + 1}/${veiculos.length}: ID ${v?.id}`);
        // Extra validation for each vehicle object before processing
        if (!(v instanceof Vehicle) || !v.id || typeof v.modelo !== 'string' || typeof v._tipoVeiculo !== 'string') {
            console.warn("Item inválido ou incompleto na lista de veículos ignorado no índice:", index, v);
            return; // Skip this invalid item
        }

        // Check if CarroEsportivo and Caminhao classes exist before using instanceof
        const CarroEsportivoDefined = typeof CarroEsportivo !== 'undefined';
        const CaminhaoDefined = typeof Caminhao !== 'undefined';

        const isCarroEsportivo = CarroEsportivoDefined && v instanceof CarroEsportivo;
        const isCaminhao = CaminhaoDefined && v instanceof Caminhao;

        // Determine image path safely
        let imagePath = 'Imagens/default-vehicle.png'; // Default fallback
        try {
             if (isCarroEsportivo) imagePath = 'Imagens/carro-imagem.webp';
             else if (isCaminhao) imagePath = 'Imagens/pngtree-red-truck-transport-png-image_11506094.png'; // Verify this path exists
             // Add else if for other potential types
        } catch (e) { console.error(`Erro ao determinar caminho da imagem para ${v.id}:`, e); }

        // --- Build HTML for the card ---
        try {
            // Get formatted history safely
            const historicoHtml = typeof v.getHistoricoFormatado === 'function' ? v.getHistoricoFormatado() : "<li class='empty-history error'>Erro ao buscar histórico.</li>";

            // Check properties exist before accessing methods like toFixed
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
                     <!-- Status message area specific to this vehicle -->
                    <p id="status-${v.id}" class="status-veiculo" data-status-type="info" aria-live="polite"></p>
                    <div class="button-group-veiculo">
                        <button class="btn-veiculo-ligar" onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''} title="Ligar motor">Ligar</button>
                        <button class="btn-veiculo-desligar" onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado || v.velocidade > 0 ? 'disabled' : ''} title="${!v.ligado ? 'Já desligado' : v.velocidade > 0 ? 'Precisa parar primeiro' : 'Desligar motor'}">Desligar</button>
                        <button class="btn-veiculo-acelerar" onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''} title="${!v.ligado ? 'Precisa ligar' : 'Acelerar'}">Acelerar</button>
                        <button class="btn-veiculo-frear" onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade <= 0 ? 'disabled' : ''} title="${!v.ligado ? 'Precisa ligar' : v.velocidade <= 0 ? 'Já parado' : 'Frear'}">Frear</button>
                        ${isCarroEsportivo ? `
                            <button class="btn-veiculo-turbo-on" onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')" ${!v.ligado || v.turboAtivado ? 'disabled' : ''} title="${!v.ligado ? 'Precisa ligar' : v.turboAtivado ? 'Turbo já ON' : 'Ativar Turbo'}">Turbo ON</button>
                            <button class="btn-veiculo-turbo-off" onclick="executarAcaoVeiculo('${v.id}', 'desativarTurbo')" ${!v.ligado || !v.turboAtivado ? 'disabled' : ''} title="${!v.ligado ? 'Precisa ligar' : !v.turboAtivado ? 'Turbo já OFF' : 'Desativar Turbo'}">Turbo OFF</button>
                        ` : ''}
                        ${isCaminhao ? `
                            <button class="btn-veiculo-carregar" onclick="executarAcaoVeiculo('${v.id}', 'carregar')" ${(typeof v.cargaAtual !== 'number' || typeof v.capacidadeCarga !== 'number' || v.cargaAtual >= v.capacidadeCarga) ? 'disabled' : ''} title="${(typeof v.cargaAtual !== 'number' || typeof v.capacidadeCarga !== 'number' || v.cargaAtual >= v.capacidadeCarga) ? 'Carga máxima atingida' : 'Carregar Carga'}">Carregar</button>
                            <button class="btn-veiculo-descarregar" onclick="executarAcaoVeiculo('${v.id}', 'descarregar')" ${(typeof v.cargaAtual !== 'number' || v.cargaAtual <= 0) ? 'disabled' : ''} title="${(typeof v.cargaAtual !== 'number' || v.cargaAtual <= 0) ? 'Caminhão vazio' : 'Descarregar Carga'}">Descarregar</button>
                        ` : ''}
                        <button class="btn-veiculo-agendar" onclick="mostrarFormAgendamento('${v.id}')" title="Ver histórico e agendar manutenção">Histórico/Agendar</button>
                        <!-- NEW: Button for Simulated API -->
                        <button class="btn-detalhes-api" onclick="mostrarDetalhesVeiculo('${v.id}')" id="btn-detalhes-${v.id}" title="Buscar detalhes extras (simulado)">Ver Detalhes Extras</button>
                        <button class="btn-remover" onclick="removerVeiculoDaGaragem('${v.id}')" title="Remover este veículo permanentemente">Remover</button>
                    </div>
                    <!-- NEW: Div for Simulated API results - Starts hidden -->
                    <div class="detalhes-api-resultado" id="detalhes-${v.id}" aria-live="polite" style="display: none;">
                        <!-- Details will be loaded here by mostrarDetalhesVeiculo -->
                    </div>
                    <div class="historico-manutencao">
                        <h4>Histórico de Manutenção:</h4>
                        <ul>${historicoHtml}</ul>
                    </div>
                </div>
            `;
             // Append to the correct list
             if (isCarroEsportivo) { carrosHtml += veiculoCardHtml; carrosCount++; }
             else if (isCaminhao) { caminhoesHtml += veiculoCardHtml; caminhoesCount++; }
             // Add else if for other types if needed

        } catch (cardError) {
             console.error(`Erro ao gerar card HTML para veículo ${v?.id}:`, cardError);
             // Optionally add an error placeholder for this specific card to the list
             const errorCardHtml = `<div class="veiculo-item error-placeholder" style="border: 2px dashed red; padding: 10px;"><p style="color: red; font-weight: bold;">Erro ao carregar dados do veículo ${v?.id || 'desconhecido'}.</p></div>`;
             if (isCarroEsportivo) { carrosHtml += errorCardHtml; }
             else if (isCaminhao) { caminhoesHtml += errorCardHtml; }
        }
    }); // End forEach vehicle

    console.log(`HTML gerado. Carros: ${carrosCount}, Caminhões: ${caminhoesCount}. Atualizando DOM...`);

    // --- Update DOM ---
    // Use try-catch specifically around DOM manipulation as it can fail
    try {
        // Update Car List
        if (containerCarro) {
            containerCarro.innerHTML = `<h3>Carros Esportivos (${carrosCount})</h3>` +
                                       (carrosCount > 0 ? carrosHtml : '<p class="empty-list-placeholder">Nenhum carro esportivo na garagem.</p>');
            console.log("DOM da lista de carros atualizado.");
        } else {
            console.error("Container de carros (listaCarros) não encontrado para atualização!");
        }

        // Update Truck List
        if (containerCaminhao) {
            containerCaminhao.innerHTML = `<h3>Caminhões (${caminhoesCount})</h3>` +
                                          (caminhoesCount > 0 ? caminhoesHtml : '<p class="empty-list-placeholder">Nenhum caminhão na garagem.</p>');
            console.log("DOM da lista de caminhões atualizado.");
        } else {
             console.error("Container de caminhões (listaCaminhoes) não encontrado para atualização!");
        }
    } catch (domError) {
         console.error("Erro CRÍTICO ao atualizar o innerHTML das listas de veículos:", domError);
         if(globalStatusDiv) displayGlobalAlert("Erro grave ao exibir os veículos na interface. Verifique o console.", "error", 0);
         // Avoid further processing if critical DOM update failed
         return;
    }

    // --- Render Appointments List (Separate try-catch) ---
    try {
        // Check if Manutencao class is available for formatting
        const ManutencaoAvailable = typeof Manutencao !== 'undefined';
        let agendamentos = [];
         if (minhaGaragem instanceof Garagem && typeof minhaGaragem.listarAgendamentosFuturos === 'function') {
             agendamentos = minhaGaragem.listarAgendamentosFuturos();
         } else {
             console.warn("Não foi possível listar agendamentos: Instância da Garagem ou método inválido.");
             // throw new Error("Instância da Garagem ou método listarAgendamentosFuturos inválido.");
         }

        if (agendamentosListContainer) { // Check if container exists before updating
            if (agendamentos.length > 0) {
                agendamentosListContainer.innerHTML = agendamentos.map(item => {
                    // Defensive checks on the item structure
                     if (item?.veiculo instanceof Vehicle && item.veiculo.modelo && item?.manutencao && item.manutencao.data && (!ManutencaoAvailable || item.manutencao instanceof Manutencao)) {
                         let dataFormatada = 'Data inválida';
                         let custoFormatado = 'Custo N/D';
                         let tipoServico = item.manutencao.tipo || 'Serviço Agendado'; // Default type

                         try { dataFormatada = new Date(item.manutencao.data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch(e){ console.warn("Erro ao formatar data do agendamento:", e); }

                         // Format currency only if Manutencao class exists and custo is valid
                         if (ManutencaoAvailable && item.manutencao instanceof Manutencao && typeof item.manutencao.custo === 'number') {
                             custoFormatado = item.manutencao.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                         } else if (typeof item.manutencao.custo === 'number') {
                              custoFormatado = `R$ ${item.manutencao.custo.toFixed(2)}`; // Basic format if class missing
                         }

                        return `<li><strong>${item.veiculo.modelo}</strong>: ${tipoServico} em ${dataFormatada} (${custoFormatado})</li>`;
                     }
                     console.warn("Item de agendamento futuro inválido ignorado na renderização:", item);
                     return ''; // Return empty string for invalid items to avoid breaking map/join
                }).join('');
            } else {
                agendamentosListContainer.innerHTML = '<li class="empty-list-placeholder">Nenhum agendamento futuro encontrado.</li>';
            }
            console.log("Lista de agendamentos atualizada.");
        } else {
             console.error("Container de agendamentos (agendamentosFuturosLista) não encontrado!");
        }

    } catch (agendError) {
         console.error("Erro ao renderizar lista de agendamentos:", agendError);
         if(agendamentosListContainer) agendamentosListContainer.innerHTML = '<li class="empty-list-placeholder error-message">Erro ao carregar agendamentos.</li>';
    }

    console.log("Renderização da garagem concluída com sucesso.");
    // Check for upcoming appointments after rendering is complete
    try {
        // Ensure the function exists before calling
        if (typeof verificarAgendamentosProximos === 'function') {
            verificarAgendamentosProximos();
        }
    } catch (checkError) {
         console.error("Erro durante a verificação de agendamentos próximos:", checkError);
    }
}
// ========================================================================= //
// ===              FIM DA NOVA FUNÇÃO renderizarGaragem                 === //
// ========================================================================= //


// --- FUNÇÕES DE AÇÃO DO VEÍCULO ---

/** Creates a new vehicle from form input */
function criarNovoVeiculo(tipo) {
    // Find form elements defensively
    const formIdPrefix = tipo === 'CarroEsportivo' ? 'Esportivo' : 'Caminhao';
    const modeloInput = document.getElementById(`modelo${formIdPrefix}`);
    const corInput = document.getElementById(`cor${formIdPrefix}`);
    const formElement = modeloInput?.closest('.form-adicionar'); // Find parent form

    if (!modeloInput || !corInput || !formElement) {
        console.error(`Erro: Elementos do formulário para ${tipo} não encontrados.`);
        displayGlobalAlert(`Erro interno: Formulário de ${tipo} não encontrado.`, "error");
        return;
    }

    let veiculo; // Declare veiculo variable

    try {
        const modelo = modeloInput.value.trim();
        const cor = corInput.value.trim();

        // Basic validation
        let formIsValid = true;
        clearFormErrors(formElement); // Clear previous errors on this form
        if (!modelo) {
            showFieldError(modeloInput, "Modelo é obrigatório.");
            formIsValid = false;
        }
        if (!cor) {
            showFieldError(corInput, "Cor é obrigatória.");
            formIsValid = false;
        }

        // Type-specific validation and creation
        if (tipo === 'Caminhao') {
            const capacidadeInput = document.getElementById('capacidadeCaminhao');
            if (!capacidadeInput) throw new Error("Input de capacidade não encontrado."); // Critical error

            const capacidadeStr = capacidadeInput.value;
            const capacidade = parseFloat(capacidadeStr);
             if (capacidadeStr === '' || isNaN(capacidade) || capacidade < 0) {
                showFieldError(capacidadeInput, "Capacidade de carga inválida (deve ser 0 ou maior).");
                formIsValid = false;
             }
             if (formIsValid) {
                  // Ensure Caminhao class exists
                  if (typeof Caminhao === 'undefined') throw new Error("Classe Caminhao não definida.");
                 veiculo = new Caminhao(modelo, cor, capacidade);
             }
        } else if (tipo === 'CarroEsportivo') {
             if (formIsValid) {
                  // Ensure CarroEsportivo class exists
                  if (typeof CarroEsportivo === 'undefined') throw new Error("Classe CarroEsportivo não definida.");
                 veiculo = new CarroEsportivo(modelo, cor);
             }
        } else {
            // Should not happen if called correctly, but good to have a fallback
            throw new Error(`Tipo de veículo desconhecido para criação: ${tipo}`);
        }

        // Only proceed if form is valid and vehicle was created
        if (formIsValid && veiculo) {
             // Check if Garagem instance is valid
             if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.adicionarVeiculo === 'function')) {
                 throw new Error("Instância da Garagem inválida, não é possível adicionar veículo.");
             }
            if (minhaGaragem.adicionarVeiculo(veiculo)) {
                displayGlobalAlert(`${veiculo.modelo} (${veiculo._tipoVeiculo}) adicionado com sucesso!`, 'success');
                renderizarGaragem();
                // Clear form fields only on successful addition
                modeloInput.value = '';
                corInput.value = '';
                 if (tipo === 'Caminhao') {
                    const capacidadeInput = document.getElementById('capacidadeCaminhao');
                    if(capacidadeInput) capacidadeInput.value = '10000'; // Reset default
                 }
                formElement.classList.remove('form-error-highlight'); // Remove highlight if it was there
            } // Else: Error message handled by adicionarVeiculo

        } else if (!formIsValid) {
             // If basic validation failed, show general form error message
             displayGlobalAlert("Por favor, corrija os erros no formulário.", "warning");
             formElement.classList.add('form-error-highlight');
             // Focus the first field with an error
             formElement.querySelector('.form-group.error input')?.focus();
             // Optional: Add shake animation
             // formElement.classList.add('shake');
             // setTimeout(() => formElement.classList.remove('shake'), 500);
        }

    } catch (error) {
        // Catch errors from class constructors or unexpected issues
        console.error(`Erro inesperado ao criar ${tipo}:`, error);
         displayGlobalAlert(`Erro ao criar ${tipo}: ${error.message}`, 'error');
         if(formElement) { // Highlight form on error
             formElement.classList.add('form-error-highlight');
             // Optional: Add shake animation class if defined in CSS
             // formElement.classList.add('shake');
             // Focus the first input as a fallback
             formElement.querySelector('input, textarea')?.focus();
             // Remove highlight after a delay
             // setTimeout(() => formElement.classList.remove('form-error-highlight'), 3000);
             // setTimeout(() => formElement.classList.remove('shake'), 500);
         }
    }
}

/** Removes a vehicle after confirmation */
function removerVeiculoDaGaragem(idVeiculo) {
     // Validate ID
     if (!idVeiculo) {
         console.error("Tentativa de remover veículo com ID inválido.");
         displayGlobalAlert("Erro interno: ID do veículo inválido para remoção.", "error");
         return;
     }
      // Check if Garagem instance is valid
      if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function' && typeof minhaGaragem.removerVeiculo === 'function')) {
          displayGlobalAlert("Erro interno: Instância da Garagem inválida.", "error", 0);
          return;
      }

     const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
     // Use vehicle details if found, otherwise just the ID
     const nomeVeiculo = veiculo ? `${veiculo.modelo} (${veiculo.cor})` : `veículo com ID ${idVeiculo}`;
     const tipoVeiculo = veiculo ? (veiculo._tipoVeiculo || "Veículo") : "Veículo";

     // Confirmation prompts
     // Use \n for newlines in confirm dialogs
     if (confirm(`Tem certeza que deseja remover o ${tipoVeiculo.toLowerCase()} ${nomeVeiculo}?\n\nEsta ação não pode ser desfeita!`)) {
         // Second confirmation for extra safety
         if (confirm(`CONFIRMAÇÃO FINAL:\nApagar permanentemente ${nomeVeiculo}?`)) {
             const veiculoCard = document.getElementById(`veiculo-${idVeiculo}`);

             if (minhaGaragem.removerVeiculo(idVeiculo)) {
                 displayGlobalAlert(`Veículo ${nomeVeiculo} removido com sucesso.`, 'success');

                 // Animate removal if the card exists in the DOM
                 if (veiculoCard) {
                     veiculoCard.style.transition = 'opacity 0.5s ease, transform 0.5s ease, max-height 0.5s ease, margin 0.5s ease, padding 0.5s ease, border 0.5s ease';
                     veiculoCard.style.opacity = '0';
                     veiculoCard.style.transform = 'scale(0.9)';
                     // Animate height collapse (use max-height for smoother transition than height)
                     veiculoCard.style.maxHeight = '0px';
                     veiculoCard.style.paddingTop = '0';
                     veiculoCard.style.paddingBottom = '0';
                     veiculoCard.style.marginTop = '0';
                     veiculoCard.style.marginBottom = '0';
                     veiculoCard.style.borderWidth = '0';
                     veiculoCard.style.overflow = 'hidden'; // Hide content during transition

                      // Use transitionend event to remove the element after animation completes
                      veiculoCard.addEventListener('transitionend', () => {
                          veiculoCard.remove(); // Remove element from DOM
                          // Optionally re-render if layout needs adjustment, but often removal is enough
                          // renderizarGaragem();
                      }, { once: true }); // Listener executes only once
                 } else {
                      // If card wasn't found (e.g., error during previous render), just re-render
                      console.warn(`Card do veículo ${idVeiculo} não encontrado no DOM para animação de remoção.`);
                      renderizarGaragem();
                 }
             } else {
                 // removerVeiculo already shows an alert if it fails
                 // displayGlobalAlert(`Erro: Não foi possível remover ${nomeVeiculo}. Verifique o console.`, 'error');
                 // Optionally re-render to ensure UI consistency if removal failed unexpectedly
                 renderizarGaragem();
             }
         } else {
              console.log(`Remoção de ${nomeVeiculo} cancelada (confirmação final).`);
              displayGlobalAlert("Remoção cancelada.", "info", 3000);
         }
    } else {
         console.log(`Remoção de ${nomeVeiculo} cancelada.`);
         displayGlobalAlert("Remoção cancelada.", "info", 3000);
    }
}


/** Executes an action on a vehicle */
function executarAcaoVeiculo(idVeiculo, acao, param = null) {
     // Check if Garagem instance is valid
     if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function')) {
         displayGlobalAlert("Erro interno: Instância da Garagem inválida.", "error", 0);
         return;
     }
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo) {
        displayGlobalAlert(`Erro: Veículo ID ${idVeiculo} não encontrado na garagem. Atualizando interface...`, 'error', 6000);
        renderizarGaragem(); // Re-render to reflect the missing vehicle
        return;
    }

    let message = '', statusType = 'info', soundId = null, finalParam = param;

    // Determine default parameters ONLY if param is explicitly null and action needs one
    // Wrap this logic in try-catch as instanceof might fail if classes not defined
    try {
        if (finalParam === null) {
            const isCaminhao = typeof Caminhao !== 'undefined' && veiculo instanceof Caminhao;
            switch (acao) {
                case 'acelerar': finalParam = isCaminhao ? 5 : 15; break;
                case 'frear': finalParam = isCaminhao ? 3 : 10; break;
                case 'carregar': finalParam = isCaminhao ? 1000 : null; break; // Default load only for truck
                case 'descarregar': finalParam = isCaminhao ? 500 : null; break; // Default unload only for truck
            }
            // Log only if a default was actually applied for relevant actions
            if (param === null && finalParam !== null && ['acelerar', 'frear', 'carregar', 'descarregar'].includes(acao)) {
                 console.log(`[Ação ${acao} em ${veiculo.modelo}] Usando valor padrão: ${finalParam}`);
            }
        }
    } catch (e) {
         console.error("Erro ao determinar parâmetro padrão (verifique definições de classe):", e);
    }


    try {
        // Check if the action method actually exists on the vehicle object
        if (typeof veiculo[acao] === 'function') {
            message = veiculo[acao](finalParam); // Call the action method

            // --- Determine feedback based on action and message ---
            statusType = 'info'; // Default status
            soundId = null;      // Default no sound

            // Check message content for keywords indicating success, warning, or error
             const lowerCaseMessage = message.toLowerCase();
             if (lowerCaseMessage.includes('inválido') || lowerCaseMessage.includes('não é possível') || lowerCaseMessage.includes('precisa estar') || lowerCaseMessage.includes('precisa parar')) {
                 statusType = 'warning';
             } else if (lowerCaseMessage.includes('erro')) {
                  statusType = 'error';
             } else if (lowerCaseMessage.includes('ligado') || lowerCaseMessage.includes('desligado') || lowerCaseMessage.includes('ativado') || lowerCaseMessage.includes('desativado') || lowerCaseMessage.includes('carregado') || lowerCaseMessage.includes('descarregado') || lowerCaseMessage.includes('sucesso')) {
                  statusType = 'success'; // Assume success if common success words present
             }


            // Assign sounds based on action (if successful or informative)
            if (statusType !== 'error' && statusType !== 'warning') {
                 switch (acao) {
                     case 'ligar': soundId = 'somLigar'; statusType = 'success'; break; // Ensure success type
                     case 'desligar': soundId = 'somDesligar'; statusType = 'success'; break; // Ensure success type
                     case 'acelerar': soundId = 'somAcelerar'; statusType = 'info'; break; // Usually info
                     case 'frear': if (veiculo.velocidade >= 0) { soundId = 'somFrear'; statusType = 'info'; } break; // Play if speed was > 0 before braking
                     case 'ativarTurbo': soundId = 'somAcelerar'; statusType = 'turbo'; break; // Specific type for turbo
                     case 'desativarTurbo': statusType = 'info'; break; // Usually just info
                     case 'carregar': statusType = 'success'; break; // Assume success unless message indicated warning
                     case 'descarregar': statusType = 'success'; break;
                     default: soundId = null; // No sound for unknown actions
                 }
            }
            // Refine status type based on specific results for specific actions
             if (acao === 'desligar' && lowerCaseMessage.includes('precisa parar')) statusType = 'warning';
             if (acao === 'carregar' && (lowerCaseMessage.includes('excedida') || lowerCaseMessage.includes('máxima'))) statusType = 'warning';
             if (acao === 'descarregar' && lowerCaseMessage.includes('vazio')) statusType = 'info';


            // --- Apply feedback ---
            if (soundId) playSound(soundId);
            updateVehicleStatusUI(idVeiculo, message, statusType); // Show status message on the card
            minhaGaragem.salvar(); // Save state changes resulting from the action
            renderizarGaragem(); // Update the entire UI to reflect changes (button states, info)

        } else {
            // The action method doesn't exist on the vehicle instance
            message = `Ação '${acao}' não é válida para ${veiculo.modelo} (${veiculo._tipoVeiculo}).`;
            statusType = 'error';
            console.error(message, veiculo);
            updateVehicleStatusUI(idVeiculo, message, statusType, 6000); // Show error on card
        }
    } catch (error) {
        // Catch unexpected errors during the execution of the action method
        console.error(`Erro durante a execução da ação '${acao}' no veículo ${idVeiculo}:`, error);
        message = `Erro ao executar '${acao}': ${error.message || 'Erro desconhecido'}`;
        statusType = 'error';
        updateVehicleStatusUI(idVeiculo, message, statusType, 8000); // Show error longer
        // Optionally re-render to reset UI state if the action failed badly
        // renderizarGaragem();
    }
}

// --- FUNÇÕES DE AGENDAMENTO / HISTÓRICO ---

/** Clears form validation errors visually */
 function clearFormErrors(formElement) {
     if (!formElement) return;
     // Remove error class from form groups
     formElement.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));
     // Remove existing error message spans
     formElement.querySelectorAll('.error-message').forEach(el => el.remove());
 }

 /** Shows validation error message for a specific input field */
 function showFieldError(inputElement, message) {
     const formGroup = inputElement?.closest('.form-group');
     if (!formGroup) {
         console.warn("Não foi possível encontrar .form-group para exibir erro:", inputElement);
         return; // Can't show error if structure is wrong
     }
     // Remove any previous error message in this group first
     formGroup.querySelector('.error-message')?.remove();
     // Add error class for styling the input/group
     formGroup.classList.add('error');
     // Create and insert the error message span
     const errorSpan = document.createElement('span');
     errorSpan.className = 'error-message';
     errorSpan.setAttribute('role', 'alert'); // For accessibility
     errorSpan.textContent = message;
     // Insert after the input or textarea, or after the <small> hint text if it exists
     const smallHelp = formGroup.querySelector('small');
     if (smallHelp) {
         smallHelp.after(errorSpan);
     } else {
          inputElement.after(errorSpan);
     }
 }

/** Displays the maintenance modal and pre-fills data */
function mostrarFormAgendamento(idVeiculo) {
    // Check essential modal elements exist
    if (!agendamentoModal || !formAgendamento || !agendamentoTituloVeiculo || !agendamentoVeiculoIdInput || !agendamentoDataInput || !agendamentoTipoInput || !agendamentoCustoInput || !agendamentoDescricaoInput) {
        displayGlobalAlert("Erro crítico: Elementos do modal de agendamento não encontrados.", "error", 0);
        console.error("Elementos do modal não encontrados. Abortando exibição.");
        return;
    }
     // Check if Garagem instance is valid
     if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function')) {
         displayGlobalAlert("Erro interno: Instância da Garagem inválida.", "error", 0);
         return;
     }

    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo) {
        displayGlobalAlert("Erro: Veículo não encontrado para agendamento.", "error");
        console.error(`Veículo com ID ${idVeiculo} não encontrado.`);
        return;
    }

    // --- Prepare Modal ---
    agendamentoVeiculoIdInput.value = idVeiculo;
    agendamentoTituloVeiculo.textContent = `Histórico / Agendar: ${veiculo.modelo} (${veiculo.cor})`;
    formAgendamento.reset(); // Clear previous form values
    clearFormErrors(formAgendamento); // Clear previous validation errors

    // --- Set Default Date/Time to Now ---
    try {
        const now = new Date();
        // Adjust for timezone offset to get local time in correct format
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        now.setSeconds(0); // Optional: zero out seconds/ms
        now.setMilliseconds(0);
        const defaultDateTimeStr = now.toISOString().slice(0, 16); // Format YYYY-MM-DDTHH:mm
        agendamentoDataInput.min = defaultDateTimeStr; // Prevent selecting past dates/times (browser enforces this roughly)
        agendamentoDataInput.value = defaultDateTimeStr; // Default to current local time
    } catch(e) {
        console.error("Erro ao definir data/hora padrão no formulário:", e);
        // Fallback: set min to today's date only
        try {
             agendamentoDataInput.min = new Date().toISOString().split("T")[0];
        } catch (minDateError) { console.error("Falha ao definir data mínima.", minDateError); }
        agendamentoDataInput.value = ''; // Clear value if formatting failed
    }

    // --- Optional: Populate History List within Modal (if design requires) ---
    // const historyListElement = agendamentoModal.querySelector('.modal-history-list ul');
    // if (historyListElement && typeof veiculo.getHistoricoFormatado === 'function') {
    //     historyListElement.innerHTML = veiculo.getHistoricoFormatado();
    // }

    // --- Display Modal ---
    agendamentoModal.style.display = 'block';
    agendamentoModal.setAttribute('aria-hidden', 'false');
    // Focus the first editable field for accessibility and usability
    agendamentoTipoInput.focus();
}


/** Closes the maintenance modal */
function fecharFormAgendamento() {
     if (agendamentoModal) {
        // Add animation class before hiding if desired
        // agendamentoModal.classList.add('modal-closing');
        // agendamentoModal.addEventListener('animationend', () => { ... }, { once: true });

        agendamentoModal.style.display = 'none';
        agendamentoModal.setAttribute('aria-hidden', 'true');
        // agendamentoModal.classList.remove('modal-closing');
    }
    // Reset form fields and clear errors when closing
    if (formAgendamento) {
         formAgendamento.reset();
         clearFormErrors(formAgendamento); // Ensure errors are cleared on close
    }
    // Clear hidden vehicle ID
    if (agendamentoVeiculoIdInput) {
         agendamentoVeiculoIdInput.value = '';
    }
    // Optionally, refocus the button that opened the modal if possible and desirable
}

/** Handles saving maintenance/appointment from modal form */
function salvarAgendamento(event) {
    event.preventDefault(); // Prevent default form submission
    if (!formAgendamento || !agendamentoVeiculoIdInput) {
         console.error("Formulário de agendamento ou input de ID não encontrado.");
         displayGlobalAlert("Erro interno ao salvar agendamento.", "error");
         return;
    }

    clearFormErrors(formAgendamento); // Clear previous errors first

    // Get form values
    const veiculoId = agendamentoVeiculoIdInput.value;
    const data = agendamentoDataInput.value; // YYYY-MM-DDTHH:mm string
    const tipo = agendamentoTipoInput.value.trim();
    const custoStr = agendamentoCustoInput.value;
    const descricao = agendamentoDescricaoInput.value.trim();

    // Find the vehicle
     if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.encontrarVeiculoPorId === 'function')) {
         displayGlobalAlert("Erro interno: Instância da Garagem inválida.", "error", 0);
         return;
     }
    const veiculo = minhaGaragem.encontrarVeiculoPorId(veiculoId);
    if (!veiculo) {
        displayGlobalAlert("Erro Crítico: Veículo não foi encontrado ao salvar agendamento!", "error", 8000);
        fecharFormAgendamento(); // Close modal as vehicle is gone
        renderizarGaragem(); // Update UI to reflect missing vehicle
        return;
    }

    // --- Validation ---
    let isValid = true;
    // Date validation
    if (!data) {
        showFieldError(agendamentoDataInput, "Data e Hora são obrigatórios.");
        isValid = false;
    } else {
        // Use the validation method from Manutencao class if available and preferred
        if (typeof Manutencao?.prototype?.validarData === 'function') {
            const tempManut = { validarData: Manutencao.prototype.validarData }; // Temporary object to call prototype method
            if (!tempManut.validarData(data)) {
                showFieldError(agendamentoDataInput, "Formato de Data e Hora inválido (YYYY-MM-DDTHH:mm).");
                isValid = false;
            }
        } else { // Fallback basic check
            try {
                 if (isNaN(new Date(data).getTime())) {
                     showFieldError(agendamentoDataInput, "Formato de Data e Hora inválido.");
                     isValid = false;
                 }
            } catch (e) {
                 showFieldError(agendamentoDataInput, "Erro ao validar Data e Hora.");
                 isValid = false;
            }
        }
    }
    // Type validation
    if (!tipo) {
        showFieldError(agendamentoTipoInput, "Tipo de serviço é obrigatório.");
        isValid = false;
    }
    // Cost validation
    const custoNum = parseFloat(custoStr);
    if (custoStr === '' || isNaN(custoNum) || custoNum < 0) {
        showFieldError(agendamentoCustoInput, "Custo é obrigatório (use 0 se não aplicável). Deve ser 0 ou maior.");
        isValid = false;
    }
    // Description is optional, no validation needed unless specific rules apply

    // If validation fails, stop processing
    if (!isValid) {
         displayGlobalAlert("Por favor, corrija os erros no formulário antes de salvar.", "warning");
         // Focus the first field with an error for better UX
         formAgendamento.querySelector('.form-group.error input, .form-group.error textarea')?.focus();
        return;
    }

    // --- Create and Add Maintenance Record ---
    try {
        // Ensure Manutencao class is available
        if (typeof Manutencao === 'undefined') {
             throw new Error("Classe Manutencao não está definida. Não é possível salvar.");
        }
        // Pass validated data to constructor
        const novaManutencao = new Manutencao(data, tipo, custoNum, descricao, veiculoId);

        // Ensure adicionarManutencao method exists
        if (typeof veiculo.adicionarManutencao !== 'function') {
             throw new Error("Método adicionarManutencao não encontrado no veículo.");
        }

        if (veiculo.adicionarManutencao(novaManutencao)) {
             minhaGaragem.salvar(); // Persist changes
             renderizarGaragem(); // Update the main UI (history list in card, upcoming list)
             fecharFormAgendamento(); // Close the modal
             displayGlobalAlert("Registro de manutenção salvo com sucesso!", "success");
        } else {
             // adicionarManutencao should have shown an error via displayGlobalAlert,
             // but add a fallback here just in case.
             displayGlobalAlert("Falha desconhecida ao adicionar o registro de manutenção.", "error");
        }
    } catch (error) {
        // Catch errors from Manutencao constructor or adicionarManutencao
        console.error("Erro ao criar ou salvar registro de manutenção:", error);
        // Display specific error message if available, otherwise generic
        displayGlobalAlert(`Erro ao salvar: ${error.message || 'Verifique os dados e tente novamente.'}`, "error", 7000);
         // Highlight form again if error likely related to data
         formAgendamento.classList.add('form-error-highlight');
    }
}

// --- VERIFICAÇÃO DE AGENDAMENTOS PRÓXIMOS ---

/** Checks and alerts for upcoming appointments (within the next ~24 hours) */
function verificarAgendamentosProximos() {
    // Don't run if garage or alert mechanism isn't ready
    if (!(minhaGaragem instanceof Garagem && typeof minhaGaragem.listarTodosVeiculos === 'function') || !globalStatusDiv) {
         // console.log("Garagem ou Alerta Global não pronto, pulando verificação de agendamentos.");
         return;
    }
    // Check if Manutencao class is available
     const ManutencaoAvailable = typeof Manutencao !== 'undefined';
     if (!ManutencaoAvailable) {
         // console.warn("Classe Manutencao não definida, verificação de agendamentos pulada.");
         return; // Cannot check if Manutencao isn't defined
     }

     // Get vehicles only if needed
     if (minhaGaragem.listarTodosVeiculos().length === 0) {
         // console.log("Garagem vazia, pulando verificação de agendamentos.");
        return; // No vehicles, no appointments to check
    }

    let agendamentosFuturos = [];
    try {
        agendamentosFuturos = minhaGaragem.listarAgendamentosFuturos();
    } catch (listAgendError) {
         console.error("Erro ao listar agendamentos futuros:", listAgendError);
         // Avoid flooding with alerts, just log it for now
         return;
    }


    if (agendamentosFuturos.length === 0) {
        // console.log("Nenhum agendamento futuro encontrado para verificar.");
        return; // No future appointments
    }

    const agora = new Date();
    // Define the "near future" window (e.g., end of tomorrow)
    const amanhaFimDoDia = new Date(agora);
    amanhaFimDoDia.setDate(agora.getDate() + 1); // Move to tomorrow
    amanhaFimDoDia.setHours(23, 59, 59, 999); // Set to the very end of tomorrow

    const hojeStr = agora.toDateString(); // Get "Mon Apr 01 2024" format for daily tracking

    // Reset daily alert tracking if the day has changed
    if (!alertadosHoje.has(hojeStr)) {
        console.log("Novo dia detectado, resetando conjunto de alertas diários.");
        // Keep IDs from previous day's check if they were for "Amanhã" to prevent re-alerting on the actual day? Maybe too complex. Simple clear is fine.
        alertadosHoje.clear();
        alertadosHoje.add(hojeStr); // Add today's date string to prevent immediate re-clearing
    }

    let alertsShownThisCheck = 0;
    agendamentosFuturos.forEach(item => {
         // Validate item structure - Ensure it has the expected shape from listarAgendamentosFuturos
         if (!(item?.veiculo instanceof Vehicle) || !(item?.manutencao instanceof Manutencao) || !item.manutencao.id || !item.manutencao.data) {
             console.warn("Item de agendamento futuro inválido encontrado durante verificação:", item);
             return; // Skip invalid item
         }
         const manutId = item.manutencao.id; // Use maintenance ID for tracking alerts

         // Skip if already alerted for this specific maintenance ID today
         if (alertadosHoje.has(manutId)) {
             return;
         }

        try {
            const dataManutencao = new Date(item.manutencao.data);
            // Skip if date is invalid
            if (isNaN(dataManutencao.getTime())) {
                console.warn(`Data inválida encontrada para manutenção ${manutId}: ${item.manutencao.data}`);
                return;
            }

            // Check if the appointment is within the "near future" window (now until end of tomorrow)
            if (dataManutencao >= agora && dataManutencao <= amanhaFimDoDia) {
                 // Format date/time nicely for the alert
                 const dataHoraFormatada = dataManutencao.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short'});
                 // Determine if it's "HOJE" or "Amanhã"
                 const diaFormatado = dataManutencao.toDateString() === hojeStr ? "HOJE" : "Amanhã";
                 const tipoServico = item.manutencao.tipo || "Manutenção";
                 const nomeVeiculo = item.veiculo.modelo || "Veículo";

                 // Display the alert using the global function
                 displayGlobalAlert(
                     `Lembrete (${diaFormatado}): ${tipoServico} para ${nomeVeiculo} às ${dataHoraFormatada}!`,
                     'warning', // Use warning style for alerts
                     15000 // Show alert for 15 seconds
                 );

                 alertadosHoje.add(manutId); // Mark this specific appointment as alerted for today
                 alertsShownThisCheck++;
            }
        } catch (e) {
             console.error(`Erro ao processar data do agendamento ${manutId} (${item.manutencao.data}):`, e);
             // Don't mark as alerted if there was an error processing it
        }
    });

     // Optional: Log how many alerts were shown in this check
     // if (alertsShownThisCheck > 0) {
     //     console.log(`${alertsShownThisCheck} alertas de agendamento próximo exibidos.`);
     // }
}


// --- PARTE 1: FUNÇÕES DA API SIMULADA ---

/**
 * Fetches additional vehicle details from the simulated local API (JSON file).
 * @param {string} vehicleId The unique ID of the vehicle to look up.
 * @returns {Promise<object|null>} A promise that resolves with the details object or null if not found/error.
 */
async function buscarDetalhesVeiculoAPI(vehicleId) {
    const apiUrl = './dados_veiculos_api.json'; // Path to your local JSON file
    if (!vehicleId) {
         console.error("buscarDetalhesVeiculoAPI chamado sem vehicleId.");
         return null;
    }

    try {
        const response = await fetch(apiUrl, {
             method: 'GET', // Explicitly GET
             headers: {
                 'Accept': 'application/json' // Indicate we expect JSON
             },
             cache: 'no-cache' // Prevent browser caching during development/testing
        });

        if (!response.ok) {
            // Handle HTTP errors (like 404 Not Found if the file is missing or path is wrong)
            // Log the specific error for better debugging
             console.error(`Erro HTTP ${response.status} ao buscar ${apiUrl}: ${response.statusText}`);
            throw new Error(`Não foi possível carregar os detalhes (Erro ${response.status}). Verifique o caminho do arquivo JSON.`);
        }

        const allData = await response.json();

        // Check if the response is a valid object and has the requested key
        if (allData && typeof allData === 'object' && allData.hasOwnProperty(vehicleId)) {
            return allData[vehicleId]; // Return the details object for the specific vehicle
        } else {
            // Vehicle ID not found within the JSON data
            console.log(`Detalhes para ID ${vehicleId} não encontrados em ${apiUrl}.`);
            return null;
        }
    } catch (error) {
        // Catch network errors (fetch fails) or JSON parsing errors
        console.error(`Falha ao buscar ou processar ${apiUrl} para ID ${vehicleId}:`, error);
        // Return null to indicate failure, the caller function will handle the UI message
        // Optionally, re-throw or return a specific error object if needed
        // throw error; // Re-throw if the caller should handle it more specifically
         // Return a specific error object to distinguish from "not found"
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

    // Ensure UI elements exist before proceeding
    if (!resultDiv || !button) {
        console.error(`Elementos da UI (resultDiv ou button) não encontrados para detalhes do veículo ${vehicleId}`);
        displayGlobalAlert(`Erro interno: Não é possível exibir detalhes para ${vehicleId}.`, "error");
        return;
    }

    // --- Indicate Loading State ---
    resultDiv.innerHTML = '<p class="loading-message">Carregando detalhes extras...</p>';
    resultDiv.className = 'detalhes-api-resultado'; // Reset classes
    resultDiv.style.display = 'block'; // Ensure the container is visible
    button.disabled = true;
    button.textContent = 'Carregando...';
    // resultDiv.classList.add('loading');


    try {
        const detalhes = await buscarDetalhesVeiculoAPI(vehicleId);

        // --- Process Result ---
        // Check if there was an error during fetch/parse
        if (detalhes?.error) {
             throw new Error(detalhes.message); // Throw the error message from the fetch function
        }

        if (detalhes && typeof detalhes === 'object') {
            // Found details, format and display them
            let detailsHtml = '<h5>Detalhes Adicionais (Simulado)</h5>'; // Title for the section

            // Helper function to safely add detail lines
            const addDetail = (label, value, isLink = false) => {
                if (value !== null && value !== undefined && String(value).trim() !== '') { // Check for empty strings too
                     const displayValue = String(value); // Ensure it's a string
                     if (isLink) {
                         // Basic URL validation (optional but good)
                         if (displayValue.startsWith('http://') || displayValue.startsWith('https://')) {
                             return `<p><strong>${label}:</strong> <a href="${displayValue}" target="_blank" rel="noopener noreferrer">Acessar Link</a></p>`;
                         } else {
                              console.warn(`Valor inválido para link '${label}': ${displayValue}`);
                              return `<p><strong>${label}:</strong> Link inválido</p>`;
                         }
                     } else {
                         // Basic escaping for potential HTML injection (simple approach)
                         const escapedValue = displayValue.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                         return `<p><strong>${label}:</strong> ${escapedValue}</p>`;
                     }
                }
                 return ''; // Return empty string if value is missing/empty
            };

            detailsHtml += addDetail('Valor FIPE (Aprox)', detalhes.valorFipeAprox);
            detailsHtml += addDetail('Último Recall', detalhes.ultimoRecall || 'Nenhum registrado');
            detailsHtml += addDetail('Dica Manutenção', detalhes.dicaManutencao);
            detailsHtml += addDetail('Manual Online', detalhes.linkManual, true); // Mark as link
            detailsHtml += addDetail('Consumo Urbano (Aprox)', detalhes.consumoMedioUrbano || detalhes.consumoMedioCarregado); // Handle truck field name
            detailsHtml += addDetail('Consumo Rodoviário (Aprox)', detalhes.consumoMedioRodoviario);
             detailsHtml += addDetail('Intervalo Revisão', detalhes.intervaloRevisao); // Add truck specific field

            resultDiv.innerHTML = detailsHtml;
            resultDiv.className = 'detalhes-api-resultado'; // Reset class

        } else {
            // Details not found for this specific vehicle ID in the JSON (buscarDetalhes returned null, not error)
            resultDiv.innerHTML = '<p class="not-found-message">Detalhes extras não disponíveis para este veículo.</p>';
            resultDiv.className = 'detalhes-api-resultado'; // Reset class
            // resultDiv.classList.add('not-found');
        }
    } catch (error) {
        // Handle errors that might have been thrown from buscarDetalhesVeiculoAPI
        // or other unexpected errors during display.
        console.error(`Erro ao buscar ou exibir detalhes para ${vehicleId}:`, error);
        resultDiv.innerHTML = `<p class="error-message">Erro ao carregar detalhes: ${error.message || 'Tente novamente.'}</p>`;
        resultDiv.className = 'detalhes-api-resultado'; // Reset class
        // resultDiv.classList.add('error');
    } finally {
        // --- Reset Button State ---
        // Ensure the button is re-enabled regardless of success or failure
        button.disabled = false;
        button.textContent = 'Ver Detalhes Extras';
    }
}


// --- PARTE 2: FUNÇÕES DA API REAL (OpenWeatherMap) ---

/**
 * Fetches current weather data from OpenWeatherMap API.
 * Handles API key check, URL construction, fetch request, and response parsing.
 * Returns a structured object with weather data or an error object.
 * @param {string} nomeCidade The name of the city.
 * @returns {Promise<object>} A promise resolving to the weather data or an error object.
 */
async function buscarPrevisaoTempo(nomeCidade) {
    // --- Input Validation ---
    if (!nomeCidade || typeof nomeCidade !== 'string' || nomeCidade.trim() === '') {
        console.warn("buscarPrevisaoTempo: Nome da cidade vazio ou inválido.");
        return { error: true, message: "Por favor, digite um nome de cidade válido." };
    }
    const cidadeTrimmed = nomeCidade.trim();

    // --- API Key Check ---
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "COLOQUE_SUA_CHAVE_API_OPENWEATHERMAP_AQUI") {
         console.error("buscarPrevisaoTempo: Chave da API OpenWeatherMap não configurada!");
         // Return a user-friendly error, don't expose details about the key itself
         return { error: true, message: "Erro de configuração do serviço de clima. Contate o administrador." };
    }

    // --- API URL Construction ---
    const cidadeCodificada = encodeURIComponent(cidadeTrimmed);
    const units = 'metric'; // Celsius
    const lang = 'pt_br';   // Portuguese Brazil
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidadeCodificada}&appid=${OPENWEATHER_API_KEY}&units=${units}&lang=${lang}`;

    console.log(`Buscando previsão para: ${cidadeTrimmed} | URL: ${url}`); // Log for debugging

    // --- Fetch and Process ---
    try {
        const response = await fetch(url);

        // Attempt to parse JSON regardless of status, as OWM includes error details in the body
        let data;
        try {
             data = await response.json();
             console.log("Resposta da API OpenWeather:", data); // Log the full response for debugging
        } catch (jsonError) {
            // Handle cases where the response is not valid JSON (e.g., server error 500 with HTML)
            console.error(`Erro ao parsear JSON da resposta OpenWeather (Status: ${response.status}):`, jsonError);
             throw new Error(`Não foi possível ler a resposta do serviço de clima (Status: ${response.status}).`);
        }


        // --- Check Response Status (using data.cod and response.ok) ---
        // OWM uses 'cod' (usually 200 for success) and standard HTTP status codes.
        // Check both for robustness. data.cod might be a string or number.
        if (!response.ok || String(data.cod) !== '200') {
            let errorMessage = `Erro ${data.cod || response.status}: ${data.message || response.statusText || 'Não foi possível obter a previsão.'}`;

            // Provide more specific user feedback based on common error codes
            if (String(data.cod) === '401' || response.status === 401) {
                 errorMessage = "Erro de autenticação com o serviço de clima. Verifique a configuração."; // User doesn't need to know about the key
                 console.error("Erro 401: Chave da API OpenWeatherMap inválida ou não autorizada.");
            } else if (String(data.cod) === '404' || response.status === 404) {
                 errorMessage = `Cidade "${cidadeTrimmed}" não encontrada. Verifique o nome e tente novamente.`;
            } else if (String(data.cod) === '429' || response.status === 429) {
                 errorMessage = "Limite de requisições ao serviço de clima excedido. Tente novamente mais tarde.";
            }
             // Log the detailed error but throw a user-friendly one
             console.error("Erro da API OpenWeather:", errorMessage, "| Resposta completa:", data);
            throw new Error(errorMessage);
        }

        // --- Extract Relevant Data Safely ---
        // Use optional chaining (?.) and nullish coalescing (??) for safety
        const clima = {
            error: false, // Indicate success
            nomeCidade: data.name ?? cidadeTrimmed, // Use name from API if available
            pais: data.sys?.country ?? '',
            temperatura: data.main?.temp?.toFixed(1) ?? 'N/D',
            sensacao: data.main?.feels_like?.toFixed(1) ?? 'N/D',
            minima: data.main?.temp_min?.toFixed(1) ?? 'N/D',
            maxima: data.main?.temp_max?.toFixed(1) ?? 'N/D',
            // Capitalize first letter of description
            descricao: data.weather?.[0]?.description ? (data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)) : 'N/D',
            icone: data.weather?.[0]?.icon ?? null, // e.g., "01d", "10n"
            umidade: data.main?.humidity ?? 'N/D',
            ventoVelocidade: data.wind?.speed?.toFixed(1) ?? 'N/D', // m/s
            // ventoDirecao: data.wind?.deg, // degrees (optional to convert/display)
            nuvens: data.clouds?.all ?? 'N/D', // Cloudiness %
            // visibilidade: data.visibility, // meters (optional)
            // nascerSol: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR') : 'N/D',
            // porSol: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR') : 'N/D',
        };

        return clima; // Return the structured weather data

    } catch (error) {
        // Catch fetch network errors or errors thrown from status check/JSON parsing
        console.error(`Falha na requisição fetch ou processamento para OpenWeatherMap:`, error);
        // Return a structured error object with the caught message
        return {
             error: true,
             message: error.message || "Erro de rede ou ao processar a resposta da previsão do tempo."
        };
    }
}


/**
 * Handles the click event for the "Verificar Clima" button.
 * Gets city input, calls the API function, and updates the UI.
 */
async function verificarClimaHandler() {
    // Ensure UI elements are available
    if (!destinoInput || !previsaoResultadoDiv || !climaBtn) {
        console.error("Elementos da UI do planejador (input, div resultado, botão) não encontrados.");
        displayGlobalAlert("Erro interno: Interface do planejador de viagem indisponível.", "error", 0);
        return;
    }

    const cidade = destinoInput.value.trim();

    // --- Input Validation ---
    if (!cidade) {
        previsaoResultadoDiv.innerHTML = '<p class="error-message">Por favor, digite o nome da cidade de destino.</p>';
        previsaoResultadoDiv.className = 'weather-results error'; // Add error class for styling
        destinoInput.focus();
        return;
    }

    // --- Update UI to Loading State ---
    previsaoResultadoDiv.innerHTML = '<p>Buscando previsão do tempo...</p>';
    previsaoResultadoDiv.className = 'weather-results loading'; // Add loading class
    climaBtn.disabled = true;
    climaBtn.textContent = 'Buscando...';

    // --- Call API Function ---
    const resultadoClima = await buscarPrevisaoTempo(cidade);

    // --- Update UI with Results or Error ---
    if (resultadoClima.error) {
        // Display the error message from the API result
        previsaoResultadoDiv.innerHTML = `<p class="error-message">${resultadoClima.message}</p>`;
        previsaoResultadoDiv.className = 'weather-results error'; // Keep error class
    } else {
        // Build the HTML for a successful result
        let climaHtml = `<h5>Clima Atual em ${resultadoClima.nomeCidade} (${resultadoClima.pais || ''})</h5>`; // Header

        // Weather description with icon
        climaHtml += `<p class="weather-description">`; // Add class for specific styling if needed
        if (resultadoClima.icone) {
             // Use the 2x size icon for better resolution
             climaHtml += `<img src="https://openweathermap.org/img/wn/${resultadoClima.icone}@2x.png" alt="${resultadoClima.descricao}" class="weather-icon" title="${resultadoClima.descricao}"> `;
        }
        climaHtml += `<strong>${resultadoClima.descricao}</strong></p>`; // Already capitalized

        // Temperature details
        climaHtml += `<p><span title="Temperatura Atual">🌡️ Temp.:</span> ${resultadoClima.temperatura}°C (Sensação: ${resultadoClima.sensacao}°C)</p>`;
        climaHtml += `<p><span title="Temperaturas Mínima e Máxima Previstas">📊 Mín/Máx:</span> ${resultadoClima.minima}°C / ${resultadoClima.maxima}°C</p>`;

        // Other details
        climaHtml += `<p><span title="Umidade Relativa do Ar">💧 Umidade:</span> ${resultadoClima.umidade}%</p>`;
        if (resultadoClima.ventoVelocidade !== 'N/D') {
             // Optional: Convert m/s to km/h (multiply by 3.6)
             try {
                  const ventoKmH = (parseFloat(resultadoClima.ventoVelocidade) * 3.6).toFixed(1);
                  climaHtml += `<p><span title="Velocidade do Vento">💨 Vento:</span> ${ventoKmH} km/h</p>`;
             } catch (e) {
                  climaHtml += `<p><span title="Velocidade do Vento">💨 Vento:</span> ${resultadoClima.ventoVelocidade} m/s</p>`; // Fallback to m/s
             }
        }
         if (resultadoClima.nuvens !== 'N/D') {
              climaHtml += `<p><span title="Nebulosidade">☁️ Nuvens:</span> ${resultadoClima.nuvens}%</p>`;
         }

        previsaoResultadoDiv.innerHTML = climaHtml;
        previsaoResultadoDiv.className = 'weather-results'; // Reset class to default on success
    }

    // --- Reset Button State ---
    climaBtn.disabled = false;
    climaBtn.textContent = 'Verificar Clima';
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

        // Cache Planner elements
        destinoInput = document.getElementById('destino-viagem');
        climaBtn = document.getElementById('verificar-clima-btn');
        previsaoResultadoDiv = document.getElementById('previsao-tempo-resultado');

         // Basic check if essential elements exist
         if (!globalStatusDiv || !containerCarro || !containerCaminhao || !agendamentosListContainer || !agendamentoModal || !formAgendamento || !destinoInput || !climaBtn || !previsaoResultadoDiv) {
             throw new Error("Um ou mais elementos essenciais da UI não foram encontrados no DOM.");
         }

    } catch (error) { // --- CATCH BLOCK CORRIGIDO ---
        console.error("Erro Crítico ao buscar elementos do DOM essenciais:", error);

        // Attempt to use the global alert div for a persistent message
        // Check if the function exists AND if the div itself was successfully cached earlier
        if (typeof displayGlobalAlert === 'function' && globalStatusDiv) {
             displayGlobalAlert(`Erro grave ao carregar a interface: ${error.message}. Aplicação pode não funcionar corretamente. Verifique o console.`, "error", 0); // duration 0 = permanent
        } else {
             // Fallback if displayGlobalAlert isn't ready or globalStatusDiv is missing
             alert(`ERRO GRAVE AO CARREGAR INTERFACE:\n${error.message}\n\nA aplicação pode não funcionar corretamente.\nVerifique o console do navegador (F12).`);
        }
        return; // Stop further execution within the DOMContentLoaded listener
    } // --- FIM DO CATCH BLOCK CORRIGIDO ---


    // --- Initialize Garage ---
    try {
        // Ensure Garagem class is defined
        if (typeof Garagem === 'undefined') {
            // If Garagem class is in a separate file and wasn't loaded
            console.error("Erro Fatal: Classe Garagem não está definida. Verifique se garagem.js está carregado antes de script.js.");
            throw new Error("Classe Garagem não definida.");
        }
        minhaGaragem = new Garagem(); // Initialize the garage instance
        minhaGaragem.carregar();     // Load data from storage
    } catch (e) {
         console.error("Erro Fatal durante inicialização ou carregamento da Garagem:", e);
         displayGlobalAlert("ERRO GRAVE AO CARREGAR DADOS DA GARAGEM. Verifique console.", "error", 0);
         // Attempt to create an empty garage if loading failed catastrophically
         if (!(minhaGaragem instanceof Garagem)) {
             try {
                  if (typeof Garagem !== 'undefined') { // Check again before creating
                     minhaGaragem = new Garagem();
                  } else {
                      throw new Error("Classe Garagem ainda não definida para fallback.");
                  }
             } catch (initError) {
                  console.error("Falha ao criar instância de Garagem vazia:", initError);
                  // At this point, the app is likely unusable.
                  displayGlobalAlert("Falha crítica na inicialização. Aplicação pode não funcionar.", "error", 0);
                  return; // Stop if even creating empty garage fails
             }
         }
    }

    // --- Initial Render ---
    // --- TRY/CATCH BLOCK ATUALIZADO ---
    try {
        // Ensure renderizarGaragem function exists before calling
        if (typeof renderizarGaragem === 'function') {
             renderizarGaragem();
        } else {
             throw new Error("Função renderizarGaragem não está definida.");
        }
    } catch (renderError) {
         console.error("Erro Fatal na renderização inicial da garagem:", renderError);
         displayGlobalAlert("ERRO GRAVE AO EXIBIR GARAGEM INICIALMENTE.", "error", 0);
         // Attempt to display error messages in the containers
         if(containerCarro) containerCarro.innerHTML = '<h3>Carros Esportivos</h3><p class="empty-list-placeholder error-message">Erro ao renderizar lista.</p>';
         if(containerCaminhao) containerCaminhao.innerHTML = '<h3>Caminhões</h3><p class="empty-list-placeholder error-message">Erro ao renderizar lista.</p>';
    }
    // --- FIM DO TRY/CATCH BLOCK ATUALIZADO ---


    // --- Setup Event Listeners ---
    try {
        // Add Vehicle Buttons
        document.getElementById('criarCarroEsportivoBtn')?.addEventListener('click', () => criarNovoVeiculo('CarroEsportivo'));
        document.getElementById('criarCaminhaoBtn')?.addEventListener('click', () => criarNovoVeiculo('Caminhao'));

        // Maintenance Modal Form
        if (formAgendamento) {
            formAgendamento.addEventListener('submit', salvarAgendamento);
            // Find cancel button within the form
            formAgendamento.querySelector('button[type="button"].btn-secondary')?.addEventListener('click', fecharFormAgendamento);
        } else { console.warn("Formulário de agendamento não encontrado para adicionar listeners."); }

        // Maintenance Modal Interaction (Close)
        if (agendamentoModal) {
             agendamentoModal.querySelector('.close-button')?.addEventListener('click', fecharFormAgendamento);
             // Close modal if clicking outside the content area
             agendamentoModal.addEventListener('click', (event) => {
                 if (event.target === agendamentoModal) {
                      fecharFormAgendamento();
                 }
             });
        } else { console.warn("Modal de agendamento não encontrado para adicionar listeners."); }

         // Global Escape key listener for modal
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape' && agendamentoModal?.style.display === 'block') {
                  fecharFormAgendamento();
             }
         });

        // Clear Storage Button
        const limparBtn = document.getElementById('limparStorageBtn');
        if (limparBtn) {
            limparBtn.addEventListener('click', () => {
                // Use concise confirmations
                if (confirm("ATENÇÃO!\nLimpar TODOS os dados da garagem salvos no navegador?\n\nEsta ação é IRREVERSÍVEL!")) {
                     if (confirm("CONFIRMAÇÃO FINAL:\nApagar TUDO permanentemente?")) {
                         try {
                             // Ensure Garagem instance is valid before accessing storageKey
                             if (!(minhaGaragem instanceof Garagem)) throw new Error("Instância da Garagem inválida ao limpar.");

                             localStorage.removeItem(minhaGaragem.storageKey);
                             // Re-initialize garage to an empty state
                             minhaGaragem = new Garagem();
                             // Clear related state variables
                             alertadosHoje.clear();
                             vehicleStatusTimeouts = {}; // Clear any pending timeouts
                             // Re-render the empty state
                             renderizarGaragem();
                             // Clear planner UI as well
                             if(destinoInput) destinoInput.value = '';
                             if(previsaoResultadoDiv) {
                                 previsaoResultadoDiv.innerHTML = '<p>Digite uma cidade e clique em "Verificar Clima".</p>';
                                 previsaoResultadoDiv.className = 'weather-results'; // Reset class
                             }

                             displayGlobalAlert("Todos os dados da garagem foram limpos.", "info");
                             console.log(`LocalStorage (Chave: ${minhaGaragem.storageKey}) limpo.`);
                         } catch(e) {
                              console.error("Erro ao limpar LocalStorage ou resetar Garagem:", e);
                              displayGlobalAlert("Erro ao tentar limpar os dados.", "error");
                         }
                     } else {
                          console.log("Limpeza cancelada (confirmação final).");
                          displayGlobalAlert("Limpeza cancelada.", "info", 3000);
                     }
                } else {
                     console.log("Limpeza cancelada.");
                     displayGlobalAlert("Limpeza cancelada.", "info", 3000);
                }
            });
        } else { console.warn("Botão 'limparStorageBtn' não encontrado."); }


        // Listener for Weather Button
        if (climaBtn) {
            climaBtn.addEventListener('click', verificarClimaHandler);
        } else { console.warn("Botão 'verificar-clima-btn' não encontrado."); }

        // Allow Enter key in city input to trigger weather search
        if (destinoInput) {
            destinoInput.addEventListener('keypress', (event) => {
                 if (event.key === 'Enter') {
                     event.preventDefault(); // Prevent default Enter behavior (like form submission)
                     verificarClimaHandler(); // Trigger the weather check
                 }
             });
        } else { console.warn("Input 'destino-viagem' não encontrado."); }

    } catch (listenerError) {
         console.error("Erro ao configurar event listeners:", listenerError);
         displayGlobalAlert("Erro ao configurar interações da página.", "error", 0);
    }


    // --- Periodic Check for Appointments ---
    const checkIntervalMinutes = 5;
    try {
        // Only start interval if function exists
        if (typeof verificarAgendamentosProximos === 'function') {
            setInterval(verificarAgendamentosProximos, checkIntervalMinutes * 60 * 1000);
            console.log(`Verificação periódica de agendamentos próximos ativa (intervalo: ${checkIntervalMinutes} min).`);
        } else {
             console.warn("Função verificarAgendamentosProximos não definida, verificação periódica desativada.");
        }
    } catch (intervalError) {
         console.error("Erro ao iniciar verificação periódica de agendamentos:", intervalError);
    }


    console.log("Inicialização da Garagem Inteligente v3.1 + APIs concluída.");
    // Check API key status *after* initialization
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === "COLOQUE_SUA_CHAVE_API_OPENWEATHERMAP_AQUI") {
        displayGlobalAlert("Garagem carregada. Funcionalidade de clima desativada (API Key não configurada).", "warning", 10000);
    } else {
         displayGlobalAlert("Garagem Inteligente pronta!", "success", 3000);
    }
});