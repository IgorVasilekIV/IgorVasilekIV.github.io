// github-stats.js
const CACHE_TIME = 15 * 60 * 1000; // 15 минут кэша

async function fetchReposWithRetry(username, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
            
            // Проверяем лимиты API
            const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
            if (remaining < 5) {
                console.warn('API лимит на исходе');
                return null;
            }

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

async function loadGitHubStats() {
    try {
        const cached = localStorage.getItem('gh-stats');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_TIME) {
                renderStats(data);
                return;
            }
        }

        // Получаем базовые данные пользователя
        const userRes = await fetch('https://api.github.com/users/IgorVasilekIV');
        if (!userRes.ok) throw new Error(`Ошибка ${userRes.status}`);
        const userData = await userRes.json();

        // Получаем репозитории с повтором запросов
        const repos = await fetchReposWithRetry('IgorVasilekIV');
        if (!repos) {
            renderStats(userData); // Показываем базовые данные
            return;
        }

        // Считаем реальные звёзды
        const stars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

        const stats = {
            repos: userData.public_repos,
            followers: userData.followers,
            stars: stars
        };

        localStorage.setItem('gh-stats', JSON.stringify({
            data: stats,
            timestamp: Date.now()
        }));

        renderStats(stats);

    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('github-stats').innerHTML = `
            <div class="error">
                <p>📡 Данные обновляются...</p>
                <small>${error.message.includes('403') ? 'Лимит API' : error.message}</small>
            </div>
        `;
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
            <p>${stars}</p>
        </div>
    `;
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', loadGitHubStats);
