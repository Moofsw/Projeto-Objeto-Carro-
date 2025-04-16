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
        this.storageKey = 'garagemInteligente_v3_1_refactored'; // Unique key for this version/structure
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
        // --- Input Validation ---
        // 1. Type Check: Ensure the object is an instance of Vehicle or its descendant.
        if (!(veiculo instanceof Vehicle)) {
            console.error("Tentativa de adicionar objeto inválido à garagem. Apenas instâncias de Veiculo (ou subclasses) são permitidas.", veiculo);
             if (typeof displayGlobalAlert === 'function') {
                 displayGlobalAlert("Erro interno: Tipo de objeto inválido para adicionar à garagem.", "error");
             }
            return false; // Indicate failure
        }
        // 2. Duplicate ID Check: Ensure uniqueness based on the vehicle's ID.
        if (this.veiculos.some(v => v.id === veiculo.id)) {
             console.warn(`Veículo com ID ${veiculo.id} (${veiculo.modelo}) já existe na garagem. Adição ignorada.`);
             if (typeof displayGlobalAlert === 'function') {
                 displayGlobalAlert(`Veículo ${veiculo.modelo} (ID: ${veiculo.id}) já existe na garagem!`, 'warning');
             }
             return false; // Indicate failure (duplicate)
        }

        // --- Action ---
        // Add the validated vehicle to the internal array.
        this.veiculos.push(veiculo);
        console.log(`Veículo adicionado à garagem: ${veiculo.modelo} (Tipo: ${veiculo._tipoVeiculo}, ID: ${veiculo.id}).`);

        // --- Persistence ---
        // Save the updated garage state to LocalStorage.
        this.salvar(); // Note: salvar() handles its own errors internally.
        return true; // Indicate success
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
        // Find the index of the vehicle with the matching ID.
        const index = this.veiculos.findIndex(v => v.id === idVeiculo);

        // If the vehicle is found (index is not -1)...
        if (index > -1) {
            // Remove the vehicle from the array using splice. `splice` returns an array containing the removed item(s).
            const removido = this.veiculos.splice(index, 1)[0]; // Get the actual removed vehicle object
            console.log(`Veículo removido da garagem: ${removido?.modelo} (ID: ${idVeiculo}).`);
            // Persist the change.
            this.salvar();
            return true; // Indicate success
        } else {
            // If the vehicle was not found.
            console.warn(`Tentativa de remover veículo com ID ${idVeiculo}, mas ele não foi encontrado na garagem.`);
            return false; // Indicate failure (not found)
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
            // Create an array of plain objects suitable for JSON serialization.
            const dataToSave = this.veiculos
                // Ensure each item is valid and has a toJSON method before calling it.
                .map(v => {
                    if (v && typeof v.toJSON === 'function') {
                        return v.toJSON();
                    } else {
                        // Log a warning if an invalid item is encountered during save.
                        console.warn("Item inválido encontrado na garagem durante a tentativa de salvar:", v);
                        return null; // Mark invalid items as null
                    }
                })
                // Remove any null entries that resulted from invalid items.
                .filter(item => item !== null);

            // Convert the array of plain objects to a JSON string.
            const jsonString = JSON.stringify(dataToSave);

            // Store the JSON string in LocalStorage.
            localStorage.setItem(this.storageKey, jsonString);
            // Reduce console noise during normal operation.
            // console.log(`${this.veiculos.length} veículos salvos no LocalStorage (Chave: ${this.storageKey}).`);

        } catch (error) {
            // --- Error Handling for Saving ---
            console.error("Erro CRÍTICO ao salvar dados da garagem no LocalStorage:", error);
            let message = "Erro Crítico: Não foi possível salvar os dados da garagem no seu navegador.";
            // Check for specific storage quota errors, which are common.
            if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                 message += " O armazenamento local (LocalStorage) está cheio. Remova alguns veículos ou limpe dados de outros sites que você não usa.";
                 console.error("LocalStorage Quota Exceeded! Não é possível salvar mais dados.");
            }
             message += " Verifique o console para mais detalhes técnicos.";
             // Display a persistent error message to the user if the UI function is available.
             if (typeof displayGlobalAlert === 'function') {
                 displayGlobalAlert(message, "error", 0); // duration 0 makes it persistent
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
        console.log(`Tentando carregar dados da garagem do LocalStorage (Chave: ${this.storageKey})...`);
        const dataString = localStorage.getItem(this.storageKey);

        // If no data is found in LocalStorage for the key, initialize with an empty array.
        if (!dataString) {
            this.veiculos = [];
            console.log(`Nenhuma garagem salva encontrada para a chave '${this.storageKey}'. Iniciando com garagem vazia.`);
            return; // Nothing more to do.
        }

        try {
            // --- Parsing and Validation ---
            const dataFromStorage = JSON.parse(dataString);

            // **Critical Validation:** Ensure the loaded data is an array.
            // This protects against corrupted data in LocalStorage.
            if (!Array.isArray(dataFromStorage)) {
                 console.error("Dado corrompido encontrado no LocalStorage! Esperava um array de veículos, mas o formato é inválido:", dataFromStorage);
                 this.veiculos = []; // Reset to a safe empty state.
                 // Attempt to remove the corrupted item to prevent repeated errors on next load.
                 try {
                     localStorage.removeItem(this.storageKey);
                      if (typeof displayGlobalAlert === 'function') {
                          displayGlobalAlert("Dados da garagem salvos estavam corrompidos e foram removidos. A garagem foi resetada.", "error", 10000);
                      }
                 } catch (removeError) {
                     console.error("Falha adicional ao tentar remover dados corrompidos do LocalStorage:", removeError);
                     if (typeof displayGlobalAlert === 'function') {
                         displayGlobalAlert("Dados da garagem salvos estão corrompidos. Falha ao limpar automaticamente. Considere limpar manualmente.", "error", 0); // Persistent
                     }
                 }
                 return; // Stop the loading process.
            }

            // --- Reconstruction ---
            // Map over the array of plain data objects. For each object, attempt to reconstruct
            // the corresponding Vehicle instance using the static factory method.
            const loadedVehicles = dataFromStorage
                .map(v_data => Vehicle.fromJSON(v_data)) // `fromJSON` handles type checking and reconstruction.
                .filter(v => v instanceof Vehicle);      // Filter out any `null` results (failed reconstructions).

            // --- Feedback on Discarded Items ---
            const discardedCount = dataFromStorage.length - loadedVehicles.length;
            if (discardedCount > 0) {
                 // Log a warning if some items couldn't be reconstructed.
                 console.warn(`${discardedCount} item(ns) inválido(s) ou não reconhecido(s) foram descartados durante o carregamento da garagem a partir do LocalStorage.`);
                 if (typeof displayGlobalAlert === 'function') {
                     displayGlobalAlert(`${discardedCount} registro(s) de veículo(s) salvo(s) estava(m) inválido(s) e foi(ram) ignorado(s) durante o carregamento. Verifique o console para detalhes.`, 'warning', 8000);
                 }
            }

            // --- Assign Loaded Data ---
            // Assign the array of successfully reconstructed vehicles to the garage instance.
            this.veiculos = loadedVehicles;
            console.log(`${this.veiculos.length} veículos carregados e validados com sucesso do LocalStorage.`);

        } catch (error) {
            // --- Error Handling for Loading/Parsing/Reconstruction ---
            // Catch errors from `JSON.parse` or potentially from within `Vehicle.fromJSON`.
            console.error("Erro CRÍTICO ao carregar, parsear ou reconstruir dados da garagem do LocalStorage:", error);
             if (typeof displayGlobalAlert === 'function') {
                 displayGlobalAlert("Erro grave ao carregar dados salvos da garagem. Resetando para um estado vazio. Verifique o console.", "error", 0); // Persistent
             }
            this.veiculos = []; // Reset to a safe empty state on critical failure.
            // Consider advising the user to clear storage or reporting the error.
            // localStorage.removeItem(this.storageKey); // Use with caution - might erase data the user could potentially recover.
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
        // Use the spread syntax to create a new array containing the same vehicle references.
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
        const agora = new Date(); // Get the current date and time for comparison.
        const futuros = []; // Initialize an empty array to store future appointments.

        this.veiculos.forEach(v => {
            // Check if the vehicle object and its history array are valid.
            if (v instanceof Vehicle && Array.isArray(v.historicoManutencao)) {
                // Iterate through each maintenance record for the current vehicle.
                v.historicoManutencao.forEach(m => {
                    // Check if the record is a valid Manutencao instance and has a date property.
                    if (m instanceof Manutencao && m.data) {
                         try {
                            // Parse the maintenance date string into a Date object.
                            const dataManutencao = new Date(m.data);
                            // Check if the date is valid (not NaN) and is in the future (or now).
                            if (!isNaN(dataManutencao.getTime()) && dataManutencao >= agora) {
                                // If it's a future appointment, add an object containing both the vehicle and the maintenance record to the results array.
                                futuros.push({ veiculo: v, manutencao: m });
                            }
                         } catch (dateError){
                             // Silently ignore errors during date parsing for this specific check,
                             // as an invalid date won't be considered "future".
                             // Optionally log a warning: console.warn(`Erro ao processar data ${m.data} para ${m.id}`);
                         }
                    }
                });
            }
        });

        // Sort the array of future appointments by date in ascending order (soonest first).
        // Includes robust handling for potentially invalid dates during the sort comparison.
        futuros.sort((a, b) => {
            const dateA = new Date(a.manutencao.data);
            const dateB = new Date(b.manutencao.data);
            // Treat invalid dates by pushing them to the end.
             if (isNaN(dateA.getTime())) return 1;
             if (isNaN(dateB.getTime())) return -1;
            // Sort valid dates chronologically.
             return dateA - dateB;
        });

        return futuros; // Return the sorted array of future appointments.
    }
}
