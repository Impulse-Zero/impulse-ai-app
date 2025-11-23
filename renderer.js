const { ipcRenderer } = require('electron');

class App {
    constructor() {
        this.currentStyle = 'modern';
        this.init();
    }

    async init() {
        // Получаем версию приложения
        const version = await ipcRenderer.invoke('get-app-version');
        document.getElementById('appVersion').textContent = version;
        
        // Проверяем активацию
        const isActivated = await ipcRenderer.invoke('check-activation');
        
        if (!isActivated) {
            this.showAuth();
        } else {
            this.showMainApp();
        }

        this.initEventListeners();
    }

    showAuth() {
        document.getElementById('authOverlay').style.display = 'flex';
        document.getElementById('mainContent').style.display = 'none';
        
        // Фокус на поле ввода ключа
        setTimeout(() => {
            document.getElementById('keyInput').focus();
        }, 100);
    }

    showMainApp() {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('mainContent').style.display = 'flex';
    }

    initEventListeners() {
        // Активация
        document.getElementById('activateBtn').addEventListener('click', () => {
            this.activateApp();
        });

        document.getElementById('keyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.activateApp();
        });

        // Форматирование ключа при вводе
        document.getElementById('keyInput').addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
            if (value.length > 20) value = value.substring(0, 20);
            
            // Форматируем как XXXX-XXXX-XXXX-XXXX
            const formatted = value.replace(/(.{5})/g, '$1-').replace(/-$/, '');
            e.target.value = formatted;
        });

        // Стили генерации
        document.querySelectorAll('.style-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.style-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                e.target.classList.add('active');
                this.currentStyle = e.target.dataset.style;
            });
        });

        // Кнопка генерации
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateUsernames();
        });

        // Футер ссылки
        document.getElementById('checkUpdatesBtn').addEventListener('click', () => {
            ipcRenderer.invoke('check-updates');
        });

        document.getElementById('githubBtn').addEventListener('click', () => {
            ipcRenderer.invoke('open-github');
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.showResetConfirm();
        });
    }

    async activateApp() {
        const keyInput = document.getElementById('keyInput');
        const errorMessage = document.getElementById('errorMessage');
        const key = keyInput.value.trim().toUpperCase();

        if (key.length < 23) {
            errorMessage.textContent = 'Введите полный ключ активации';
            errorMessage.style.display = 'block';
            return;
        }

        const result = await ipcRenderer.invoke('activate-app', key);
        
        if (result) {
            this.showMainApp();
            errorMessage.style.display = 'none';
            this.showNotification('✅ Приложение успешно активировано!', 'success');
        } else {
            errorMessage.textContent = 'Неверный ключ активации';
            errorMessage.style.display = 'block';
            keyInput.value = '';
            keyInput.focus();
        }
    }

    async generateUsernames() {
        const loading = document.getElementById('loading');
        const resultsGrid = document.getElementById('resultsGrid');
        const generateBtn = document.getElementById('generateBtn');
        
        loading.style.display = 'block';
        resultsGrid.innerHTML = '';
        generateBtn.disabled = true;
        
        try {
            const result = await ipcRenderer.invoke('generate-usernames', this.currentStyle, 6);
            
            if (result.success) {
                this.displayResults(result.usernames);
            } else {
                this.showNotification('❌ Ошибка генерации: ' + result.error, 'error');
            }
        } catch (error) {
            this.showNotification('❌ Ошибка при генерации никнеймов', 'error');
        }
        
        loading.style.display = 'none';
        generateBtn.disabled = false;
    }

    displayResults(usernames) {
        const resultsGrid = document.getElementById('resultsGrid');
        resultsGrid.innerHTML = '';

        if (!usernames || usernames.length === 0) {
            resultsGrid.innerHTML = '<div style="text-align: center; color: #888; padding: 40px;">Не удалось сгенерировать никнеймы</div>';
            return;
        }

        usernames.forEach((username, index) => {
            const card = document.createElement('div');
            card.className = 'username-card';
            card.innerHTML = `
                <div class="username">@${username}</div>
                <div class="username-style">🎯 ИИ ${this.getStyleName(this.currentStyle)}</div>
            `;
            
            card.addEventListener('click', () => {
                this.copyToClipboard(username);
            });
            
            // Анимация появления
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                resultsGrid.appendChild(card);
                
                requestAnimationFrame(() => {
                    card.style.transition = 'all 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                });
            }, index * 100);
        });
    }

    getStyleName(style) {
        const styles = {
            'modern': 'Современный',
            'gaming': 'Игровой', 
            'elite': 'Элитный',
            'mystic': 'Мистический'
        };
        return styles[style] || 'Современный';
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('✅ Никнейм скопирован: ' + text);
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('✅ Никнейм скопирован: ' + text);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('copyNotification');
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = 'rgba(255, 68, 68, 0.9)';
        } else if (type === 'success') {
            notification.style.background = 'rgba(76, 175, 80, 0.9)';
        } else {
            notification.style.background = 'rgba(255, 0, 0, 0.9)';
        }
        
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
            notification.style.background = '';
        }, 3000);
    }

    showResetConfirm() {
        if (confirm('Вы уверены что хотите сбросить активацию? Приложение будет перезапущено.')) {
            ipcRenderer.invoke('reset-app');
        }
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
