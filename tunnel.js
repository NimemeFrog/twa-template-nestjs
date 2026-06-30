const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Регулярное выражение для поиска URL localhost.run
const urlRegex = /(https:\/\/[a-zA-Z0-9-]+\.lhr\.life)/;

// Пути к вашим проектам (измените, если папки называются иначе)
const FRONTEND_DIR = path.join(__dirname, 'client');
const BACKEND_DIR = path.join(__dirname, 'server');

let frontendUrl = null;
let backendUrl = null;

// Вспомогательная функция для безопасного обновления или добавления переменной
function safeUpdateEnv(filePath, key, value) {
    let content = '';
    
    // 1. Если файл существует, читаем его содержимое
    if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, 'utf-8');
    }

    // Регулярное выражение для поиска строки, начинающейся с ключа (например, VITE_API_URL=...)
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;

    if (content.match(regex)) {
        // 2. Если переменная найдена, аккуратно заменяем только эту строку
        content = content.replace(regex, newLine);
    } else {
        // 3. Если переменной нет, добавляем её в самый конец файла
        if (content && !content.endsWith('\n')) {
            content += '\n'; // Добавляем перенос строки, если файл не пустой и заканчивается не им
        }
        content += newLine + '\n';
    }

    // 4. Сохраняем файл со всеми старыми переменными + обновленной новой
    fs.writeFileSync(filePath, content, 'utf-8');
}

function updateEnvFiles() {
    if (!frontendUrl || !backendUrl) return;

    console.log('\n=========================================');
    console.log(`✅ Оба туннеля активны!`);
    console.log(`🚀 Frontend URL: ${frontendUrl}`);
    console.log(`⚙️  Backend URL: ${backendUrl}`);
    console.log('=========================================\n');

    // Безопасное обновление фронтенда
    if (!fs.existsSync(FRONTEND_DIR)) {
        console.error(`❌ Ошибка: Папка ${FRONTEND_DIR} не найдена! Укажите правильный путь.`);
    } else {
        const frontendEnvPath = path.join(FRONTEND_DIR, '.env');
        safeUpdateEnv(frontendEnvPath, 'VITE_API_URL', `${backendUrl}/api`);
        console.log(`[Vite] Файл ${frontendEnvPath} безопасно обновлен.`);
    }

    // Безопасное обновление бекенда
    if (!fs.existsSync(BACKEND_DIR)) {
        console.error(`❌ Ошибка: Папка ${BACKEND_DIR} не найдена! Укажите правильный путь.`);
    } else {
        const backendEnvPath = path.join(BACKEND_DIR, '.env');
        safeUpdateEnv(backendEnvPath, 'FRONTEND_URL', frontendUrl);
        console.log(`[NestJS] Файл ${backendEnvPath} безопасно обновлен.`);
    }
}

// Функция запуска туннеля
function startTunnel(port, name, onUrlFound) {
    console.log(`[${name}] Запуск туннеля для порта ${port}...`);
    
    // Запускаем ssh команду как дочерний процесс
    const tunnel = spawn('ssh', ['-R', `80:localhost:${port}`, 'nokey@localhost.run']);

    // Обработчик вывода (парсим текст)
    const handleOutput = (data) => {
        const text = data.toString();
        const match = text.match(urlRegex);
        
        if (match && match[1]) {
            const newUrl = match[1];
            onUrlFound(newUrl);
        }
    };

    // Слушаем оба потока, так как ssh может писать баннер в stderr
    tunnel.stdout.on('data', handleOutput);
    tunnel.stderr.on('data', handleOutput);

    tunnel.on('close', (code) => {
        console.log(`[${name}] Туннель закрылся с кодом ${code}. Попробуйте перезапустить скрипт.`);
    });
}

// Запускаем оба туннеля
startTunnel(5173, 'Frontend', (url) => {
    if (frontendUrl !== url) {
        frontendUrl = url;
        updateEnvFiles();
    }
});

startTunnel(3000, 'Backend', (url) => {
    if (backendUrl !== url) {
        backendUrl = url;
        updateEnvFiles();
    }
});