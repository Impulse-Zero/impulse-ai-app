class AIModel {
    constructor() {
        this.usedNames = new Set();
        this.initializePatterns();
    }

    initializePatterns() {
        this.patterns = {
            modern: {
                prefixes: ['Quantum', 'Cyber', 'Neo', 'Digital', 'Virtual', 'Synth', 'Tech', 'Data', 'Net', 'Code', 'Byte', 'Pixel', 'AI', 'Meta'],
                suffixes: ['Flux', 'Pulse', 'Wave', 'Core', 'Net', 'Bit', 'Code', 'Drive', 'Shift', 'Glitch', 'Spark', 'Flow', 'Sync', 'Edge'],
                connectors: ['', '', '', 'X', 'Z', 'V', 'Prime', 'Mark']
            },
            gaming: {
                prefixes: ['Shadow', 'Dark', 'Blood', 'Soul', 'Dragon', 'Phoenix', 'Wolf', 'Steel', 'Iron', 'Ghost', 'Night', 'Death', 'Chaos', 'Doom'],
                suffixes: ['Slayer', 'Hunter', 'Reaper', 'Master', 'Lord', 'King', 'Blade', 'Fury', 'Storm', 'Fire', 'Rage', 'Breaker', 'Crusher', 'Killer'],
                connectors: ['', '', 'Of', 'The', 'X', 'Z']
            },
            elite: {
                prefixes: ['Imperial', 'Royal', 'Noble', 'Elite', 'Supreme', 'Ultimate', 'Absolute', 'Divine', 'Perfect', 'Alpha', 'Prime', 'Gold', 'Platinum', 'Diamond'],
                suffixes: ['King', 'Emperor', 'Lord', 'Master', 'Ruler', 'Prince', 'Duke', 'Baron', 'Chief', 'Leader', 'God', 'Titan', 'Legend', 'Myth'],
                connectors: ['', 'The', 'OfThe', 'X', 'Pro', 'Max']
            },
            mystic: {
                prefixes: ['Mystic', 'Ancient', 'Arcane', 'Spirit', 'Crystal', 'Moon', 'Star', 'Shadow', 'Dark', 'Eternal', 'Infinite', 'Cosmic', 'Celestial', 'Divine'],
                suffixes: ['Seer', 'Mage', 'Wizard', 'Oracle', 'Walker', 'Caller', 'Binder', 'Weaver', 'Shaman', 'Warlock', 'Sorcerer', 'Prophet', 'Sage', 'Witch'],
                connectors: ['', 'The', 'Of', '']
            }
        };
    }

    async generateUsername(style) {
        const pattern = this.patterns[style] || this.patterns.modern;
        let attempts = 0;
        const maxAttempts = 50;

        while (attempts < maxAttempts) {
            const username = this.generateName(pattern);
            
            if (!this.usedNames.has(username.toLowerCase())) {
                this.usedNames.add(username.toLowerCase());
                return username;
            }
            
            attempts++;
        }

        // Если все имена использованы, добавляем число
        const baseName = this.generateName(pattern);
        return baseName + Math.floor(Math.random() * 999);
    }

    generateName(pattern) {
        const prefix = this.selectWeighted(pattern.prefixes);
        const suffix = this.selectWeighted(pattern.suffixes);
        const connector = this.selectWeighted(pattern.connectors);
        
        let name = prefix;
        
        if (connector) {
            if (connector === 'OfThe' || connector === 'Of') {
                name += connector + suffix;
            } else {
                name += connector + suffix;
            }
        } else {
            name += suffix;
        }
        
        // Применяем ИИ-вариации
        return this.applyAIVariations(name);
    }

    selectWeighted(array) {
        // Вес уменьшается с каждым элементом для разнообразия
        const weights = array.map((_, index) => 1 / (index + 1));
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        for (let i = 0; i < array.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return array[i];
            }
        }
        
        return array[0];
    }

    applyAIVariations(name) {
        const variations = [name];
        
        // Случайный регистр для стиля
        if (Math.random() > 0.7) {
            variations.push(this.randomCase(name));
        }
        
        // Добавляем специальные символы
        if (Math.random() > 0.8) {
            variations.push(name + '_');
            variations.push('X' + name);
        }
        
        // Цифровые суффиксы
        const numbers = [7, 13, 21, 42, 69, 77, 99, 123, 256, 420, 777];
        if (Math.random() > 0.5) {
            variations.push(name + this.selectWeighted(numbers));
        }
        
        // Выбираем лучшую вариацию
        return this.selectWeighted(variations);
    }

    randomCase(str) {
        return str.split('').map(char => 
            Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
        ).join('');
    }

    // Очистка использованных имен (на случай если нужно сбросить)
    clearUsedNames() {
        this.usedNames.clear();
    }
}

module.exports = AIModel;
