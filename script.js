// script.js

// --- CLASSES ---

// Assume que Manutencao.js e Garagem.js são carregados antes deste script.
// Suas classes (Manutencao, Vehicle, CarroEsportivo, Caminhao, Garagem)
// permanecem as mesmas das versões anteriores. Aqui focaremos nas novas
// funcionalidades de integração com o backend.

// (Cole aqui as definições das classes Vehicle, CarroEsportivo, Caminhao se não estiverem em arquivos separados)
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
        if (this.velocidade > 0) {
            return `${this.modelo} precisa parar completamente (velocidade 0) antes de desligar.`;
        }
        this.ligado = false;
        this.velocidade = 0;
        return `${this.modelo} desligado.`;
    }

    acelerar(incremento) {
        const incValue = parseFloat(incremento);
        if (isNaN(incValue) || incValue <= 0) {
             return `${this.modelo} - Valor de aceleração inválido.`;
        }
        if (!this.ligado) {
            return `${this.modelo} precisa estar ligado para acelerar.`;
        }
        this.velocidade += incValue;
        return `${this.modelo} acelerou para ${this.velocidade.toFixed(1)} km/h.`;
    }

    frear(decremento) {
        const decValue = parseFloat(decremento);
        if (isNaN(decValue) || decValue <= 0) {
            return `${this.modelo} - Valor de frenagem inválido.`;
        }
        this.velocidade = Math.max(0, this.velocidade - decValue);
        return `${this.modelo} freou para ${this.velocidade.toFixed(1)} km/h.`;
    }

    adicionarManutencao(manutencaoObj) {
         if (typeof Manutencao === 'undefined' || !(manutencaoObj instanceof Manutencao)) {
            console.error("Objeto de manutenção inválido.", manutencaoObj);
            return false;
        }
        this.historicoManutencao.push(manutencaoObj);
        this.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data));
        return true;
    }

    getHistoricoFormatado() {
        if (!this.historicoManutencao || this.historicoManutencao.length === 0) {
            return "<li class='empty-history'>Nenhum registro de manutenção.</li>";
        }
        return this.historicoManutencao
                 .map(m => `<li>${m.formatar()}</li>`).join('');
    }

    exibirInformacoesBase() {
         return `Tipo: ${this._tipoVeiculo}, ID: ${this.id}, Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade.toFixed(1)} km/h`;
    }

    exibirInformacoes() {
        return this.exibirInformacoesBase();
    }

    interagir() {
        return `Interagindo com ${this._tipoVeiculo.toLowerCase()}: ${this.modelo}.`;
    }

    toJSON() {
        return {
            id: this.id,
            modelo: this.modelo,
            cor: this.cor,
            ligado: this.ligado,
            velocidade: this.velocidade,
            historicoManutencao: (this.historicoManutencao || []).map(m => m.toJSON()),
            _tipoVeiculo: this._tipoVeiculo
        };
    }

     static fromJSON(data) {
        if (!data || !data._tipoVeiculo || !data.id) return null;
        let vehicle = null;
        try {
            switch (data._tipoVeiculo) {
                case 'CarroEsportivo':
                    vehicle = new CarroEsportivo(data.modelo, data.cor, data.id);
                    if (typeof data.turboAtivado === 'boolean') vehicle.turboAtivado = data.turboAtivado;
                    break;
                case 'Caminhao':
                    const capacidade = data.capacidadeCarga ?? 0;
                    vehicle = new Caminhao(data.modelo, data.cor, capacidade, data.id);
                     if (typeof data.cargaAtual === 'number') vehicle.cargaAtual = data.cargaAtual;
                    break;
                default:
                    vehicle = new Vehicle(data.modelo, data.cor, data.id);
                    break;
            }
            vehicle.ligado = data.ligado ?? false;
            vehicle.velocidade = data.velocidade ?? 0;
            if (Array.isArray(data.historicoManutencao) && typeof Manutencao?.fromJSON === 'function') {
                vehicle.historicoManutencao = data.historicoManutencao
                    .map(m_data => Manutencao.fromJSON(m_data))
                    .filter(m => m instanceof Manutencao);
            }
            return vehicle;
        } catch (error) {
             console.error(`Erro ao reconstruir veículo ID ${data.id}:`, error);
             return null;
        }
    }
}

