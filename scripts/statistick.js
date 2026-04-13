function updateHubStats(posts) {
    const postsCount = document.getElementById('stat-posts');
    const likesCount = document.getElementById('stat-likes');
    const viewsCount = document.getElementById('stat-views'); // Добавили для просмотров

    // Если хотя бы одного элемента нет — просто выходим из функции и не ломаем код
    if (!postsCount || !likesCount) return;

    // Считаем общее количество статей
    postsCount.innerText = posts.length;

    // Считаем сумму всех лайков
    const totalLikes = posts.reduce((sum, post) => sum + (post.real_likes || 0), 0);
    likesCount.innerText = totalLikes;

    // Считаем сумму всех просмотров (если есть элемент для них)
    if (viewsCount) {
        const totalViews = posts.reduce((sum, post) => sum + (post.viewCount || 0), 0);
        viewsCount.innerText = totalViews;
    }
}
