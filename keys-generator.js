const crypto = require('crypto');
const fs = require('fs');

class KeyGenerator {
    constructor() {
        this.secretKey = "impulse_ai_pro_secret_2025_pirokan_ultimate_v4";
    }

    generateKeys(count = 10) {
        const keys = [];
        const today = new Date();
        
        console.log(`🔑 Генерация ${count} ключей...\n`);
        
        for (let i = 0; i < count; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i * 30); // Каждый ключ на 30 дней
            
            const keyData = `IMPULSE-${date.toISOString().slice(0, 10)}-${this.secretKey}-${i}-PRO`;
            const hash = crypto.createHash('sha256').update(keyData).digest('hex');
            
            const key = this.formatKey(hash.substring(0, 20).toUpperCase());
            const keyHash = crypto.createHash('sha256').update(key).digest('hex');
            
            keys.push({
                key: key,
                keyHash: keyHash,
                activationDate: date.toISOString().slice(0, 10),
                duration: "30 дней",
                index: i + 1
            });
        }
        
        return keys;
    }

    formatKey(key) {
        return key.match(/.{1,5}/g).join('-');
    }

    saveKeys(keys, filename = null) {
        if (!filename) {
            filename = `keys_impulse_ai_${Date.now()}.txt`;
        }
        
        const keyData = keys.map(k => 
            `Ключ ${k.index}: ${k.key}\nХэш: ${k.keyHash}\nАктивация: ${k.activationDate}\nДлительность: ${k.duration}\n${'-'.repeat(50)}`
        ).join('\n\n');
        
        const header = `IMPULSE AI - ЛИЦЕНЗИОННЫЕ КЛЮЧИ\nСгенерировано: ${new Date().toLocaleString()}\nВсего ключей: ${keys.length}\nСекрет: ${this.secretKey}\n\n`;
        
        fs.writeFileSync(filename, header + keyData, 'utf8');
        console.log(`💾 Ключи сохранены в файл: ${filename}`);
        
        // Показываем в консоли
        console.log('\n🎯 Сгенерированные ключи:');
        keys.forEach(k => {
            console.log(`\n🔑 Ключ ${k.index}: ${k.key}`);
            console.log(`   📅 Активен с: ${k.activationDate}`);
            console.log(`   ⏱️  Длительность: ${k.duration}`);
            console.log(`   🔐 Хэш: ${k.keyHash.substring(0, 16)}...`);
        });
        
        console.log(`\n📝 Всего сгенерировано: ${keys.length} ключей`);
    }
}

// Запуск генерации
if (require.main === module) {
    const generator = new KeyGenerator();
    const count = process.argv[2] || 5;
    const keys = generator.generateKeys(parseInt(count));
    generator.saveKeys(keys);
}

module.exports = KeyGenerator;
