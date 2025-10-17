// ======================================================
// =========      NOVA LÓGICA DE AUTENTICAÇÃO     =========
// ======================================================

// Views principais da aplicação que serão controladas
let authView, garageView;

// Elementos da UI de autenticação
let loginForm, registerForm, logoutBtn, authStatus, userNameSpan;

// URL base do seu backend (já estava no seu código)
const backendUrl = 'https://projeto-objeto-carro.onrender.com';

/**
 * Função central que verifica o estado de autenticação e alterna a UI.
 */
function checkAuthState() {
    const token = localStorage.getItem('jwtToken');

    if (token) {
        // --- USUÁRIO ESTÁ LOGADO ---
        authView.classList.add('hidden');
        garageView.classList.remove('hidden');

        try {
            // Decodifica o token para pegar o nome e email do usuário para a UI
            const payload = JSON.parse(atob(token.split('.')[1]));
            userNameSpan.textContent = payload.nome || payload.email || 'Usuário';
        } catch (e) {
            console.error("Token JWT inválido ou malformado:", e);
            logout(); // Se o token for inválido, força o logout
            return;
        }
        
        // Busca os veículos do usuário no backend para popular a garagem
        fetchUserVehicles();

    } else {
        // --- USUÁRIO ESTÁ DESLOGADO ---
        authView.classList.remove('hidden');
        garageView.classList.add('hidden');
        // Limpa a garagem para não mostrar dados de um login anterior
        if (containerCarro) containerCarro.innerHTML = '<h3>Carros Esportivos</h3><p class="empty-list-placeholder">Faça login para ver sua garagem.</p>';
        if (containerCaminhao) containerCaminhao.innerHTML = '<h3>Caminhões</h3><p class="empty-list-placeholder">Faça login para ver sua garagem.</p>';
    }
}

/**
 * Manipula o envio do formulário de login.
 */
async function handleLogin(event) {
    event.preventDefault();
    authStatus.textContent = ''; 
    authStatus.className = 'status-message';
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // IMPORTANTE: A rota no seu backend para login precisa ser '/api/auth/login'
        const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Falha no login');

        localStorage.setItem('jwtToken', data.token);
        checkAuthState(); // Chave da transição: muda a UI para a garagem
    } catch (error) {
        authStatus.textContent = `Erro: ${error.message}`;
        authStatus.classList.add('error');
    }
}

/**
 * Manipula o envio do formulário de registro.
 */
