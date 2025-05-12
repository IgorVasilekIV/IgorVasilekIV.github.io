// Добавляем обработку лимитов GitHub API
const GITHUB_TOKEN = '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';
const CACHE_TIME = 5 * 60 * 1000;

async function fetchGitHub(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'IgorVasilekIV-monke-bio'
            }
        });

        if (response.status === 403) {
            throw new Error('API rate limit exceeded');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

async function loadGitHubStats() {
    try {
        const [userData, reposData] = await Promise.all([
            fetchGitHub('https://api.github.com/users/IgorVasilekIV'),
            fetchGitHub('https://api.github.com/users/IgorVasilekIV/repos')
        ]);

        const stars = reposData.reduce((acc, repo) => acc + repo.stargazers_count, 0);
        
        document.getElementById('github-stats').innerHTML = `
            <div class="stat-item">
                <h3>Репозитории</h3>
                <p>${userData.public_repos}</p>
            </div>
            <div class="stat-item">
                <h3>Подписчики</h3>
                <p>${userData.followers}</p>
            </div>
            <div class="stat-item">
                <h3>Звёзды</h3>
                <p>${stars}</p>
            </div>
        `;
    } catch (error) {
        console.error('GitHub Stats Error:', error);
        document.getElementById('github-stats').innerHTML = `
            <div class="error">
                <p>Статистика временно недоступна 🐵</p>
                <small>${error.message}</small>
            </div>
        `;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', loadGitHubStats);