class CarroEsportivo extends Vehicle {
    constructor(modelo, cor, id = null) {
        super(modelo, cor, id);
        this.turboAtivado = false;
        this._tipoVeiculo = "CarroEsportivo";
    }
    ativarTurbo() {
        if (!this.ligado) return `${this.modelo} precisa estar ligado.`;
        if (this.turboAtivado) return `${this.modelo} turbo já ativado.`;
        this.turboAtivado = true; return `${this.modelo}: Turbo ativado!`;
    }
    desativarTurbo() {
        if (!this.turboAtivado) return `${this.modelo} turbo já desativado.`;
        this.turboAtivado = false; return `${this.modelo}: Turbo desativado.`;
    }
    desligar() {
        if (this.velocidade > 0) return super.desligar();
        const msg = super.desligar();
        this.turboAtivado = false;
        return msg + " Turbo também foi desativado.";
    }
    exibirInformacoes() {
        return `${super.exibirInformacoesBase()}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`;
    }
    interagir() {
        return `Acelerando o ${this.modelo} ${this.cor}${this.turboAtivado ? ' com turbo!' : ''}. Vruum!`;
    }
    toJSON() {
        const data = super.toJSON();
        data.turboAtivado = this.turboAtivado;
        return data;
    }
}

class Caminhao extends Vehicle {
    constructor(modelo, cor, capacidadeCarga, id = null) {
        super(modelo, cor, id);
        this.capacidadeCarga = parseFloat(capacidadeCarga) || 0;
        this.cargaAtual = 0;
        this._tipoVeiculo = "Caminhao";
    }
    carregar(quantidade) {
        const quant = parseFloat(quantidade);
        if(isNaN(quant) || quant <= 0) return "Quantidade inválida.";
        if (this.cargaAtual + quant > this.capacidadeCarga) {
            return `Capacidade máxima excedida. Carga: ${this.cargaAtual} kg.`;
        }
        this.cargaAtual += quant;
        return `${this.modelo} carregado. Carga: ${this.cargaAtual} kg.`;
    }
    descarregar(quantidade) {
        const quant = parseFloat(quantidade);
        if(isNaN(quant) || quant <= 0) return "Quantidade inválida.";
        this.cargaAtual = Math.max(0, this.cargaAtual - quant);
        return `${this.modelo} descarregado. Carga: ${this.cargaAtual} kg.`;
    }
    exibirInformacoes() {
        return `${super.exibirInformacoesBase()}, Carga: ${this.cargaAtual}/${this.capacidadeCarga} kg`;
    }
    interagir() {
        return `Transportando ${this.cargaAtual} kg com o caminhão ${this.modelo}.`;
    }
    toJSON() {
        const data = super.toJSON();
        data.capacidadeCarga = this.capacidadeCarga;
        data.cargaAtual = this.cargaAtual;
        return data;
    }
}


// --- VARIÁVEIS GLOBAIS E ESTADO DA UI ---

// CORRIGIDO
const backendUrl = 'https://projeto-objeto-carro.onrender.com'; // <-- USE A URL CORRETA DO SEU BACKEND NO RENDER
let minhaGaragem;
let globalStatusTimeout = null;
let vehicleStatusTimeouts = {};
let alertadosHoje = new Set();
let globalStatusDiv, containerCarro, containerCaminhao, agendamentosListContainer,
    agendamentoModal, formAgendamento, agendamentoTituloVeiculo,
    agendamentoVeiculoIdInput, agendamentoDataInput, agendamentoTipoInput,
    agendamentoCustoInput, agendamentoDescricaoInput,
    // Elementos para previsão detalhada
    previsaoDetalhadaResultadoDiv, detailedDayFilterButtonElements = [],
    highlightRainCheckbox, highlightColdCheckbox, highlightHotCheckbox,
    // Elementos para as novas dicas de manutenção
    dicasResultadoDiv, tipoVeiculoDicaInput;

