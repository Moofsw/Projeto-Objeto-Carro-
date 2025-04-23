// manutencao.js

class Manutencao {
    /**
     * Creates an instance of Manutencao.
     * @param {string} data - Maintenance date/time string (e.g., "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"). ISO 8601 format preferred.
     * @param {string} tipo - Type of service performed. Cannot be empty.
     * @param {number} custo - Cost of maintenance. Must be a non-negative number.
     * @param {string} [descricao=''] - Optional description or notes.
     * @param {string} [veiculoId=''] - ID of the vehicle this maintenance belongs to.
     * @throws {Error} If data, tipo, or custo are invalid.
     */
    constructor(data, tipo, custo, descricao = '', veiculoId = '') {
        if (!this.validarData(data)) {
            throw new Error("Data inválida ou ausente. Use o formato YYYY-MM-DD ou YYYY-MM-DDTHH:mm.");
        }
        if (typeof tipo !== 'string' || tipo.trim() === '') {
            throw new Error("Tipo de serviço não pode ser vazio.");
        }
        const numCusto = parseFloat(custo); // Validate before assigning
        if (isNaN(numCusto) || numCusto < 0) {
            throw new Error("Custo inválido. Deve ser um número não negativo.");
        }

        this.data = data; // Store the original valid string
        this.tipo = tipo.trim();
        this.custo = numCusto;
        this.descricao = descricao.trim();
        this.id = `man_${Date.now()}_${Math.random().toString(16).slice(2)}`; // Unique ID
        this.veiculoId = veiculoId; // Link maintenance to a specific vehicle
    }

    /**
     * Validates the date string can be parsed into a valid Date object.
     * @param {string} dataStr - The date string.
     * @returns {boolean} - True if valid, false otherwise.
     * @private
     */
    validarData(dataStr) {
        // Check if the string is non-empty and can be parsed into a valid date
        return dataStr && !isNaN(new Date(dataStr).getTime());
    }


    /**
     * Returns a formatted string representation of the maintenance for display.
     * @returns {string} - Formatted maintenance details.
     */
    formatar() {
        let dataFormatada = "Data inválida";
        try {
            const dataObj = new Date(this.data);
             // Check again in case invalid data was somehow stored
            if (!isNaN(dataObj.getTime())) {
                 // Heuristic: check if the original string contains 'T' or ':' indicating time part
                 const hasTimePart = this.data.includes('T') || this.data.includes(':');

                const options = {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: hasTimePart ? '2-digit' : undefined,
                    minute: hasTimePart ? '2-digit' : undefined,
                };
                dataFormatada = dataObj.toLocaleString('pt-BR', options);
            }
        } catch (e) {
             console.warn("Erro ao formatar data da manutenção:", e, this.data);
        }


        const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        let output = `${this.tipo} em ${dataFormatada} - ${custoFormatado}`;
        if (this.descricao) {
            output += ` (${this.descricao})`;
        }
        return output;
    }

    /**
     * Returns a plain object representation suitable for JSON serialization.
     * @returns {object} - Plain data object.
     */
    toJSON() {
        return {
            id: this.id,
            data: this.data,
            tipo: this.tipo,
            custo: this.custo,
            descricao: this.descricao,
            veiculoId: this.veiculoId,
            _class: 'Manutencao' // Add identifier for reconstruction
        };
    }

     /**
     * Creates a Manutencao instance from a plain object (e.g., loaded from JSON).
     * Performs validation using the constructor.
     * @param {object} obj - Plain data object, expected to have properties matching the constructor.
     * @returns {Manutencao|null} - Instance of Manutencao or null if obj is invalid or reconstruction fails.
     */
     static fromJSON(obj) {
        if (!obj || typeof obj !== 'object' || obj._class !== 'Manutencao') {
             return null;
        }
        try {
            const manut = new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao, obj.veiculoId);
            if (obj.id) { // Restore original ID if present
                 manut.id = obj.id;
            }
             return manut;
        } catch (error) {
            console.error("Erro ao recriar Manutencao a partir de JSON:", error.message, obj);
            return null;
        }
    }
}