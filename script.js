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

        // SUCESSO: Salva o token e atualiza a UI
        localStorage.setItem('jwtToken', data.token);
        checkAuthState(); // Chave da transição: muda a UI para a garagem
        // FEEDBACK DE SUCESSO RECOMENDADO
        displayGlobalAlert('Login realizado com sucesso! Bem-vindo(a)!', 'success');

    } catch (error) {
        // ERRO: Exibe a mensagem de erro do backend no formulário
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

        // SUCESSO: Exibe mensagem de sucesso no formulário
        authStatus.textContent = 'Registro realizado com sucesso! Faça o login para continuar.';
        authStatus.classList.add('success');
        registerForm.reset();
    } catch (error) {
        // ERRO: Exibe a mensagem de erro do backend no formulário
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
    // COMENTÁRIO: A lógica para exibir a lista de usuários compartilhados e o botão
    // "Remover Acesso" seria adicionada aqui, dentro do loop forEach.
    // Seria necessário que os dados do veículo vindos do backend (`/api/veiculos`)
    // incluíssem um array `sharedWith` populado com os detalhes dos usuários.
    /* Exemplo de como seria:
    ...
    let sharedWithHtml = '';
    if (v.isOwner && v.sharedWith && v.sharedWith.length > 0) {
        sharedWithHtml = '<h5>Compartilhado com:</h5><ul>';
        v.sharedWith.forEach(user => {
            sharedWithHtml += `<li>${user.email} <button onclick="handleUnshare('${v.id}', '${user._id}')">X</button></li>`;
        });
        sharedWithHtml += '</ul>';
    }
    const veiculoCardHtml = `... inclua a variável ${sharedWithHtml} no local desejado ...`;
    ...
    */
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

/**
 * [DESAFIO] Manipula a remoção de um compartilhamento de veículo.
 * @param {string} veiculoId - O ID do veículo.
 * @param {string} userIdToRemove - O ID do usuário a ser removido.
 */
async function handleUnshare(veiculoId, userIdToRemove) {
    if (!confirm('Tem certeza que deseja remover o acesso deste usuário?')) return;

    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}/unshare`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userIdToRemove })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Falha ao remover compartilhamento.');

        // FEEDBACK DE SUCESSO
        displayGlobalAlert('Acesso removido com sucesso!', 'success');
        fetchUserVehicles(); // Recarrega a garagem para atualizar a lista de compartilhamento

    } catch (error) {
        // FEEDBACK DE ERRO
        displayGlobalAlert(`Erro: ${error.message}`, 'error');
    }
}


// SUAS FUNÇÕES ORIGINAIS (INTERAÇÃO, DICAS, CLIMA, ETC.) CONTINUAM AQUI INALTERADAS
function renderizarGaragem() {
    if (!containerCarro || !containerCaminhao) return;
    
    let carrosHtml = '', caminhoesHtml = '';
    let carrosCount = 0, caminhoesCount = 0;
    
    const veiculos = minhaGaragem.listarTodosVeiculos();
    
    veiculos.forEach(v => {
        const isCarroEsportivo = v instanceof CarroEsportivo;
        const isCaminhao = v instanceof Caminhao;
        
        // Define imagem
        let imagePath = isCarroEsportivo ? 'Imagens/carro-imagem.webp' : (isCaminhao ? 'Imagens/pngtree-red-truck-transport-png-image_11506094.png' : 'Imagens/default-vehicle.png');

        // --- LÓGICA VISUAL DO COMPARTILHAMENTO ---
        let badgeHtml = '';
        let extraClass = '';
        let btnShareHtml = '';
        let btnDeleteHtml = '';

        if (v.isSharedWithMe) {
            // É compartilhado COMIGO
            const nomeDono = v.ownerDetails ? v.ownerDetails.nome : 'Outro usuário';
            badgeHtml = `<span class="shared-badge" title="Pertence a ${v.ownerDetails?.email}">Compartilhado por ${nomeDono}</span>`;
            extraClass = 'is-shared-with-me'; 
            // Não mostramos botão de deletar nem compartilhar nos carros dos outros
        } else {
            // É MEU carro
            badgeHtml = `<span class="owner-badge">Meu Veículo</span>`;
            // Posso compartilhar e deletar
            btnShareHtml = `<button class="btn-share" onclick="compartilharVeiculo('${v.id}')">Compartilhar</button>`;
            btnDeleteHtml = `<button class="btn-remover" onclick="removerVeiculoDaGaragem('${v.id}')">Remover</button>`;
        }

        // --- HTML DO CARD ---
        const veiculoCardHtml = `
            <div class="veiculo-item ${extraClass}" id="veiculo-${v.id}">
                <img src="${imagePath}" alt="Imagem de ${v.modelo}">
                <div class="veiculo-info">
                    <p><strong>${v.modelo} (${v.cor})</strong> ${badgeHtml}</p>
                    <p><span class="detail-label">Status:</span> ${v.ligado ? 'Ligado' : 'Desligado'}</p>
                    <p><span class="detail-label">Velocidade:</span> ${v.velocidade.toFixed(1)} km/h</p>
                    ${isCarroEsportivo ? `<p>Turbo: ${v.turboAtivado ? 'ON' : 'OFF'}</p>` : ''}
                    ${isCaminhao ? `<p>Carga: ${v.cargaAtual}/${v.capacidadeCarga}</p>` : ''}
                </div>
                <p id="status-${v.id}" class="status-veiculo"></p>
                
                <div class="button-group-veiculo">
                    <button onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''}>Ligar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado || v.velocidade > 0 ? 'disabled' : ''}>Desligar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''}>Acelerar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade <= 0 ? 'disabled' : ''}>Frear</button>
                    
                    ${isCarroEsportivo ? `<button onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')">Turbo</button>` : ''}
                    ${isCaminhao ? `<button onclick="executarAcaoVeiculo('${v.id}', 'carregar', 500)">Carregar</button>` : ''}
                    
                    ${btnShareHtml} <!-- Só aparece se for meu -->
                    ${btnDeleteHtml} <!-- Só aparece se for meu -->
                </div>
            </div>`;

        if (isCarroEsportivo) { carrosHtml += veiculoCardHtml; carrosCount++; }
        else if (isCaminhao) { caminhoesHtml += veiculoCardHtml; caminhoesCount++; }
    });

    containerCarro.innerHTML = `<h3>Carros (${carrosCount})</h3>` + carrosHtml;
    containerCaminhao.innerHTML = `<h3>Caminhões (${caminhoesCount})</h3>` + caminhoesHtml;
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

document.addEventListener('DOMContentLoaded', () => {
    // === VARIÁVEIS E ESTADO ===
    const backendUrl = 'http://localhost:5000'; // URL do seu backend

    // Views
    const authView = document.getElementById('auth-view');
    const appView = document.getElementById('app-view');

    // Forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const newPostForm = document.getElementById('newPostForm');

    // Containers e Botões
    const postsContainer = document.getElementById('posts-container');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Status
    const loginStatus = document.getElementById('login-status');
    const registerStatus = document.getElementById('register-status');
    const postStatus = document.getElementById('post-status');

    let currentUser = null;

    // === FUNÇÕES DE LÓGICA ===

    // Exibe mensagem de status
    function showStatusMessage(element, message, type) {
        element.textContent = message;
        element.className = `status-message ${type}`;
    }

    // Decodifica o token para obter os dados do usuário
    function decodeToken(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    // Verifica o estado de autenticação e atualiza a UI
    function checkAuthState() {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            currentUser = decodeToken(token);
            if (currentUser) {
                authView.classList.add('hidden');
                appView.classList.remove('hidden');
                userNameSpan.textContent = currentUser.nome;
                fetchPosts();
            } else {
                logout(); // Token inválido
            }
        } else {
            authView.classList.remove('hidden');
            appView.classList.add('hidden');
            currentUser = null;
        }
    }

    // Busca e renderiza os posts
    async function fetchPosts() {
        try {
            const response = await fetch(`${backendUrl}/api/posts`);
            const posts = await response.json();

            postsContainer.innerHTML = ''; // Limpa antes de renderizar
            if (posts.length === 0) {
                postsContainer.innerHTML = '<p>Nenhum post ainda. Seja o primeiro a publicar!</p>';
                return;
            }

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.className = 'post-card';
                
                const deleteBtnHtml = (currentUser && currentUser.userId === post.owner) 
                    ? `<button class="delete-btn" data-post-id="${post._id}">Deletar</button>` 
                    : '';

                postElement.innerHTML = `
                    ${deleteBtnHtml}
                    <h3>${post.titulo}</h3>
                    <div class="post-meta">
                        <span>Por: ${post.autor}</span> | 
                        <span>Em: ${new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>${post.conteudo}</p>
                `;
                postsContainer.appendChild(postElement);
            });

        } catch (error) {
            postsContainer.innerHTML = '<p style="color: red;">Erro ao carregar posts.</p>';
        }
    }
    
    // === MANIPULADORES DE EVENTO ===

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${backendUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showStatusMessage(loginStatus, 'Login bem-sucedido!', 'success');
            localStorage.setItem('jwtToken', data.token);
            setTimeout(checkAuthState, 1000);

        } catch (error) {
            showStatusMessage(loginStatus, `Erro: ${error.message}`, 'error');
        }
    });

    // Registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, password })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showStatusMessage(registerStatus, 'Registro bem-sucedido! Faça o login.', 'success');
            registerForm.reset();

        } catch (error) {
            showStatusMessage(registerStatus, `Erro: ${error.message}`, 'error');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('jwtToken');
        checkAuthState();
    });

    // Criar novo post
    newPostForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const titulo = document.getElementById('postTitle').value;
        const conteudo = document.getElementById('postContent').value;
        const token = localStorage.getItem('jwtToken');

        try {
            const response = await fetch(`${backendUrl}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ titulo, conteudo })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            showStatusMessage(postStatus, 'Post criado com sucesso!', 'success');
            newPostForm.reset();
            fetchPosts(); // Atualiza a lista
            setTimeout(() => postStatus.className = 'status-message', 3000);

        } catch (error) {
            showStatusMessage(postStatus, `Erro: ${error.message}`, 'error');
        }
    });
    
    // Deletar post (usando delegação de evento)
    postsContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const postId = e.target.dataset.postId;
            if (!confirm('Tem certeza que deseja deletar este post?')) return;
            
            const token = localStorage.getItem('jwtToken');
            try {
                const response = await fetch(`${backendUrl}/api/posts/${postId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error);

                alert('Post deletado com sucesso!');
                fetchPosts(); // Atualiza a lista

            } catch (error) {
                alert(`Erro ao deletar post: ${error.message}`);
            }
        }
    });

    // --- INICIALIZAÇÃO ---
    checkAuthState();
});

// Variável global para saber quem está logado
let currentUserId = null; 

function checkAuthState() {
    const token = localStorage.getItem('jwtToken');

    if (token) {
        // --- USUÁRIO LOGADO ---
        try {
            // Decodifica o token JWT (a parte do meio)
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Salva o ID do usuário globalmente para usar depois
            currentUserId = payload.userId; 
            
            if(userNameSpan) userNameSpan.textContent = payload.nome || payload.email || 'Usuário';
            
            authView.classList.add('hidden');
            garageView.classList.remove('hidden');

            fetchUserVehicles(); // Busca os carros no banco
        } catch (e) {
            console.error("Token inválido:", e);
            logout();
        }
    } else {
        // --- USUÁRIO DESLOGADO ---
        currentUserId = null;
        authView.classList.remove('hidden');
        garageView.classList.add('hidden');
        
        // Limpa a interface
        if (containerCarro) containerCarro.innerHTML = '';
        if (containerCaminhao) containerCaminhao.innerHTML = '';
    }
}

class Vehicle {
    constructor(modelo, cor, id = null) {
        this.id = id || `veh_${Date.now()}`;
        this.modelo = modelo;
        this.cor = cor;
        this.ligado = false;
        this.velocidade = 0;
        this.historicoManutencao = [];
        this._tipoVeiculo = "Veiculo";
        
        // NOVOS CAMPOS
        this.ownerDetails = null; // Guardar {id, nome, email} do dono
        this.isSharedWithMe = false; // Flag para saber se é compartilhado
    }

    // ... (Mantenha seus métodos ligar, desligar, acelerar iguais) ...
    ligar() { if (this.ligado) return "Já ligado"; this.ligado = true; return "Ligado"; }
    desligar() { if (this.velocidade > 0) return "Pare o carro primeiro"; this.ligado = false; return "Desligado"; }
    acelerar(val) { if(!this.ligado) return "Ligue primeiro"; this.velocidade += val; return `Velocidade: ${this.velocidade}`; }
    frear(val) { this.velocidade = Math.max(0, this.velocidade - val); return `Velocidade: ${this.velocidade}`; }
    getHistoricoFormatado() { return this.historicoManutencao.map(m => `<li>${m.formatar()}</li>`).join(''); }
    
    // MÉTODO FROMJSON ATUALIZADO
    static fromJSON(data) {
        if (!data) return null;
        let vehicle = null;
        
        // Identifica o tipo vindo do backend
        const tipo = data._tipoVeiculo || data.tipo; // O backend pode mandar 'tipo', o front usa '_tipoVeiculo'
        
        switch (tipo) {
            case 'CarroEsportivo': 
                vehicle = new CarroEsportivo(data.modelo, data.cor, data._id || data.id); 
                if (data.turboAtivado) vehicle.turboAtivado = true;
                break;
            case 'Caminhao': 
                vehicle = new Caminhao(data.modelo, data.cor, data.capacidadeCarga, data._id || data.id); 
                if (data.cargaAtual) vehicle.cargaAtual = data.cargaAtual;
                break;
            default: 
                vehicle = new Vehicle(data.modelo, data.cor, data._id || data.id);
        }

        // Restaura estados básicos
        vehicle.ligado = data.ligado || false;
        vehicle.velocidade = data.velocidade || 0;
        
        // --- LÓGICA DE PROPRIEDADE ---
        // O backend manda 'owner' populado (objeto) ou só ID
        if (data.owner) {
            vehicle.ownerDetails = data.owner; // Salva o objeto { _id, nome, email }
            
            // Se o ID do dono for diferente do meu ID atual, é compartilhado!
            if (currentUserId && vehicle.ownerDetails._id !== currentUserId) {
                vehicle.isSharedWithMe = true;
            }
        }

        return vehicle;
    }
}

async function compartilharVeiculo(veiculoId) {
    const emailDestino = prompt("Com quem você quer compartilhar este veículo? Digite o e-mail:");
    
    if (!emailDestino) return; // Cancelou

    const token = localStorage.getItem('jwtToken');
    
    try {
        const response = await fetch(`${backendUrl}/api/veiculos/${veiculoId}/share`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email: emailDestino })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Erro ao compartilhar');

        displayGlobalAlert(data.message, 'success');
        
    } catch (error) {
        displayGlobalAlert(`Erro: ${error.message}`, 'error');
    }
}

// ======================================================
// =========      CRIAÇÃO COM UPLOAD (FormData) =========
// ======================================================

async function criarNovoVeiculo(tipo) {
    const token = localStorage.getItem('jwtToken');
    const prefix = tipo === 'CarroEsportivo' ? 'Esportivo' : 'Caminhao';
    
    // Elementos do DOM
    const modeloInput = document.getElementById(`modelo${prefix}`);
    const corInput = document.getElementById(`cor${prefix}`);
    const imagemInput = document.getElementById(`imagem${prefix}`); // Novo input
    
    const modelo = modeloInput.value;
    const cor = corInput.value;

    if (!modelo || !cor) { 
        displayGlobalAlert("Modelo e cor são obrigatórios.", "warning"); 
        return; 
    }

    // --- MUDANÇA PRINCIPAL: Usar FormData em vez de JSON ---
    const formData = new FormData();
    formData.append('modelo', modelo);
    formData.append('cor', cor);
    formData.append('_tipoVeiculo', tipo); // O backend espera isso para decidir se é Carro ou Caminhão

    if (tipo === 'Caminhao') {
        const capacidade = document.getElementById('capacidadeCaminhao').value;
        formData.append('capacidadeCarga', capacidade);
    }

    // Anexar o arquivo se ele foi selecionado
    if (imagemInput.files[0]) {
        formData.append('imagem', imagemInput.files[0]);
    }

    try {
        const response = await fetch(`${backendUrl}/api/veiculos`, {
            method: 'POST',
            headers: { 
                // NÃO defina 'Content-Type': 'application/json' aqui!
                // O navegador define automaticamente o multipart/form-data com o boundary correto.
                'Authorization': `Bearer ${token}` 
            },
            body: formData // Envia o objeto FormData
        });

        const veiculoCriado = await response.json();
        
        if (!response.ok) throw new Error(veiculoCriado.error || "Erro ao criar veículo");

        displayGlobalAlert(`${modelo} adicionado com sucesso!`, 'success');
        fetchUserVehicles(); // Recarrega a garagem

        // Limpar formulário
        modeloInput.value = '';
        corInput.value = '';
        imagemInput.value = ''; // Limpa o input file

    } catch(error) {
        displayGlobalAlert(`Erro: ${error.message}`, 'error');
    }
}

// ======================================================
// =========      RENDERIZAÇÃO COM IMAGEM       =========
// ======================================================

function renderizarGaragem() {
    if (!containerCarro || !containerCaminhao) return;
    
    let carrosHtml = '', caminhoesHtml = '';
    let carrosCount = 0, caminhoesCount = 0;
    
    const veiculos = minhaGaragem.listarTodosVeiculos();
    
    veiculos.forEach(v => {
        const isCarroEsportivo = v instanceof CarroEsportivo;
        const isCaminhao = v instanceof Caminhao;
        
        // Lógica da Imagem:
        // 1. Tenta usar a imagem vinda do banco (upload)
        // 2. Se não tiver, usa a imagem padrão baseada no tipo
        let imagePath;
        
        if (v.imageUrl) {
            // O backend retorna algo como "uploads/1234-arquivo.jpg"
            // Precisamos concatenar com a URL do backend
            imagePath = `${backendUrl}/${v.imageUrl}`;
        } else {
            // Fallback para imagens estáticas locais
            imagePath = isCarroEsportivo ? 'Imagens/carro-imagem.webp' : 'Imagens/pngtree-red-truck-transport-png-image_11506094.png';
        }

        // Se o objeto Veiculo não tiver o campo imageUrl (porque foi instanciado da classe antiga no front),
        // precisamos garantir que o fromJSON pegou esse dado. 
        // Certifique-se que o método Vehicle.fromJSON mapeia data.imageUrl para this.imageUrl.
        
        // ... (código dos badges e botões igual ao anterior) ...
        let sharedBadgeHtml = v.isSharedWithMe ? `<span class="shared-badge">Compartilhado</span>` : `<span class="owner-badge">Meu Veículo</span>`;
        let shareBtn = v.isSharedWithMe ? '' : `<button class="btn-share" onclick="compartilharVeiculo('${v.id}')">Compartilhar</button>`;
        let deleteBtn = v.isSharedWithMe ? '' : `<button class="btn-remover" onclick="removerVeiculoDaGaragem('${v.id}')">Remover</button>`;

        const veiculoCardHtml = `
            <div class="veiculo-item" id="veiculo-${v.id}">
                <!-- AQUI A MÁGICA ACONTECE: Exibe a imagem -->
                <img src="${imagePath}" alt="Imagem de ${v.modelo}" 
                     style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px;">
                
                <div class="veiculo-info">
                    <p><strong>${v.modelo} (${v.cor})</strong> ${sharedBadgeHtml}</p>
                    <p><span class="detail-label">Status:</span> ${v.ligado ? 'Ligado' : 'Desligado'}</p>
                    <p><span class="detail-label">Velocidade:</span> ${v.velocidade.toFixed(1)} km/h</p>
                    ${isCarroEsportivo ? `<p>Turbo: ${v.turboAtivado ? 'ON' : 'OFF'}</p>` : ''}
                    ${isCaminhao ? `<p>Carga: ${v.cargaAtual}/${v.capacidadeCarga}</p>` : ''}
                </div>
                <p id="status-${v.id}" class="status-veiculo"></p>
                <div class="button-group-veiculo">
                    <button onclick="executarAcaoVeiculo('${v.id}', 'ligar')" ${v.ligado ? 'disabled' : ''}>Ligar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'desligar')" ${!v.ligado || v.velocidade > 0 ? 'disabled' : ''}>Desligar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'acelerar')" ${!v.ligado ? 'disabled' : ''}>Acelerar</button>
                    <button onclick="executarAcaoVeiculo('${v.id}', 'frear')" ${!v.ligado || v.velocidade <= 0 ? 'disabled' : ''}>Frear</button>
                    ${isCarroEsportivo ? `<button onclick="executarAcaoVeiculo('${v.id}', 'ativarTurbo')">Turbo</button>` : ''}
                    ${isCaminhao ? `<button onclick="executarAcaoVeiculo('${v.id}', 'carregar', 500)">Carregar</button>` : ''}
                    ${shareBtn}
                    <button onclick="mostrarFormAgendamento('${v.id}')">Histórico</button>
                    ${deleteBtn}
                </div>
            </div>`;

        if (isCarroEsportivo) { carrosHtml += veiculoCardHtml; carrosCount++; }
        else if (isCaminhao) { caminhoesHtml += veiculoCardHtml; caminhoesCount++; }
    });

    containerCarro.innerHTML = `<h3>Carros (${carrosCount})</h3>` + carrosHtml;
    containerCaminhao.innerHTML = `<h3>Caminhões (${caminhoesCount})</h3>` + caminhoesHtml;
}

class Vehicle {
    constructor(modelo, cor, id = null) {
        // ... (outros campos)
        this.imageUrl = null; // Novo campo na classe
    }

    static fromJSON(data) {
        // ... (instanciação do objeto vehicle)
        // ...
        
        // Mapear a imagem vinda do banco
        if (data.imageUrl) {
            vehicle.imageUrl = data.imageUrl;
        }
        
        return vehicle;
    }
}