// Global state para forecast
let _globalPrevisaoDetalhadaProcessada = [];
let _globalNomeCidadePrevisaoDetalhada = '';
let _globalActiveNumDaysForecast = 5;

// --- CONSTANTES API ---
const OPENWEATHER_API_KEY = "b775ac361e430c4b74c75d5ca1bf2165";
const OPENWEATHER_API_KEY_DETALHADA = "b775ac361e430c4b74c75d5ca1bf2165";

// --- FUNÇÕES AUXILIARES E DE UI (displayGlobalAlert, playSound, etc.) ---
// (Estas funções permanecem as mesmas da versão anterior)
function displayGlobalAlert(message, type = 'info', duration = 5000) {
    if (!globalStatusDiv) return;
    clearTimeout(globalStatusTimeout);
    globalStatusDiv.textContent = message;
    globalStatusDiv.className = `status-${type}`;
    globalStatusDiv.style.display = 'block';
    void globalStatusDiv.offsetWidth;
    globalStatusDiv.classList.add('visible');
    if (duration > 0) {
        globalStatusTimeout = setTimeout(() => {
            globalStatusDiv.classList.remove('visible');
        }, duration);
    }
}

function playSound(elementId) {
    try {
        const audio = document.getElementById(elementId);
        if (audio) { audio.currentTime = 0; audio.play().catch(e => {}); }
    } catch(e) {}
}

function updateVehicleStatusUI(vehicleId, message, statusType = 'info', duration = 4000) {
    const statusEl = document.getElementById(`status-${vehicleId}`);
    if (!statusEl) return;
    clearTimeout(vehicleStatusTimeouts[vehicleId]);
    statusEl.textContent = message;
    statusEl.dataset.statusType = statusType;
    statusEl.classList.add('visible');
    if (duration > 0) {
        vehicleStatusTimeouts[vehicleId] = setTimeout(() => statusEl.classList.remove('visible'), duration);
    }
}