async function handleRegister(event) {
    event.preventDefault();
    authStatus.textContent = '';
    authStatus.className = 'status-message';

    const nome = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        // IMPORTANTE: A rota no seu backend para registro precisa ser '/api/auth/register'
        const response = await fetch(`${backendUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Falha no registro');

        authStatus.textContent = 'Registro realizado com sucesso! Faça o login para continuar.';
        authStatus.classList.add('success');
        registerForm.reset();
    } catch (error) {
        authStatus.textContent = `Erro: ${error.message}`;
        authStatus.classList.add('error');
    }
}

/**
 * Realiza o logout do usuário, limpando o token e atualizando a UI.
 */
function logout() {
    localStorage.removeItem('jwtToken');
    checkAuthState(); // Chave da transição: muda a UI de volta para o login
}


// ================================================================
// --- SEU CÓDIGO ORIGINAL COMEÇA AQUI (COM PEQUENAS ADAPTAÇÕES) ---
// ================================================================

// --- CLASSES ---
// Suas classes (Vehicle, CarroEsportivo, Caminhao) permanecem inalteradas
class Vehicle {
    constructor(modelo, cor, id = null) {
        if (typeof modelo !== 'string' || !modelo.trim()) throw new Error("Modelo do veículo é obrigatório.");
        if (typeof cor !== 'string' || !cor.trim()) throw new Error("Cor do veículo é obrigatória.");
        this.id = id || `veh_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        this.modelo = modelo.trim();
        this.cor = cor.trim();
        this.ligado = false;
        this.velocidade = 0;
        this.historicoManutencao = [];
        this._tipoVeiculo = "Veiculo";
    }
    ligar() { if (this.ligado) return `${this.modelo} já está ligado.`; this.ligado = true; return `${this.modelo} ligado.`; }
    desligar() { if (!this.ligado) return `${this.modelo} já está desligado.`; if (this.velocidade > 0) { return `${this.modelo} precisa parar completamente (velocidade 0) antes de desligar.`; } this.ligado = false; this.velocidade = 0; return `${this.modelo} desligado.`; }
    acelerar(incremento) { const incValue = parseFloat(incremento); if (isNaN(incValue) || incValue <= 0) { return `${this.modelo} - Valor de aceleração inválido.`; } if (!this.ligado) { return `${this.modelo} precisa estar ligado para acelerar.`; } this.velocidade += incValue; return `${this.modelo} acelerou para ${this.velocidade.toFixed(1)} km/h.`; }
    frear(decremento) { const decValue = parseFloat(decremento); if (isNaN(decValue) || decValue <= 0) { return `${this.modelo} - Valor de frenagem inválido.`; } this.velocidade = Math.max(0, this.velocidade - decValue); return `${this.modelo} freou para ${this.velocidade.toFixed(1)} km/h.`; }
    adicionarManutencao(manutencaoObj) { if (typeof Manutencao === 'undefined' || !(manutencaoObj instanceof Manutencao)) { console.error("Objeto de manutenção inválido.", manutencaoObj); return false; } this.historicoManutencao.push(manutencaoObj); this.historicoManutencao.sort((a, b) => new Date(b.data) - new Date(a.data)); return true; }
    getHistoricoFormatado() { if (!this.historicoManutencao || this.historicoManutencao.length === 0) { return "<li class='empty-history'>Nenhum registro de manutenção.</li>"; } return this.historicoManutencao.map(m => `<li>${m.formatar()}</li>`).join(''); }
    exibirInformacoesBase() { return `Tipo: ${this._tipoVeiculo}, ID: ${this.id}, Modelo: ${this.modelo}, Cor: ${this.cor}, Ligado: ${this.ligado ? 'Sim' : 'Não'}, Velocidade: ${this.velocidade.toFixed(1)} km/h`; }
    exibirInformacoes() { return this.exibirInformacoesBase(); }
    interagir() { return `Interagindo com ${this._tipoVeiculo.toLowerCase()}: ${this.modelo}.`; }
    toJSON() { return { id: this.id, modelo: this.modelo, cor: this.cor, ligado: this.ligado, velocidade: this.velocidade, historicoManutencao: (this.historicoManutencao || []).map(m => m.toJSON()), _tipoVeiculo: this._tipoVeiculo }; }
    static fromJSON(data) {
        if (!data || !data._tipoVeiculo) return null; // ID não é mais obrigatório aqui, pois o backend fornecerá o _id
        let id = data._id || data.id; // Usa o _id do MongoDB como prioridade
        let vehicle = null;
        try {
            switch (data._tipoVeiculo) {
                case 'CarroEsportivo': vehicle = new CarroEsportivo(data.modelo, data.cor, id); if (typeof data.turboAtivado === 'boolean') vehicle.turboAtivado = data.turboAtivado; break;
                case 'Caminhao': const capacidade = data.capacidadeCarga ?? 0; vehicle = new Caminhao(data.modelo, data.cor, capacidade, id); if (typeof data.cargaAtual === 'number') vehicle.cargaAtual = data.cargaAtual; break;
                default: vehicle = new Vehicle(data.modelo, data.cor, id); break;
            }
            vehicle.ligado = data.ligado ?? false;
            vehicle.velocidade = data.velocidade ?? 0;
            if (Array.isArray(data.historicoManutencao) && typeof Manutencao?.fromJSON === 'function') { vehicle.historicoManutencao = data.historicoManutencao.map(m_data => Manutencao.fromJSON(m_data)).filter(m => m instanceof Manutencao); }
            return vehicle;
        } catch (error) { console.error(`Erro ao reconstruir veículo ID ${id}:`, error); return null; }
    }
}
class CarroEsportivo extends Vehicle {
    constructor(modelo, cor, id = null) { super(modelo, cor, id); this.turboAtivado = false; this._tipoVeiculo = "CarroEsportivo"; }
    ativarTurbo() { if (!this.ligado) return `${this.modelo} precisa estar ligado.`; if (this.turboAtivado) return `${this.modelo} turbo já ativado.`; this.turboAtivado = true; return `${this.modelo}: Turbo ativado!`; }
    desativarTurbo() { if (!this.turboAtivado) return `${this.modelo} turbo já desativado.`; this.turboAtivado = false; return `${this.modelo}: Turbo desativado.`; }
    desligar() { if (this.velocidade > 0) return super.desligar(); const msg = super.desligar(); this.turboAtivado = false; return msg + " Turbo também foi desativado."; }
    exibirInformacoes() { return `${super.exibirInformacoesBase()}, Turbo: ${this.turboAtivado ? 'Ativado' : 'Desativado'}`; }
    interagir() { return `Acelerando o ${this.modelo} ${this.cor}${this.turboAtivado ? ' com turbo!' : ''}. Vruum!`; }
    toJSON() { const data = super.toJSON(); data.turboAtivado = this.turboAtivado; return data; }
}
class Caminhao extends Vehicle {
    constructor(modelo, cor, capacidadeCarga, id = null) { super(modelo, cor, id); this.capacidadeCarga = parseFloat(capacidadeCarga) || 0; this.cargaAtual = 0; this._tipoVeiculo = "Caminhao"; }
    carregar(quantidade) { const quant = parseFloat(quantidade); if (isNaN(quant) || quant <= 0) return "Quantidade inválida."; if (this.cargaAtual + quant > this.capacidadeCarga) { return `Capacidade máxima excedida. Carga: ${this.cargaAtual} kg.`; } this.cargaAtual += quant; return `${this.modelo} carregado. Carga: ${this.cargaAtual} kg.`; }
    descarregar(quantidade) { const quant = parseFloat(quantidade); if (isNaN(quant) || quant <= 0) return "Quantidade inválida."; this.cargaAtual = Math.max(0, this.cargaAtual - quant); return `${this.modelo} descarregado. Carga: ${this.cargaAtual} kg.`; }
    exibirInformacoes() { return `${super.exibirInformacoesBase()}, Carga: ${this.cargaAtual}/${this.capacidadeCarga} kg`; }
    interagir() { return `Transportando ${this.cargaAtual} kg com o caminhão ${this.modelo}.`; }
    toJSON() { const data = super.toJSON(); data.capacidadeCarga = this.capacidadeCarga; data.cargaAtual = this.cargaAtual; return data; }
}

