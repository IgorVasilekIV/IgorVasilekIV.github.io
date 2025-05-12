// scripts/github-stats.js
async function loadGitHubStats() {
    try {
        const [userRes, reposRes] = await Promise.all([
            fetch('https://api.github.com/users/IgorVasilekIV'),
            fetch('https://api.github.com/users/IgorVasilekIV/repos')
        ]);
        
        if (!userRes.ok || !reposRes.ok) throw new Error('GitHub API error');
        
        const userData = await userRes.json();
        const reposData = await reposRes.json();
        
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
        console.error('Error:', error);
        document.getElementById('github-stats').innerHTML = `
            <p class="error">Ой а где статистика 🙈</p>
        `;
    }
}

window.addEventListener('DOMContentLoaded', loadGitHubStats);