// --- FUNÇÕES DE LÓGICA PRINCIPAL (renderizarGaragem, ações, etc.) ---
// (Estas funções permanecem as mesmas da versão anterior)
function renderizarGaragem() {
    if (!containerCarro || !containerCaminhao) return;
    
    let carrosHtml = '';
    let caminhoesHtml = '';
    let carrosCount = 0;
    let caminhoesCount = 0;
    const veiculos = minhaGaragem.listarTodosVeiculos();

    veiculos.forEach(v => {
        const isCarroEsportivo = v instanceof CarroEsportivo;
        const isCaminhao = v instanceof Caminhao;
        let imagePath = isCarroEsportivo ? 'Imagens/carro-imagem.webp' : (isCaminhao ? 'Imagens/pngtree-red-truck-transport-png-image_11506094.png' : 'Imagens/default-vehicle.png');

        const veiculoCardHtml = `
            <div class="veiculo-item" id="veiculo-${v.id}" data-tipo="${v._tipoVeiculo}">
                <img src="${imagePath}" alt="Imagem de ${v.modelo}" loading="lazy" onerror="this.onerror=null; this.src='Imagens/default-vehicle.png';">
                <div class="veiculo-info">
                    <p><strong>${v.modelo} (${v.cor})</strong></p>
                    <p><span class="detail-label">Status:</span> <span class="detail-value">${v.ligado ? 'Ligado' : 'Desligado'}</span></p>
                    <p><span class="detail-label">Velocidade:</span> <span class="detail-value">${v.velocidade.toFixed(1)} km/h</span></p>
                    ${isCarroEsportivo ? `<p><span class="detail-label">Turbo:</span> <span class="detail-value">${v.turboAtivado ? 'Ativado' : 'Desativado'}</span></p>` : ''}
                    ${isCaminhao ? `<p><span class="detail-label">Carga:</span> <span class="detail-value">${v.cargaAtual.toFixed(1)} / ${v.capacidadeCarga.toFixed(1)} kg</span></p>` : ''}
                </div>
                <p id="status-${v.id}" class="status-veiculo" aria-live="polite"></p>
                <div class="button-group-veiculo">
                    <button class="btn-veiculo-ligar" onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''}>Ligar</button>
                    <button class="btn-veiculo-desligar" onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado || v.velocidade > 0 ? 'disabled' : ''}>Desligar</button>
                    <button class="btn-veiculo-acelerar" onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''}>Acelerar</button>
                    <button class="btn-veiculo-frear" onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade <= 0 ? 'disabled' : ''}>Frear</button>
                    ${isCarroEsportivo ? `
                        <button class="btn-veiculo-turbo-on" onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')" ${!v.ligado || v.turboAtivado ? 'disabled' : ''}>Turbo ON</button>
                        <button class="btn-veiculo-turbo-off" onclick="executarAcaoVeiculo('${v.id}', 'desativarTurbo')" ${!v.ligado || !v.turboAtivado ? 'disabled' : ''}>Turbo OFF</button>
                    ` : ''}
                    ${isCaminhao ? `
                        <button class="btn-veiculo-carregar" onclick="executarAcaoVeiculo('${v.id}', 'carregar', 1000)" ${v.cargaAtual >= v.capacidadeCarga ? 'disabled' : ''}>Carregar</button>
                        <button class="btn-veiculo-descarregar" onclick="executarAcaoVeiculo('${v.id}', 'descarregar', 500)" ${v.cargaAtual <= 0 ? 'disabled' : ''}>Descarregar</button>
                    ` : ''}
                    <button class="btn-veiculo-agendar" onclick="mostrarFormAgendamento('${v.id}')">Histórico</button>
                    <button class="btn-remover" onclick="removerVeiculoDaGaragem('${v.id}')">Remover</button>
                </div>
                <div class="historico-manutencao">
                    <h4>Histórico de Manutenção:</h4>
                    <ul>${v.getHistoricoFormatado()}</ul>
                </div>
            </div>`;
        
        if (isCarroEsportivo) { carrosHtml += veiculoCardHtml; carrosCount++; }
        else if (isCaminhao) { caminhoesHtml += veiculoCardHtml; caminhoesCount++; }
    });

    containerCarro.innerHTML = `<h3>Carros Esportivos (${carrosCount})</h3>` + (carrosCount > 0 ? carrosHtml : '<p class="empty-list-placeholder">Nenhum carro esportivo.</p>');
    containerCaminhao.innerHTML = `<h3>Caminhões (${caminhoesCount})</h3>` + (caminhoesCount > 0 ? caminhoesHtml : '<p class="empty-list-placeholder">Nenhum caminhão.</p>');
    
    renderizarAgendamentos();
}

function renderizarAgendamentos() {
    // Implementação da renderização de agendamentos (mesma da versão anterior)
    const agendamentos = minhaGaragem.listarAgendamentosFuturos();
    if(agendamentosListContainer){
        if (agendamentos.length > 0) {
            agendamentosListContainer.innerHTML = agendamentos.map(item => `<li><strong>${item.veiculo.modelo}</strong>: ${item.manutencao.tipo} em ${new Date(item.manutencao.data).toLocaleString('pt-BR')}</li>`).join('');
        } else {
            agendamentosListContainer.innerHTML = '<li class="empty-list-placeholder">Nenhum agendamento futuro.</li>';
        }
    }
}
// Outras funções como criarNovoVeiculo, executarAcaoVeiculo, etc...
// (Estas funções permanecem as mesmas da versão anterior)
function criarNovoVeiculo(tipo) {
    const prefix = tipo === 'CarroEsportivo' ? 'Esportivo' : 'Caminhao';
    const modelo = document.getElementById(`modelo${prefix}`).value;
    const cor = document.getElementById(`cor${prefix}`).value;
    
    if (!modelo || !cor) {
        displayGlobalAlert("Modelo e cor são obrigatórios.", "warning");
        return;
    }
    
    let veiculo;
    if (tipo === 'CarroEsportivo') {
        veiculo = new CarroEsportivo(modelo, cor);
    } else {
        const capacidade = document.getElementById('capacidadeCaminhao').value;
        veiculo = new Caminhao(modelo, cor, capacidade);
    }
    
    if (minhaGaragem.adicionarVeiculo(veiculo)) {
        displayGlobalAlert(`${veiculo.modelo} adicionado!`, 'success');
        renderizarGaragem();
        document.getElementById(`modelo${prefix}`).value = '';
        document.getElementById(`cor${prefix}`).value = '';
    }
}