// --- SUAS VARIÁVEIS GLOBAIS E CONSTANTES (INALTERADAS) ---
let globalStatusTimeout = null;
let vehicleStatusTimeouts = {};
let alertadosHoje = new Set();
let agendamentoModal, formAgendamento, agendamentoTituloVeiculo, agendamentoVeiculoIdInput, agendamentoDataInput, agendamentoTipoInput, agendamentoCustoInput, agendamentoDescricaoInput;
let previsaoDetalhadaResultadoDiv, detailedDayFilterButtonElements = [], highlightRainCheckbox, highlightColdCheckbox, highlightHotCheckbox;
let dicasResultadoDiv, tipoVeiculoDicaInput;
let _globalPrevisaoDetalhadaProcessada = [], _globalNomeCidadePrevisaoDetalhada = '', _globalActiveNumDaysForecast = 5;
const OPENWEATHER_API_KEY = "b775ac361e430c4b74c75d5ca1bf2165";
const OPENWEATHER_API_KEY_DETALHADA = "b775ac361e430c4b74c75d5ca1bf2165";

// --- FUNÇÕES AUXILIARES E DE UI (INALTERADAS) ---
function displayGlobalAlert(message, type = 'info', duration = 5000) { if (!globalStatusDiv) return; clearTimeout(globalStatusTimeout); globalStatusDiv.textContent = message; globalStatusDiv.className = `status-${type}`; globalStatusDiv.style.display = 'block'; void globalStatusDiv.offsetWidth; globalStatusDiv.classList.add('visible'); if (duration > 0) { globalStatusTimeout = setTimeout(() => { globalStatusDiv.classList.remove('visible'); }, duration); } }
function playSound(elementId) { try { const audio = document.getElementById(elementId); if (audio) { audio.currentTime = 0; audio.play().catch(e => {}); } } catch(e) {} }
function updateVehicleStatusUI(vehicleId, message, statusType = 'info', duration = 4000) { const statusEl = document.getElementById(`status-${vehicleId}`); if (!statusEl) return; clearTimeout(vehicleStatusTimeouts[vehicleId]); statusEl.textContent = message; statusEl.dataset.statusType = statusType; statusEl.classList.add('visible'); if (duration > 0) { vehicleStatusTimeouts[vehicleId] = setTimeout(() => statusEl.classList.remove('visible'), duration); } }


