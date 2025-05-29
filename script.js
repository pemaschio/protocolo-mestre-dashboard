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
