// manutencao.js

class Manutencao {
    /**
     * Creates an instance of Manutencao.
     * @param {string} data - Maintenance date/time string (ISO 8601 format YYYY-MM-DDTHH:mm preferred).
     * @param {string} tipo - Type of service performed. Cannot be empty.
     * @param {number} custo - Cost of maintenance. Must be a non-negative number.
     * @param {string} [descricao=''] - Optional description or notes.
     * @param {string} [veiculoId=''] - ID of the vehicle this maintenance belongs to.
     * @throws {Error} If data, tipo, or custo are invalid.
     */
    constructor(data, tipo, custo, descricao = '', veiculoId = '') {
        // Validate date format and parsability
        if (!this.validarData(data)) {
            throw new Error("Data inválida ou ausente. Use o formato YYYY-MM-DDTHH:mm.");
        }
        // Validate type is a non-empty string
        if (typeof tipo !== 'string' || tipo.trim() === '') {
            throw new Error("Tipo de serviço não pode ser vazio.");
        }
        // Validate cost is a non-negative number
        const numCusto = parseFloat(custo);
        if (isNaN(numCusto) || numCusto < 0) {
            throw new Error("Custo inválido. Deve ser um número não negativo (use 0 se não aplicável).");
        }

        // Assign validated and trimmed properties
        this.data = data; // Store the original valid string (datetime-local format)
        this.tipo = tipo.trim();
        this.custo = numCusto;
        this.descricao = descricao.trim();
        // Generate a more unique ID using random hex chars
        this.id = `man_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
        this.veiculoId = veiculoId; // Link maintenance to a specific vehicle
    }

    /**
     * Validates the date string format (YYYY-MM-DDTHH:mm) and parsability.
     * @param {string} dataStr - The date string from datetime-local input.
     * @returns {boolean} - True if valid, false otherwise.
     * @private
     */
    validarData(dataStr) {
        // Basic check for non-empty string
        if (!dataStr || typeof dataStr !== 'string') return false;
        // Check format roughly (YYYY-MM-DDTHH:MM)
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dataStr)) return false;
        // Check if it parses to a valid Date object
        return !isNaN(new Date(dataStr).getTime());
    }


    /**
     * Returns a formatted string representation of the maintenance for display.
     * @returns {string} - Formatted maintenance details.
     */
    formatar() {
        let dataFormatada = "Data inválida";
        try {
            const dataObj = new Date(this.data);
            // Check again in case invalid data was somehow stored or constructor validation missed something
            if (!isNaN(dataObj.getTime())) {
                 // Always include time since input is datetime-local
                const options = {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    // timeZone: 'UTC' // Optional: Specify timezone if needed, otherwise uses local
                };
                // Use pt-BR locale for formatting
                dataFormatada = dataObj.toLocaleString('pt-BR', options);
            } else {
                 console.warn(`Tentando formatar data inválida: ${this.data}`);
            }
        } catch (e) {
             console.error("Erro ao formatar data da manutenção:", e, this.data);
        }

        // Format currency using pt-BR locale
        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Build output string
        let output = `<strong>${this.tipo}</strong> em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            // Escape HTML in description for safety if needed, though usually not necessary for simple text
            output += ` <span style="font-style: italic;">(${this.descricao})</span>`;
        }
        return output;
    }

    /**
     * Returns a plain object representation suitable for JSON serialization.
     * Includes a class identifier for reconstruction.
     * @returns {object} - Plain data object.
     */
    toJSON() {
        return {
            // Ensure all properties intended for storage are included
            id: this.id,
            data: this.data,
            tipo: this.tipo,
            custo: this.custo,
            descricao: this.descricao,
            veiculoId: this.veiculoId,
            _class: 'Manutencao' // Identifier for reconstruction logic
        };
    }

     /**
     * Creates a Manutencao instance from a plain object (e.g., loaded from JSON).
     * Performs validation using the constructor.
     * @param {object} obj - Plain data object, expected to have properties matching the constructor.
     * @returns {Manutencao|null} - Instance of Manutencao or null if obj is invalid or reconstruction fails.
     */
     static fromJSON(obj) {
        // Validate the input object structure and identifier
        if (!obj || typeof obj !== 'object' || obj._class !== 'Manutencao') {
             console.warn("Objeto inválido ou sem identificador '_class' para Manutencao.fromJSON:", obj);
             return null;
        }
        try {
            // Use the constructor for validation and instantiation
            // Pass potentially missing properties as undefined, constructor handles defaults
            const manut = new Manutencao(
                obj.data,
                obj.tipo,
                obj.custo,
                obj.descricao, // Defaults to '' if undefined
                obj.veiculoId   // Defaults to '' if undefined
            );
            // Restore the original ID if it was present in the JSON data
            if (obj.id) {
                 manut.id = obj.id;
            }
             return manut;
        } catch (error) {
            // Catch errors from the constructor (e.g., invalid data/type/cost)
            console.error("Erro ao recriar Manutencao a partir de JSON:", error.message, "| Objeto:", obj);
            return null; // Return null if reconstruction fails validation
        }
    }
}