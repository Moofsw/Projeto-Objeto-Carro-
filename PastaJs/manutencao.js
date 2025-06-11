// manutencao.js
class Manutencao {
    constructor(data, tipo, custo, descricao = '', veiculoId = '') {
        if (!this.validarData(data)) {
            throw new Error("Data inválida. Use o formato YYYY-MM-DDTHH:mm.");
        }
        if (typeof tipo !== 'string' || tipo.trim() === '') {
            throw new Error("Tipo de serviço não pode ser vazio.");
        }
        const numCusto = parseFloat(custo);
        if (isNaN(numCusto) || numCusto < 0) {
            throw new Error("Custo inválido.");
        }

        this.data = data;
        this.tipo = tipo.trim();
        this.custo = numCusto;
        this.descricao = descricao.trim();
        this.id = `man_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
        this.veiculoId = veiculoId;
    }

    validarData(dataStr) {
        if (!dataStr || typeof dataStr !== 'string') return false;
        if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dataStr)) return false;
        return !isNaN(new Date(dataStr).getTime());
    }

    formatar() {
        try {
            const dataObj = new Date(this.data);
            const dataFormatada = dataObj.toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
            const custoFormatado = this.custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            let output = `<strong>${this.tipo}</strong> em ${dataFormatada} - ${custoFormatado}`;
            if (this.descricao) output += ` <span>(${this.descricao})</span>`;
            return output;
        } catch (e) {
            return "Erro ao formatar registro."
        }
    }

    toJSON() {
        return {
            id: this.id, data: this.data, tipo: this.tipo, custo: this.custo,
            descricao: this.descricao, veiculoId: this.veiculoId, _class: 'Manutencao'
        };
    }

     static fromJSON(obj) {
        if (!obj || obj._class !== 'Manutencao') return null;
        try {
            const manut = new Manutencao(obj.data, obj.tipo, obj.custo, obj.descricao, obj.veiculoId);
            if (obj.id) manut.id = obj.id;
            return manut;
        } catch (error) {
            console.error("Erro ao recriar Manutencao a partir de JSON:", error.message, "| Objeto:", obj);
            return null;
        }
    }
}