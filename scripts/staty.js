
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
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 2000,    // 5000 — это перебор, 2000 — идеально густо
                spread: 360,
                startVelocity: 1000,      // Взрыв во все стороны
                startVelocity: 40,      // Мощный толчок, чтобы разлетелись дальше
                origin: { x: 0.5, y: 0.4 }, // Чуть выше центра, чтобы летели дольше

                // ДОБАВЛЯЕМ ХАОС:
                drift: 0,               // Легкий "ветер" в сторону, чтобы круг ломался
                ticks: 400,             // Частицы живут дольше
                gravity: 0.5,           // Гравитация слабее — они ПАРЯТ, а не падают камнем
                scalar: 1.4,            // Крупные куски радуги

                // ВОТ ОНА, РАДУГА:
                colors: [
                    '#ff0000', // Красный
                    '#ff7f00', // Оранжевый
                    '#ffff00', // Желтый
                    '#00ff00', // Зеленый
                    '#0000ff', // Синий
                    '#4b0082', // Индиго
                    '#9400d3', // Фиолетовый
                    '#ffffff'  // Белый для блеска
                ],


            });


        }
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
        <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 30px; position: relative; box-shadow: 0 2px 5px rgb(235, 235, 235); border: 1px solid #bababa;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <b style="color: #333; font-family: Arial; font-size: 15px">${c.user_name || 'Аноним'}</b>
                <small style="color: #000000; margin: 0 auto; font-family: Arial">
                    ${new Date(c.created_at).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })}
                </small>
            </div>
            <p style="margin: 0; color: #000000; line-height: 1.5;">${c.content}</p>
            
            <!-- КНОПКА УДАЛЕНИЯ (появится только у автора) -->
            ${isOwner ? `
                <button onclick="deleteComment('${c.id}')" 
                    style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 18px; margin-right: auto" 
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
                
<span>💬 ${post.commentCount}</span>

            </div>
        </a>
    `).join('');
}

window.isClean = function (text) {
    if (!text) return true;

    // 1. ЖЕСТКИЕ КОРНИ (Ищем везде)
    const heavyRoots = ['хуй', 'хуя', 'хуе', 'пизд', 'еба', 'бля'];
    
    // 2. ОБЫЧНЫЕ ОСКОРБЛЕНИЯ (Ищем только как отдельные слова!)
    const badWords = ['дебил', 'дибил', 'пидор', 'лох', 'чмо', 'ублюдок', 'сука'];

    const lowerText = text.toLowerCase();
    
    // Проверка 1: Склейка (для мата)
    const compressed = lowerText.replace(/[^а-яёa-z]/g, '');
    
    // Исключение для латыни Hydrochoerus (чтобы не путать с "хуе")
    if (compressed.includes('hydrochoer')) {
        // Пропускаем проверку тяжелых корней для этого научного термена
    } else {
        if (heavyRoots.some(root => compressed.includes(root))) return false;
    }

    // Проверка 2: По словам (чтобы "лохматой" и "присущих" прошли)
    const words = lowerText.replace(/[^а-яёa-z\s]/g, ' ').split(/\s+/);
    
    const hasBadWord = words.some(word => {
        // Проверяем, не является ли всё слово целиком оскорблением
        return badWords.includes(word);
    });

    if (hasBadWord) return false;

    return true;
};





// export function handleSearch(event) {
//     const term = event.target.value.toLowerCase().trim();

//     // 1. Проверяем, есть ли данные для поиска
//     if (!window.allPostsData) {
//         console.warn("Данные еще не загружены!");
//         return;
//     }

//     // 2. Фильтруем массив по заголовку и тексту
//     const filtered = window.allPostsData.filter(post =>
//         post.title.toLowerCase().includes(term) ||
//         post.text.toLowerCase().includes(term)
//     );

//     // 3. Вызываем твою функцию отрисовки
//     if (typeof window.renderFilteredPosts === 'function') {
//         window.renderFilteredPosts(filtered, false);
//     }

//     // 4. Если пусто — пишем сообщение
//     const container = document.getElementById('articles-container');
//     if (filtered.length === 0 && container) {
//         container.innerHTML = `<p style="color: #00d4ff; text-align: center; padding: 20px;">Ничего не найдено... 🔍</p>`;
//     }
// }

// Делаем функцию доступной для HTML



// Функция самой фильтрации
// Функция поиска для iPosters
function runSearch() {
    const input = document.getElementById('searchInput');
    const grid = document.getElementById('dynamic-cards'); // Контейнер твоих карточек
    const loadMoreContainer = document.getElementById('load-more-container');

    if (!input || !grid) return;

    const term = input.value.toLowerCase().trim();
    console.log("🔍 Ищем на iPosters:", term);

    // Проверяем, загружены ли данные ( window.allPostsData )
    if (!window.allPostsData) {
        console.error("Данные еще не загружены в window.allPostsData");
        return;
    }

    // Фильтруем данные по заголовку и тексту
    const filtered = window.allPostsData.filter(post =>
        (post.title && post.title.toLowerCase().includes(term)) ||
        (post.text && post.text.toLowerCase().includes(term))
    );

    console.log("✅ Найдено статей:", filtered.length);

    // ШАГ 1: Вручную очищаем грид, чтобы старые статьи исчезли
    grid.innerHTML = '';

    // ШАГ 2: Вызываем отрисовку
    if (window.renderFilteredPosts) {
        // Передаем TRUE, чтобы функция НЕ обрезала список до 8 штук (displayedCount)
        window.renderFilteredPosts(filtered, true);

        // ШАГ 3: Скрываем кнопку "Показать еще", если мы в режиме поиска
        if (loadMoreContainer) {
            loadMoreContainer.style.display = term === "" ? "block" : "none";
        }
    }

    // Если ничего не нашли - выводим неоновую заглушку
    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #00d4ff;">
                <span style="font-size: 40px;">🛸</span>
                <p style="margin-top: 15px; text-shadow: 0 0 10px #00d4ff;">Космос пуст. По запросу "${term}" ничего не найдено.</p>
            </div>
        `;
    }
}

// Привязываем события после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchBtn');

    if (input) {
        input.addEventListener('input', runSearch); // Поиск при вводе
    }
    if (btn) {
        btn.addEventListener('click', runSearch); // Поиск при клике на кнопку
    }
});

