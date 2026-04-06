
import { supabase } from './render.js'; // или путь к файлу, где лежит конфиг Supabase

// --------------------------------------------------

// ФАЙЛ В КОТОРОМ ЛОГИКА ЛАЙКОВ И ТОП 3 СТАТЕЙ

window.likePost = async function () {
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










// 1. ФУНКЦИЯ ЗАГРУЗКИ КОММЕНТАРИЕВ
window.loadComments = async function () {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const list = document.getElementById('comments-list');

    // 1. ПОЛУЧАЕМ ТЕКУЩЕГО ЮЗЕРА (чтобы понять, чьи это комменты)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. ЗАГРУЖАЕМ КОММЕНТЫ
    const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

    if (error) return console.error("Ошибка загрузки комментов:", error);

    // Если комментов нет — выводим заглушку и выходим
    if (!comments || comments.length === 0) {
        list.innerHTML = '<p style="color: gray;">Пока никто не прокомментировал. Будьте первым!</p>';
        return;
    }

    // 3. ОТРИСОВКА (isOwner объявляем ВНУТРИ цикла .map)
    list.innerHTML = comments.map(c => {
        // Теперь браузер знает, что такое 'c' и 'user'
        const isOwner = user && user.id === c.user_id;

        return `
        <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 5px solid #007bff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <b style="color: #333;">${c.user_name || 'Аноним'}</b>
                <small style="color: #999;">
                    ${new Date(c.created_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </small>
            </div>
            <p style="margin: 0; color: #555; line-height: 1.5;">${c.content}</p>

            <!-- КНОПКА УДАЛЕНИЯ (появится только у автора) -->
            ${isOwner ? `
                <button onclick="deleteComment('${c.id}')" 
                    style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 18px;" 
                    title="Удалить">
                    🗑️
                </button>
            ` : ''}
        </div>
    `;
    }).join('');
};


// 2. ФУНКЦИЯ ОТПРАВКИ КОММЕНТАРИЯ
window.sendComment = async function () {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!text) return Swal.fire("Ошибка", "Напишите хотя бы пару слов!", "warning");

    // Проверяем авторизацию
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        openAuthModal()
    }

    const username = user.email.split('@')[0];

    try {
        const { error } = await supabase.from('comments').insert([{
            post_id: postId,
            user_id: user.id,
            user_name: username,
            content: text
        }]);

        if (error) throw error;

        input.value = ''; // Чистим поле
        loadComments(); // Обновляем список сразу
    } catch (err) {
        Swal.fire("Ошибка", err.message, "error");
    }
};





window.deleteComment = async function (commentId) {
    const result = await Swal.fire({
        title: 'Удалить комментарий?',
        text: "Это действие нельзя отменить!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#ccc',
        confirmButtonText: 'Да, удалить!',
        cancelButtonText: 'Отмена'
    });

    if (result.isConfirmed) {
        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            Swal.fire('Удалено!', 'Комментарий стерт.', 'success');
            loadComments(); // Обновляем список сразу
        } catch (err) {
            Swal.fire('Ошибка', err.message, 'error');
        }
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






