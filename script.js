// Variáveis globais para dados do usuário
let userData = null;
let userMissions = [];

// Função para carregar dados do usuário logado
async function loadUserData() {
    try {
        // Obter o usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('Usuário não autenticado');
            window.location.href = 'login.html';
            return;
        }
        
        // Buscar dados do usuário no banco
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', user.email)
            .single();
        
        if (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            return;
        }
        
        if (!data) {
            console.error('Usuário não encontrado no banco de dados');
            return;
        }
        
        // Armazenar dados do usuário
        userData = data;
        
        // Atualizar interface com dados do usuário
        updateUserInterface();
        
        // Carregar missões do usuário
        await loadUserMissions();
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

// Função para carregar missões do usuário
async function loadUserMissions() {
    try {
        // Buscar missões do usuário
        const { data, error } = await supabase
            .from('missoes')
            .select('*')
            .eq('usuario_id', userData.id)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Erro ao carregar missões:', error);
            return;
        }
        
        // Armazenar missões do usuário
        userMissions = data || [];
        
        // Atualizar interface com missões
        updateMissionsInterface();
        
    } catch (error) {
        console.error('Erro ao carregar missões:', error);
    }
}

// Função para atualizar a interface com dados do usuário
function updateUserInterface() {
    if (!userData) return;
    
    // Atualizar nome do usuário
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = userData.nome;
    });
    
    // Atualizar nível
    const userLevelElements = document.querySelectorAll('.user-level');
    userLevelElements.forEach(el => {
        el.textContent = `Nível ${userData.nivel}`;
    });
    
    // Atualizar XP
    const userXpElements = document.querySelectorAll('.user-xp');
    userXpElements.forEach(el => {
        el.textContent = `${userData.xp_total} XP`;
    });
    
    // Atualizar elementos
    document.querySelector('.element-fire .element-value').textContent = userData.elemento_fogo;
    document.querySelector('.element-earth .element-value').textContent = userData.elemento_terra;
    document.querySelector('.element-water .element-value').textContent = userData.elemento_agua;
    document.querySelector('.element-air .element-value').textContent = userData.elemento_ar;
    
    // Atualizar etapa atual na jornada
    updateJourneyProgress(userData.etapa_atual);
}

// Função para atualizar o progresso na jornada
function updateJourneyProgress(currentStep) {
    const journeySteps = document.querySelectorAll('.journey-step');
    
    journeySteps.forEach((step, index) => {
        // Índice começa em 0, mas etapas começam em 1
        const stepNumber = index + 1;
        
        if (stepNumber < currentStep) {
            // Etapas anteriores: completadas
            step.classList.remove('in-progress', 'locked');
            step.classList.add('completed');
            step.querySelector('.step-details i').className = 'fas fa-check-circle';
            step.querySelector('.step-status').textContent = 'Completo';
        } else if (stepNumber === currentStep) {
            // Etapa atual: em progresso
            step.classList.remove('completed', 'locked');
            step.classList.add('in-progress');
            step.querySelector('.step-details i').className = 'fas fa-spinner fa-pulse';
            step.querySelector('.step-status').textContent = 'Em Progresso';
        } else {
            // Etapas futuras: bloqueadas
            step.classList.remove('completed', 'in-progress');
            step.classList.add('locked');
            step.querySelector('.step-details i').className = 'fas fa-lock';
            step.querySelector('.step-status').textContent = 'Bloqueado';
        }
    });
}

// Função para atualizar a interface com missões do usuário
function updateMissionsInterface() {
    const missionsContainer = document.querySelector('.missions-list');
    
    if (!missionsContainer || !userMissions.length) {
        return;
    }
    
    // Limpar conteúdo atual
    missionsContainer.innerHTML = '';
    
    // Adicionar cada missão
    userMissions.forEach(mission => {
        const missionElement = document.createElement('div');
        missionElement.className = `mission-item ${mission.status}`;
        
        // Determinar ícone com base no elemento
        let elementIcon = 'fa-fire';
        if (mission.elemento === 'terra') elementIcon = 'fa-mountain';
        if (mission.elemento === 'agua') elementIcon = 'fa-water';
        if (mission.elemento === 'ar') elementIcon = 'fa-wind';
        
        missionElement.innerHTML = `
            <div class="mission-icon">
                <i class="fas ${elementIcon}"></i>
            </div>
            <div class="mission-content">
                <h3>${mission.titulo}</h3>
                <p>${mission.descricao}</p>
                <div class="mission-footer">
                    <span class="mission-xp">${mission.xp_valor} XP</span>
                    <span class="mission-element">${mission.elemento}</span>
                </div>
            </div>
            <div class="mission-status">
                ${mission.status === 'pendente' ? 
                    '<button class="complete-mission" data-id="' + mission.id + '">Completar</button>' : 
                    '<i class="fas fa-check-circle"></i>'}
            </div>
        `;
        
        // Adicionar ao container
        missionsContainer.appendChild(missionElement);
    });
    
    // Adicionar event listeners para botões de completar missão
    document.querySelectorAll('.complete-mission').forEach(button => {
        button.addEventListener('click', async (e) => {
            const missionId = e.target.getAttribute('data-id');
            await completeMission(missionId);
        });
    });
}

