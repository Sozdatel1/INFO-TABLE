function updateHubStats(posts) {
    const postsCount = document.getElementById('stat-posts');
    const likesCount = document.getElementById('stat-likes');


    if (!postsCount || !likesCount) return;

    // 1. Считаем общее количество статей
    postsCount.innerText = posts.length;

    // 2. Считаем сумму всех лайков из массива
    const totalLikes = posts.reduce((sum, post) => sum + (post.likes || 0), 0);
    likesCount.innerText = totalLikes;

    // 3. Для просмотров (пока у тебя нет бэкенда для них, сделаем красивый рандом 

}
