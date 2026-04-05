
import { supabase } from './render.js'; // или путь к файлу, где лежит конфиг Supabase

// --------------------------------------------------

// ФАЙЛ В КОТОРОМ ЛОГИКА ЛАЙКОВ И ТОП 3 СТАТЕЙ

window.likePost = async function() {
    // 1. Получаем ID из URL
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    // Проверка: если ID нет, выходим из функции
    if (!id || id === "undefined") {
        console.error("ID статьи не найден в URL!");
        return;
    }

    try {
        // 2. Запрашиваем лайки (используем наш проверенный ID)
        const { data: article, error: getError } = await supabase
            .from('articles')
            .select('likes')
            .eq('id', id) // Здесь теперь точно будет UUID, а не undefined
            .single();

        if (getError) throw getError;

        const currentLikes = article.likes || 0;

        // 3. Обновляем
        const { error: updateError } = await supabase
            .from('articles')
            .update({ likes: currentLikes + 1 })
            .eq('id', id);

        if (updateError) throw updateError;

        // 4. Обновляем интерфейс
        const likesSpan = document.getElementById('artLikes');
        if (likesSpan) {
            likesSpan.innerText = currentLikes + 1;
        }

    } catch (err) {
        console.error("Ошибка при лайке:", err.message);
    }
};



// СНАЧАЛА МЫ ПОСЫЛАЕМ ДАННЫЕ НА СЕРВЕР РЕНДЕР, 
// ОН ПОСЫЛЕТ ИХ В РЕПО ГИТХАБ С ПОМОЩЬЮ ТОКЕНА ГИТХАБ, 
// А ПОТОМ МЫ ЗАПРАШИВАЕМ ДАННЫЕ ИЗ ФАЙЛА

// ------------------------------------------------------------




// ФУНКЦИЯ КОТОРАЯ СОЗДАЕТ ТОП 3 САМЫХ ЛУЧШИХ СТАТЬИ НА ГЛАВНОЙ

export function renderTrending(posts) {
    const trendingList = document.getElementById('trending-list');
    if (!trendingList) return;

    // Сортируем по лайкам и берем первые 3
    const topPosts = [...posts]
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 3);

    trendingList.innerHTML = topPosts.map((post, index) => `
        <a href="article.html?id=${post.id}" class="trending-item">
            <div class="trending-info">
                <span class="trending-title">${index === 0 ? '👑 ' : ''}${post.title}</span>
                <span class="trending-likes">❤️ ${post.likes || 0}</span>
            </div>
        </a>
    `).join('');
}