// --- FUNÇÕES DE LÓGICA PRINCIPAL (ADAPTADAS E INALTERADAS) ---

async function fetchUserVehicles() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return;

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.status === 401) { throw new Error('Sessão expirada. Faça login novamente.'); }
        if (!response.ok) { throw new Error('Não foi possível carregar os veículos.'); }

        const veiculosDoBackend = await response.json();
        
        // Populamos a instância `minhaGaragem` com os dados do servidor
        minhaGaragem = new Garagem(); 
        veiculosDoBackend.forEach(dados => {
            const veiculo = Vehicle.fromJSON(dados);
            if (veiculo) minhaGaragem.adicionarVeiculo(veiculo);
        });
        
        // Agora que `minhaGaragem` está atualizada, renderizamos
        renderizarGaragem();

    } catch (error) {
        displayGlobalAlert(error.message, 'error');
        if (error.message.includes("expirada")) logout();
    }
}

function renderizarGaragem() {
    // ESTA FUNÇÃO PERMANECE EXATAMENTE A MESMA. ELA É PERFEITA.
    // Ela já lê da instância `minhaGaragem`, que agora é populada pelo `fetchUserVehicles`.
    if (!containerCarro || !containerCaminhao) return;
    let carrosHtml = '', caminhoesHtml = '', carrosCount = 0, caminhoesCount = 0;
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
                    <button onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''}>Ligar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado || v.velocidade > 0 ? 'disabled' : ''}>Desligar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''}>Acelerar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade <= 0 ? 'disabled' : ''}>Frear</button>
                    ${isCarroEsportivo ? `<button onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')" ${!v.ligado || v.turboAtivado ? 'disabled' : ''}>Turbo ON</button><button onclick="executarAcaoVeiculo('${v.id}', 'desativarTurbo')" ${!v.ligado || !v.turboAtivado ? 'disabled' : ''}>Turbo OFF</button>` : ''}
                    ${isCaminhao ? `<button onclick="executarAcaoVeiculo('${v.id}', 'carregar', 1000)" ${v.cargaAtual >= v.capacidadeCarga ? 'disabled' : ''}>Carregar</button><button onclick="executarAcaoVeiculo('${v.id}', 'descarregar', 500)" ${v.cargaAtual <= 0 ? 'disabled' : ''}>Descarregar</button>` : ''}
                    <button onclick="mostrarFormAgendamento('${v.id}')">Histórico</button>
                    <button class="btn-remover" onclick="removerVeiculoDaGaragem('${v.id}')">Remover</button>
                </div>
                <div class="historico-manutencao"><h4>Histórico de Manutenção:</h4><ul>${v.getHistoricoFormatado()}</ul></div>
            </div>`;
        if (isCarroEsportivo) { carrosHtml += veiculoCardHtml; carrosCount++; }
        else if (isCaminhao) { caminhoesHtml += veiculoCardHtml; caminhoesCount++; }
    });
    containerCarro.innerHTML = `<h3>Carros Esportivos (${carrosCount})</h3>` + (carrosCount > 0 ? carrosHtml : '<p class="empty-list-placeholder">Nenhum carro esportivo.</p>');
    containerCaminhao.innerHTML = `<h3>Caminhões (${caminhoesCount})</h3>` + (caminhoesCount > 0 ? caminhoesHtml : '<p class="empty-list-placeholder">Nenhum caminhão.</p>');
}

// *** FUNÇÃO ADAPTADA PARA O BACKEND ***
async function criarNovoVeiculo(tipo) {
    const token = localStorage.getItem('jwtToken');
    const prefix = tipo === 'CarroEsportivo' ? 'Esportivo' : 'Caminhao';
    const modelo = document.getElementById(`modelo${prefix}`).value;
    const cor = document.getElementById(`cor${prefix}`).value;
    if (!modelo || !cor) { displayGlobalAlert("Modelo e cor são obrigatórios.", "warning"); return; }

    let dadosNovoVeiculo = { modelo, cor, _tipoVeiculo: tipo };
    if (tipo === 'Caminhao') {
        dadosNovoVeiculo.capacidadeCarga = document.getElementById('capacidadeCaminhao').value;
    }

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(dadosNovoVeiculo)
        });
        const veiculoCriado = await response.json();
        if (!response.ok) throw new Error(veiculoCriado.error || "Erro ao criar veículo");

        displayGlobalAlert(`${modelo} adicionado com sucesso!`, 'success');
        fetchUserVehicles(); // Recarrega a garagem do servidor
        document.getElementById(`modelo${prefix}`).value = '';
        document.getElementById(`cor${prefix}`).value = '';
    } catch(error) {
        displayGlobalAlert(`Erro: ${error.message}`, 'error');
    }
}

// *** FUNÇÃO ADAPTADA PARA O BACKEND ***
async function removerVeiculoDaGaragem(idVeiculo) {
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo || !confirm(`Tem certeza que deseja remover o ${veiculo.modelo}?`)) return;

    const token = localStorage.getItem('jwtToken');
    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${idVeiculo}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.error || 'Erro ao remover veículo');

        displayGlobalAlert(`${veiculo.modelo} removido.`, 'info');
        fetchUserVehicles(); // Recarrega a garagem do servidor
    } catch (error) {
        displayGlobalAlert(`Erro: ${error.message}`, 'error');
    }
}

// SUAS FUNÇÕES ORIGINAIS (INTERAÇÃO, DICAS, CLIMA, ETC.) CONTINUAM AQUI INALTERADAS
function executarAcaoVeiculo(idVeiculo, acao, param = null) {
    // ESTA FUNÇÃO NÃO PRECISA MUDAR. As ações de ligar, acelerar, etc., são de estado
    // temporário e podem continuar manipulando o objeto no frontend. Apenas
    // renderizarGaragem() é chamado no final para atualizar a UI, o que é perfeito.
    const veiculo = minhaGaragem.encontrarVeiculoPorId(idVeiculo);
    if (!veiculo || typeof veiculo[acao] !== 'function') return;
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
    // A linha minhaGaragem.salvar() não é mais necessária para persistência principal,
    // mas pode ser mantida se você quiser salvar o estado (velocidade, ligado) no localStorage.
    // minhaGaragem.salvar(); 
    renderizarGaragem();
}
async function buscarDicasGerais() { /* ... SEU CÓDIGO ORIGINAL ... */ }
async function buscarDicasPorTipo() { /* ... SEU CÓDIGO ORIGINAL ... */ }
// ... E TODAS AS OUTRAS FUNÇÕES ...


// ======================================================
// =========      INICIALIZAÇÃO DA PÁGINA       =========
// ======================================================

document.addEventListener('DOMContentLoaded', () => {
    // Cache dos elementos da UI de Autenticação
    authView = document.getElementById('auth-view');
    garageView = document.getElementById('garage-view');
    loginForm = document.getElementById('loginForm');
    registerForm = document.getElementById('registerForm');
    logoutBtn = document.getElementById('logoutBtn');
    authStatus = document.getElementById('auth-status');
    userNameSpan = document.getElementById('userName');
    
    // Cache dos elementos da sua garagem (código original)
    globalStatusDiv = document.getElementById('globalStatus');
    containerCarro = document.getElementById('listaCarros');
    containerCaminhao = document.getElementById('listaCaminhoes');
    // ... cache dos seus outros elementos ...

    // Listeners de autenticação
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    logoutBtn.addEventListener('click', logout);
    
    // Listeners da sua garagem (código original)
    document.getElementById('criarCarroEsportivoBtn')?.addEventListener('click', () => criarNovoVeiculo('CarroEsportivo'));
    document.getElementById('criarCaminhaoBtn')?.addEventListener('click', () => criarNovoVeiculo('Caminhao'));
    // ... adicione aqui TODOS os outros listeners que você já tinha ...
    
    // Instancia a garagem (será populada via fetch)
    minhaGaragem = new Garagem();

    // Verificação inicial para decidir qual tela mostrar
    checkAuthState();
});