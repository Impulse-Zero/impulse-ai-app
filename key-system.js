const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class KeySystem {
    constructor() {
        this.activationFile = path.join(__dirname, 'activation.dat');
        this.ensureActivationFile();
    }

    ensureActivationFile() {
        if (!fs.existsSync(this.activationFile)) {
            fs.writeFileSync(this.activationFile, JSON.stringify({ 
                activated: false,
                firstRun: true 
            }));
        }
    }

    validateKey(inputKey) {
        // Проверяем формат ключа
        const keyRegex = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
        if (!keyRegex.test(inputKey)) {
            return false;
        }

        // Создаем хэш ключа для проверки
        const keyHash = crypto.createHash('sha256').update(inputKey).digest('hex');
        
        // Список валидных хэшей ключей
        const validKeyHashes = [
            'a1b2c3d4e5f6789012345678901234567890123456789012345678901234',
        ];

        // Также проверяем по алгоритму генерации
        const isValidFormat = this.checkKeyAlgorithm(inputKey);
        
        return validKeyHashes.includes(keyHash) || isValidFormat;
    }

    checkKeyAlgorithm(key) {
        // Алгоритм проверки ключа
        const cleanKey = key.replace(/-/g, '');
        let sum = 0;
        
        for (let i = 0; i < cleanKey.length; i++) {
            const charCode = cleanKey.charCodeAt(i);
            sum += charCode;
        }
        
        // Проверяем контрольную сумму
        return sum % 7 === 0;
    }

    setActivated(key) {
        const activationData = {
            activated: true,
            key: key,
            keyHash: crypto.createHash('sha256').update(key).digest('hex'),
            timestamp: Date.now(),
            activationDate: new Date().toISOString(),
            machineId: this.getMachineId()
        };
        
        fs.writeFileSync(this.activationFile, JSON.stringify(activationData, null, 2));
    }

    isActivated() {
        try {
            const data = JSON.parse(fs.readFileSync(this.activationFile, 'utf8'));
            
            if (!data.activated) {
                return false;
            }

            // Проверяем срок действия (30 дней)
            if (data.timestamp) {
                const thirtyDays = 30 * 24 * 60 * 60 * 1000;
                const isExpired = Date.now() - data.timestamp > thirtyDays;
                
                if (isExpired) {
                    this.clearActivation();
                    return false;
                }
            }

            // Дополнительная проверка машины
            if (data.machineId && data.machineId !== this.getMachineId()) {
                this.clearActivation();
                return false;
            }
            
            return true;
        } catch (error) {
            return false;
        }
    }

    getMachineId() {
        try {
            const interfaces = require('os').networkInterfaces();
            let mac = '';
            
            // ИСПРАВЛЕННАЯ СТРОКА - убрал 'const interface'
            for (const name in interfaces) {
                for (const netInterface of interfaces[name]) {
                    if (!netInterface.internal && netInterface.mac) {
                        mac = netInterface.mac;
                        break;
                    }
                }
                if (mac) break;
            }
            
            return crypto.createHash('md5').update(mac).digest('hex');
        } catch (error) {
            return 'default-machine-id';
        }
    }

    clearActivation() {
        fs.writeFileSync(this.activationFile, JSON.stringify({ 
            activated: false,
            resetDate: new Date().toISOString()
        }));
    }
}

module.exports = KeySystem;
