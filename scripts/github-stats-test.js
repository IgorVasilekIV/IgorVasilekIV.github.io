async function loadGitHubStats() {
  try {
    const [userResponse, reposResponse] = await Promise.all([
      fetch('https://api.github.com/users/IgorVasilekIV'),
      fetch('https://api.github.com/users/IgorVasilekIV/repos')
    ]);
    
    const userData = await userResponse.json();
    const reposData = await reposResponse.json();
    
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
    console.error('Ошибка загрузки данных:', error);
  }
}

window.onload = loadGitHubStats;
