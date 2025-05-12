// github-stats.js
const CACHE_TIME = 10 * 60 * 1000; // 10 минут кэша

async function loadGitHubStats() {
    try {
        // Проверяем кэш
        const cachedData = localStorage.getItem('gh-stats');
        if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_TIME) {
                renderStats(data);
                return;
            }
        }

        // Делаем один запрос вместо двух
        const response = await fetch('https://api.github.com/users/IgorVasilekIV');
        
        // Обрабатываем лимиты API
        const remaining = response.headers.get('X-RateLimit-Remaining');
        if (remaining === '0') {
            throw new Error('API лимит исчерпан. Попробуйте позже.');
        }

        if (!response.ok) {
            throw new Error(`Ошибка ${response.status}`);
        }

        const userData = await response.json();
        
        // Используем данные из основного запроса
        const statsData = {
            repos: userData.public_repos,
            followers: userData.followers,
            stars: Math.floor(userData.public_repos * 1.2) // Примерная оценка
        };

        // Сохраняем в кэш
        localStorage.setItem('gh-stats', JSON.stringify({
            data: statsData,
            timestamp: Date.now()
        }));

        renderStats(statsData);

    } catch (error) {
        console.error('GitHub Stats Error:', error);
        showError(error.message);
        
        // Автоповтор через 5 секунд
        setTimeout(loadGitHubStats, 5000);
    }
}

function renderStats({ repos, followers, stars }) {
    document.getElementById('github-stats').innerHTML = `
        <div class="stat-item">
            <h3>Репозитории</h3>
            <p>${repos}</p>
        </div>
        <div class="stat-item">
            <h3>Подписчики</h3>
            <p>${followers}</p>
        </div>
        <div class="stat-item">
            <h3>Звёзды</h3>
            <p>≈${stars}</p>
        </div>
    `;
}

function showError(msg) {
    document.getElementById('github-stats').innerHTML = `
        <div class="error">
            <p>📡 Обновление статистики...</p>
            <small>${msg}</small>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', loadGitHubStats);
