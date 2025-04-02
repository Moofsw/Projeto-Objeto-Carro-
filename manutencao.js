// manutencao.js

class Manutencao {
    /**
     * Creates an instance of Manutencao.
     * @param {string} data - Maintenance date (e.g., "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm").
     * @param {string} tipo - Type of service.
     * @param {number} custo - Cost of maintenance.
     * @param {string} [descricao=''] - Optional description.
     * @param {string} [veiculoId=''] - ID or identifier of the vehicle this maintenance belongs to.
     */
    constructor(data, tipo, custo, descricao = '', veiculoId = '') {
        if (!this.validarData(data)) {
            throw new Error("Data inválida. Use o formato YYYY-MM-DD ou YYYY-MM-DDTHH:mm.");
        }
        if (typeof tipo !== 'string' || tipo.trim() === '') {
            throw new Error("Tipo de serviço não pode ser vazio.");
        }
        if (!this.validarCusto(custo)) {
            throw new Error("Custo inválido. Deve ser um número positivo.");
        }

        this.data = data; // Store as string, can parse when needed
        this.tipo = tipo.trim();
        this.custo = parseFloat(custo);
        this.descricao = descricao.trim();
        this.id = `man_${Date.now()}_${Math.random().toString(16).slice(2)}`; // Unique ID
        this.veiculoId = veiculoId; // Link maintenance to a specific vehicle
    }

    /**
     * Validates the date format (accepts YYYY-MM-DD or YYYY-MM-DDTHH:mm).
     * @param {string} dataStr - The date string.
     * @returns {boolean} - True if valid, false otherwise.
     */
    validarData(dataStr) {
        if (!dataStr) return false;
        const date = new Date(dataStr);
        return !isNaN(date.getTime());
    }

    /**
     * Validates the cost.
     * @param {*} custo - The cost value.
     * @returns {boolean} - True if valid (positive number), false otherwise.
     */
    validarCusto(custo) {
        const numCusto = parseFloat(custo);
        return !isNaN(numCusto) && numCusto >= 0;
    }

    /**
     * Returns a formatted string representation of the maintenance.
     * @returns {string} - Formatted maintenance details.
     */
    formatar() {
        const dataObj = new Date(this.data);
        const dataFormatada = isNaN(dataObj.getTime())
            ? this.data // Show original string if parsing failed
            : dataObj.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  // Include time only if it's not midnight UTC (common default for date-only input)
                  hour: (dataObj.getUTCHours() !== 0 || dataObj.getUTCMinutes() !== 0 || dataObj.getUTCSeconds() !== 0) ? '2-digit' : undefined,
                  minute: (dataObj.getUTCHours() !== 0 || dataObj.getUTCMinutes() !== 0 || dataObj.getUTCSeconds() !== 0) ? '2-digit' : undefined,
                  timeZone: 'UTC' // Interpret the string as UTC to avoid local time shifts for display unless time was explicit
              });

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
            veiculoId: this.veiculoId
        };
    }

     /**
     * Creates a Manutencao instance from a plain object (e.g., loaded from JSON).
     * @param {object} obj - Plain data object.
     * @returns {Manutencao|null} - Instance of Manutencao or null if obj is invalid.
     */
     static fromJSON(obj) {
        if (!obj || typeof obj !== 'object') return null;
        try {
            // Pass properties explicitly to constructor for validation
            const manut = new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao, obj.veiculoId);
            // Restore the original ID if it exists (constructor creates a new one)
            if (obj.id) {
                 manut.id = obj.id;
            }
             return manut;
        } catch (error) {
            console.error("Erro ao recriar Manutencao a partir de JSON:", error, obj);
            return null; // Return null if reconstruction fails
        }
    }
}