function removerVeiculoDaGaragem(idVeiculo) {
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (confirm(`Tem certeza que deseja remover o ${veiculo.modelo}?`)) {
        minhaGaragem.removerVeiculo(idVeiculo);
        displayGlobalAlert(`${veiculo.modelo} removido.`, 'info');
        renderizarGaragem();
    }
}

function executarAcaoVeiculo(idVeiculo, acao, param = null) {
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo || typeof veiculo[acao] !== 'function') return;

    // Define valores padrão para ações comuns
    if (param === null) {
        if (acao === 'acelerar') param = veiculo instanceof Caminhao ? 5 : 15;
        if (acao === 'frear') param = veiculo instanceof Caminhao ? 3 : 10;
    }
    
    const msg = veiculo[acao](param);
    let statusType = 'info';
    if (msg.toLowerCase().includes('ligado')) statusType = 'success';
    if (msg.toLowerCase().includes('desligado')) statusType = 'warning';
    if (msg.toLowerCase().includes('turbo ativado')) statusType = 'turbo';

    updateVehicleStatusUI(idVeiculo, msg, statusType);
    playSound(`som${acao.charAt(0).toUpperCase() + acao.slice(1).replace('arTurbo', 'Acelerar').replace('ivarTurbo','')}`);
    minhaGaragem.salvar();
    renderizarGaragem();
}

// --- Funções de Agendamento/Modal (mesmas da versão anterior) ---
function mostrarFormAgendamento(idVeiculo) { /* ... */ }
function fecharFormAgendamento() { /* ... */ }
function salvarAgendamento(event) { /* ... */ }


// --- NOVAS FUNÇÕES: INTEGRAÇÃO COM BACKEND ---

/**
 * Exibe uma lista de dicas na div de resultados.
 * @param {Array<Object>} dicas - Um array de objetos, onde cada objeto tem uma propriedade 'dica'.
 */
function exibirDicas(dicas) {
    if (!dicasResultadoDiv) return;

    if (!dicas || dicas.length === 0) {
        dicasResultadoDiv.innerHTML = '<p class="dica-item-error">Nenhuma dica encontrada.</p>';
        return;
    }

    let html = '<ul>';
    dicas.forEach(item => {
        // Escapando HTML simples para segurança
        const dicaText = item.dica.replace(/</g, "<").replace(/>/g, ">");
        html += `<li class="dica-item">${dicaText}</li>`;
    });
    html += '</ul>';

    dicasResultadoDiv.innerHTML = html;
}

/**
 * Busca as dicas de manutenção gerais do nosso backend.
 */
async function buscarDicasGerais() {
    if (!dicasResultadoDiv) return;
    dicasResultadoDiv.innerHTML = '<p class="dica-item-loading">Buscando dicas gerais no servidor...</p>';

    try {
        const response = await fetch(`${backendUrl}/api/dicas-manutencao`);
        if (!response.ok) {
            throw new Error(`Erro do servidor: ${response.status}`);
        }
        const dicas = await response.json();
        exibirDicas(dicas);
    } catch (error) {
        console.error("Erro ao buscar dicas gerais:", error);
        dicasResultadoDiv.innerHTML = `<p class="dica-item-error">Falha ao buscar dicas gerais. O backend está rodando? (${error.message})</p>`;
    }
}

/**
 * Busca dicas de manutenção para um tipo específico de veículo.
 */