// Função para completar uma missão
async function completeMission(missionId) {
    try {
        // Buscar a missão
        const mission = userMissions.find(m => m.id === missionId);
        
        if (!mission) {
            console.error('Missão não encontrada');
            return;
        }
        
        // Atualizar status da missão
        const { error: missionError } = await supabase
            .from('missoes')
            .update({ status: 'completa' })
            .eq('id', missionId);
        
        if (missionError) {
            console.error('Erro ao atualizar missão:', missionError);
            return;
        }
        
        // Atualizar XP e elemento do usuário
        const elementField = `elemento_${mission.elemento}`;
        const updates = {
            xp_total: userData.xp_total + mission.xp_valor
        };
        
        // Incrementar o elemento específico
        updates[elementField] = userData[elementField] + mission.xp_valor;
        
        // Verificar se deve subir de nível (a cada 100 XP)
        const newTotalXP = userData.xp_total + mission.xp_valor;
        const currentLevel = Math.floor(userData.xp_total / 100) + 1;
        const newLevel = Math.floor(newTotalXP / 100) + 1;
        
        if (newLevel > currentLevel) {
            updates.nivel = newLevel;
        }
        
        // Atualizar usuário no banco
        const { error: userError } = await supabase
            .from('usuarios')
            .update(updates)
            .eq('id', userData.id);
        
        if (userError) {
            console.error('Erro ao atualizar usuário:', userError);
            return;
        }
        
        // Recarregar dados do usuário
        await loadUserData();
        
    } catch (error) {
        console.error('Erro ao completar missão:', error);
    }
}

// Função para fazer logout
function logout() {
    supabase.auth.signOut().then(() => {
        window.location.href = 'login.html';
    });
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    
    // Adicionar event listener para botão de logout (se existir)
    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});
// Script para o Dashboard do Protocolo Mestre

document.addEventListener('DOMContentLoaded', function() {
    // Simulação de dados para os gráficos
    // Em uma implementação real, estes dados viriam da API do n8n
    
    // Funções para interatividade básica
    setupJourneySteps();
    setupMissionButtons();
    
    // Animações sutis para melhorar a experiência do usuário
    addHoverEffects();
});

// Configuração dos passos da jornada
function setupJourneySteps() {
    const journeySteps = document.querySelectorAll('.journey-step');
    
    journeySteps.forEach(step => {
        step.addEventListener('click', function() {
            // Em uma implementação real, isto abriria um modal com detalhes
            console.log('Detalhes do passo: ' + this.querySelector('h3').textContent);
            
            // Simulação visual de seleção
            journeySteps.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Configuração dos botões de missão
function setupMissionButtons() {
    const missionButtons = document.querySelectorAll('.btn-start');
    
    missionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const missionCard = this.closest('.mission-card');
            const missionTitle = missionCard.querySelector('h3').textContent;
            
            // Em uma implementação real, isto iniciaria a missão via API
            console.log('Iniciando missão: ' + missionTitle);
            
            // Feedback visual
            this.textContent = 'Em andamento...';
            this.classList.add('in-progress');
            
            // Simulação de conclusão após 3 segundos
            setTimeout(() => {
                this.textContent = 'Concluído';
                this.classList.remove('in-progress');
                this.classList.add('completed');
                this.disabled = true;
            }, 3000);
        });
    });
}

// Adiciona efeitos de hover para melhorar a experiência
function addHoverEffects() {
    // Efeito de brilho sutil nos elementos
    const elements = document.querySelectorAll('.element');
    
    elements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 0 15px rgba(233, 196, 106, 0.3)';
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.boxShadow = 'none';
        });
    });
    
    // Efeito nos badges
    const badges = document.querySelectorAll('.badge.earned');
    
    badges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            icon.style.transform = 'scale(1.2)';
            icon.style.transition = 'transform 0.3s ease';
        });
        
        badge.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            icon.style.transform = 'scale(1)';
        });
    });
}

// Em uma implementação real, aqui teríamos funções para:
// 1. Comunicação com a API do n8n
// 2. Atualização de dados em tempo real
// 3. Renderização de gráficos usando bibliotecas como Chart.js
// 4. Integração com o WhatsApp para comunicação com o Velho Sábio
