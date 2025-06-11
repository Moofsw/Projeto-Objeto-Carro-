class Garagem {
    constructor() {
        this.veiculos = [];
        this.storageKey = 'garagemInteligente_v3_1_refactored_api';
        console.log(`Garagem inicializada. Usando chave de armazenamento LocalStorage: ${this.storageKey}`);
    }

    adicionarVeiculo(veiculo) {
        if (!(veiculo instanceof Vehicle)) {
            console.error("Tentativa de adicionar objeto inválido.", veiculo);
            return false;
        }
        if (this.veiculos.some(v => v.id === veiculo.id)) {
             console.warn(`Veículo com ID ${veiculo.id} já existe.`);
             return false;
        }
        this.veiculos.push(veiculo);
        this.salvar();
        return true;
    }

    removerVeiculo(idVeiculo) {
        const index = this.veiculos.findIndex(v => v.id === idVeiculo);
        if (index > -1) {
            this.veiculos.splice(index, 1);
            this.salvar();
            return true;
        }
        return false;
    }

    encontrarVeiculoPorId(idVeiculo) {
        return this.veiculos.find(v => v.id === idVeiculo);
    }

    salvar() {
        try {
            const dataToSave = this.veiculos.map(v => v.toJSON());
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
        } catch (error) {
            console.error("Erro ao salvar garagem no LocalStorage:", error);
        }
    }

    carregar() {
        const dataString = localStorage.getItem(this.storageKey);
        if (!dataString) return;

        try {
            const dataFromStorage = JSON.parse(dataString);
            if (!Array.isArray(dataFromStorage)) return;
            
            this.veiculos = dataFromStorage
                .map(v_data => Vehicle.fromJSON(v_data)) 
                .filter(v => v instanceof Vehicle);      
        } catch (error) {
            console.error("Erro ao carregar garagem do LocalStorage:", error);
            this.veiculos = []; 
        }
    }

    listarTodosVeiculos() {
        return [...this.veiculos];
    }

    listarAgendamentosFuturos() {
        const agora = new Date();
        const futuros = [];
        this.veiculos.forEach(v => {
            if (Array.isArray(v.historicoManutencao)) {
                v.historicoManutencao.forEach(m => {
                    const dataManutencao = new Date(m.data);
                    if (dataManutencao >= agora) {
                        futuros.push({ veiculo: v, manutencao: m });
                    }
                });
            }
        });
        futuros.sort((a, b) => new Date(a.manutencao.data) - new Date(b.manutencao.data));
        return futuros;
    }
}