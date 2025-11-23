const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начало сборки Impulse AI...');

// Создаем папки если нужно
const folders = ['dist', 'assets'];
folders.forEach(folder => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
});

console.log('✅ Папки созданы');
console.log('📦 Сборка завершена! Запустите:');
console.log('   npm run build-all    - для сборки всех платформ');
console.log('   npm run build-windows - для Windows');
console.log('   npm run build-mac    - для macOS');
console.log('   npm run build-linux  - для Linux');
