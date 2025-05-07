class Garagem {
    /**
     * Initializes a new, empty Garagem instance.
     * Sets up the internal array to hold `Vehicle` objects and defines the key
     * used for storing data in LocalStorage. Logs the storage key being used.
     *
     * @constructor
     */
    constructor() {
        /**
         * The core data structure: an array holding all vehicle instances
         * currently managed by the garage. Should only contain objects that are
         * instances of `Vehicle` or its subclasses (`CarroEsportivo`, `Caminhao`).
         * @type {Array<Vehicle|CarroEsportivo|Caminhao>}
         */
        this.veiculos = [];

        /**
         * The unique key used to store and retrieve the garage's data in the browser's
         * LocalStorage. Using a versioned or descriptive key helps avoid conflicts
         * with other data or previous versions of the application.
         * @type {string}
         */
        this.storageKey = 'garagemInteligente_v3_1_refactored_api'; // Updated for API integration
        console.log(`Garagem inicializada. Usando chave de armazenamento LocalStorage: ${this.storageKey}`);
    }

    /**
     * Adds a validated vehicle instance to the garage's collection.
     * It performs checks to ensure the added object is a valid `Vehicle` instance
     * and that no other vehicle with the same ID already exists in the collection.
     * After successfully adding the vehicle, it triggers `salvar()` to persist the updated state.
     * Provides user feedback via `displayGlobalAlert` (if available).
     *
     * @param {Vehicle|CarroEsportivo|Caminhao} veiculo - An instance of `Vehicle` or one of its subclasses (`CarroEsportivo`, `Caminhao`) to be added.
     * @returns {boolean} `true` if the vehicle was successfully added and saved, `false` otherwise (e.g., if the input was invalid, a duplicate ID was found, or saving failed implicitly).
     */
    adicionarVeiculo(veiculo) {
        if (!(veiculo instanceof Vehicle)) {
            console.error("Tentativa de adicionar objeto inválido à garagem.", veiculo);
             if (typeof displayGlobalAlert === 'function') {
                 displayGlobalAlert("Erro interno: Tipo de veículo inválido.", "error");
             }
            return false;
        }
        if (this.veiculos.some(v => v.id === veiculo.id)) {
             console.warn(`Veículo com ID ${veiculo.id} (${veiculo.modelo}) já existe. Adição ignorada.`);
             if (typeof displayGlobalAlert === 'function') {
                 displayGlobalAlert(`Veículo ${veiculo.modelo} (ID: ${veiculo.id}) já existe!`, 'warning');
             }
             return false;
        }

        this.veiculos.push(veiculo);
        console.log(`Veículo ${veiculo.modelo} (ID: ${veiculo.id}, Tipo: ${veiculo._tipoVeiculo}) adicionado.`);
        this.salvar();
        return true;
    }

    /**
     * Removes a vehicle from the garage collection based on its unique ID.
     * Locates the vehicle using `findIndex` and removes it using `splice`.
     * After successful removal, it triggers `salvar()` to persist the change.
     * Logs the removal action. User feedback is typically handled by the caller.
     *
     * @param {string} idVeiculo - The unique ID of the vehicle to remove.
     * @returns {boolean} `true` if a vehicle with the specified ID was found and removed, `false` if no vehicle with that ID was found.
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
            // Feedback usually handled by caller or renderizarGaragem implicitly updating UI
             if (typeof displayGlobalAlert === 'function') {
                displayGlobalAlert(`Erro: Veículo com ID ${idVeiculo} não encontrado para remoção.`, 'error');
            }
            return false;
        }
    }

    /**
     * Finds and returns a specific vehicle instance from the garage by its unique ID.
     * Uses the `find` array method for efficient lookup.
     *
     * @param {string} idVeiculo - The unique ID of the vehicle to search for.
     * @returns {Vehicle|CarroEsportivo|Caminhao|undefined} The found vehicle instance if a match exists, otherwise `undefined`.
     */
    encontrarVeiculoPorId(idVeiculo) {
        return this.veiculos.find(v => v.id === idVeiculo);
    }

    /**
     * Saves the current state of the entire garage (all vehicles and their associated data)
     * to the browser's LocalStorage under the key defined in `this.storageKey`.
     * It achieves this by:
     * 1. Mapping over the `this.veiculos` array.
     * 2. Calling the `toJSON()` method on each valid `Vehicle` instance to get its serializable representation.
     * 3. Filtering out any potentially invalid items that couldn't be serialized.
     * 4. Using `JSON.stringify()` to convert the resulting array of plain objects into a JSON string.
     * 5. Storing the JSON string in LocalStorage.
     * Includes error handling for potential storage issues (like quota exceeded errors).
     *
     * @returns {void}
     */
    salvar() {
        try {
            const dataToSave = this.veiculos
                .filter(v => v instanceof Vehicle && typeof v.toJSON === 'function') // Ensure valid before calling toJSON
                .map(v => v.toJSON());
            
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            // console.log(`${this.veiculos.length} veículos salvos.`); // Reduce console noise for frequent saves
        } catch (error) {
            console.error("Erro CRÍTICO ao salvar garagem no LocalStorage:", error);
            let message = "Erro Crítico: Não foi possível salvar os dados da garagem.";
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                 message += " O armazenamento local está cheio.";
                 console.error("LocalStorage Quota Exceeded!");
            }
             message += " Verifique o console.";
             if (typeof displayGlobalAlert === 'function') {
                 displayGlobalAlert(message, "error", 0); // 0 for persistent
             }
        }
    }

    /**
     * Loads the garage state from LocalStorage using the key defined in `this.storageKey`.
     * It performs the following steps:
     * 1. Retrieves the JSON string from LocalStorage.
     * 2. Parses the JSON string into an array of plain data objects.
     * 3. **Crucially**, validates that the parsed data is indeed an array.
     * 4. Iterates over the array of data objects.
     * 5. For each object, calls the static factory method `Vehicle.fromJSON()` to reconstruct
     *    the appropriate `Vehicle` subclass instance (including its `Manutencao` history).
     * 6. Filters out any `null` results from `fromJSON` (indicating failed reconstructions).
     * 7. Assigns the resulting array of valid, reconstructed `Vehicle` instances to `this.veiculos`.
     * Includes robust error handling for JSON parsing errors, corrupted data structures,
     * and failures during object reconstruction. Resets to an empty state on critical errors.
     *
     * @returns {void}
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

            if (!Array.isArray(dataFromStorage)) {
                 console.error("Dado corrompido no LocalStorage! Esperado um array.", dataFromStorage);
                 this.veiculos = []; 
                 try {
                     localStorage.removeItem(this.storageKey);
                      if (typeof displayGlobalAlert === 'function') {
                          displayGlobalAlert("Dados da garagem corrompidos foram removidos. Começando do zero.", "error", 10000);
                      }
                 } catch (removeError) {
                     console.error("Falha ao remover dados corrompidos:", removeError);
                     if (typeof displayGlobalAlert === 'function') {
                        displayGlobalAlert("Dados da garagem corrompidos. Falha ao limpar automaticamente.", "error", 0);
                     }
                 }
                 return;
            }
            
            const loadedVehicles = dataFromStorage
                .map(v_data => Vehicle.fromJSON(v_data)) 
                .filter(v => v instanceof Vehicle);      

            const discardedCount = dataFromStorage.length - loadedVehicles.length;
            if (discardedCount > 0) {
                 console.warn(`${discardedCount} itens inválidos foram descartados durante o carregamento.`);
                 if (typeof displayGlobalAlert === 'function') {
                    displayGlobalAlert(`${discardedCount} registro(s) de veículo(s) inválido(s) foram ignorados.`, 'warning', 8000);
                 }
            }

            this.veiculos = loadedVehicles;
            console.log(`${this.veiculos.length} veículos carregados e validados.`);

        } catch (error) {
            console.error("Erro CRÍTICO ao carregar/parsear garagem do LocalStorage:", error);
            if (typeof displayGlobalAlert === 'function') {
                displayGlobalAlert("Erro grave ao carregar dados salvos. Resetando para vazio. Verifique o console.", "error", 0);
            }
            this.veiculos = []; 
        }
    }

    /**
     * Returns a shallow copy of the list of all vehicles currently managed by the garage.
     * Providing a copy prevents external code from accidentally modifying the internal
     * `veiculos` array directly, promoting better encapsulation.
     *
     * @returns {Array<Vehicle|CarroEsportivo|Caminhao>} An array containing all vehicle instances currently in the garage.
     */
    listarTodosVeiculos() {
        return [...this.veiculos];
    }

    /**
     * Finds and returns all future maintenance appointments scheduled across all vehicles
     * currently in the garage.
     * It iterates through each vehicle's maintenance history (`historicoManutencao`),
     * parses the maintenance date, and includes it in the result if the date is
     * equal to or later than the current date and time.
     * The results are sorted chronologically by maintenance date (soonest first).
     *
     * @returns {Array<{veiculo: Vehicle|CarroEsportivo|Caminhao, manutencao: Manutencao}>}
     *          An array of objects. Each object contains a reference to the `veiculo` instance
     *          and the corresponding future `Manutencao` record. Returns an empty array if no
     *          future appointments are found.
     */
    listarAgendamentosFuturos() {
        const agora = new Date();
        const futuros = [];
        const ManutencaoAvailable = typeof Manutencao !== 'undefined'; // Check if Manutencao class is available

        this.veiculos.forEach(v => {
            if (v instanceof Vehicle && Array.isArray(v.historicoManutencao)) {
                v.historicoManutencao.forEach(m => {
                    // Ensure record is a Manutencao instance (if class exists) and has a date
                    if (ManutencaoAvailable && m instanceof Manutencao && m.data) {
                         try {
                            const dataManutencao = new Date(m.data);
                            if (!isNaN(dataManutencao.getTime()) && dataManutencao >= agora) {
                                futuros.push({ veiculo: v, manutencao: m });
                            }
                         } catch (dateError){ console.warn(`Erro ao processar data de manutenção ${m.data}: ${dateError.message}`); }
                    } else if (!ManutencaoAvailable && m && m.data) { // Basic check if Manutencao class is missing
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

        futuros.sort((a, b) => {
            try {
                const dateA = new Date(a.manutencao.data);
                const dateB = new Date(b.manutencao.data);
                 if (isNaN(dateA.getTime())) return 1; 
                 if (isNaN(dateB.getTime())) return -1;
                 return dateA - dateB;
            } catch (sortError) {
                 console.error("Erro durante a ordenação de agendamentos:", sortError);
                 return 0; 
            }
        });
        return futuros;
    }
}