async function buscarDicasPorTipo() {
    if (!dicasResultadoDiv || !tipoVeiculoDicaInput) return;

    const tipoVeiculo = tipoVeiculoDicaInput.value.trim();
    if (!tipoVeiculo) {
        displayGlobalAlert("Por favor, digite um tipo de veículo (ex: carro, caminhao).", "warning");
        tipoVeiculoDicaInput.focus();
        return;
    }

    dicasResultadoDiv.innerHTML = `<p class="dica-item-loading">Buscando dicas para '${tipoVeiculo}'...</p>`;

    try {
        const response = await fetch(`${backendUrl}/api/dicas-manutencao/${encodeURIComponent(tipoVeiculo)}`);
        const data = await response.json();

        if (!response.ok) {
            // Se o servidor retornou um erro (como 404), o `data` terá a mensagem de erro.
            throw new Error(data.error || `Tipo '${tipoVeiculo}' não encontrado.`);
        }
        
        exibirDicas(data);

    } catch (error) {
        console.error("Erro ao buscar dicas por tipo:", error);
        dicasResultadoDiv.innerHTML = `<p class="dica-item-error">Falha ao buscar dicas para '${tipoVeiculo}'. (${error.message})</p>`;
    }
}


// --- Funções de API (OpenWeatherMap, etc. - mesmas da versão anterior) ---
async function buscarPrevisaoDetalhada(cidade, resultadoDivParam) { /* ... */ }
function processarDadosForecast(dataApi) { /* ... */ }
function updateDetailedForecastDisplay() { /* ... */ }
async function verificarClimaDetalhadoHandler() { /* ... */ }
function handleDayFilterClick(event) { /* ... */ }


// --- EVENT LISTENERS E INICIALIZAÇÃO ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Carregado. Inicializando Garagem v3.1 + Backend...");

    // --- Cache de Elementos do DOM ---
    globalStatusDiv = document.getElementById('globalStatus');
    containerCarro = document.getElementById('listaCarros');
    containerCaminhao = document.getElementById('listaCaminhoes');
    agendamentosListContainer = document.getElementById('agendamentosFuturosLista');
    
    // Cache dos novos elementos de Dicas de Manutenção
    dicasResultadoDiv = document.getElementById('dicasResultado');
    tipoVeiculoDicaInput = document.getElementById('tipoVeiculoDicaInput');
    
    // Cache de outros elementos (modal, forecast, etc.)
    // ... (mesma lógica da versão anterior)

    // --- Inicialização da Garagem ---
    try {
        minhaGaragem = new Garagem(); 
        minhaGaragem.carregar();
        renderizarGaragem();
    } catch (e) {
        console.error("Erro na inicialização da Garagem:", e);
        displayGlobalAlert("ERRO GRAVE AO CARREGAR DADOS DA GARAGEM.", "error", 0);
    }

    // --- Adicionar Event Listeners ---
    document.getElementById('criarCarroEsportivoBtn')?.addEventListener('click', () => criarNovoVeiculo('CarroEsportivo'));
    document.getElementById('criarCaminhaoBtn')?.addEventListener('click', () => criarNovoVeiculo('Caminhao'));
    document.getElementById('limparStorageBtn')?.addEventListener('click', () => {
        if (confirm("ATENÇÃO! Limpar TODA a garagem? Ação irreversível!")) {
            localStorage.removeItem(minhaGaragem.storageKey);
            minhaGaragem = new Garagem();
            renderizarGaragem();
            displayGlobalAlert("Garagem limpa.", "info");
        }
    });

    // Adiciona listeners para os novos botões de dicas
    document.getElementById('buscarDicasGeraisBtn')?.addEventListener('click', buscarDicasGerais);
    document.getElementById('buscarDicasPorTipoBtn')?.addEventListener('click', buscarDicasPorTipo);
    tipoVeiculoDicaInput?.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            buscarDicasPorTipo();
        }
    });

    // Adicionar outros listeners (modal, forecast, etc.)
    // ... (mesma lógica da versão anterior)

    displayGlobalAlert("Garagem Inteligente pronta!", "success", 3000);
});

//a