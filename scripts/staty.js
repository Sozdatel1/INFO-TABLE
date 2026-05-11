
import { supabase } from './render.js'; // или путь к файлу, где лежит конфиг Supabase

// --------------------------------------------------

// ФАЙЛ В КОТОРОМ ЛОГИКА ЛАЙКОВ И ТОП 3 СТАТЕЙ

// window.likePost = async function () {
//     // 1. Получаем ID из URL
//     const params = new URLSearchParams(window.location.search);
//     const id = params.get('id');

//     // Проверка: если ID нет, выходим из функции
//     if (!id || id === "undefined") {
//         console.error("ID статьи не найден в URL!");
//         return;
//     }

//     try {
//         if (typeof confetti === 'function') {
//             confetti({
//                 particleCount: 2000,    // 5000 — это перебор, 2000 — идеально густо
//                 spread: 360,
//                 startVelocity: 1000,      // Взрыв во все стороны
//                 startVelocity: 40,      // Мощный толчок, чтобы разлетелись дальше
//                 origin: { x: 0.5, y: 0.4 }, // Чуть выше центра, чтобы летели дольше

//                 // ДОБАВЛЯЕМ ХАОС:
//                 drift: 0,               // Легкий "ветер" в сторону, чтобы круг ломался
//                 ticks: 400,             // Частицы живут дольше
//                 gravity: 0.5,           // Гравитация слабее — они ПАРЯТ, а не падают камнем
//                 scalar: 1.4,            // Крупные куски радуги

//                 // ВОТ ОНА, РАДУГА:
//                 colors: [
//                     '#ff0000', // Красный
//                     '#ff7f00', // Оранжевый
//                     '#ffff00', // Желтый
//                     '#00ff00', // Зеленый
//                     '#0000ff', // Синий
//                     '#4b0082', // Индиго
//                     '#9400d3', // Фиолетовый
//                     '#ffffff'  // Белый для блеска
//                 ],


//             });


//         }
//         // 2. Запрашиваем лайки (используем наш проверенный ID)
//         const { data: article, error: getError } = await supabase
//             .from('articles')
//             .select('likes')
//             .eq('id', id) // Здесь теперь точно будет UUID, а не undefined
//             .single();

//         if (getError) throw getError;

//         const currentLikes = article.likes || 0;

//         // 3. Обновляем
//         const { error: updateError } = await supabase
//             .from('articles')
//             .update({ likes: currentLikes + 1 })
//             .eq('id', id);

//         if (updateError) throw updateError;

//         // 4. Обновляем интерфейс
//         const likesSpan = document.getElementById('artLikes');
//         if (likesSpan) {
//             likesSpan.innerText = currentLikes + 1;
//         }

//     } catch (err) {
//         console.error("Ошибка при лайке:", err.message);
//     }
// };

window.likePost = async function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // 1. Быстрая проверка для анонимов через localStorage
        if (!user) {
            const myLikes = JSON.parse(localStorage.getItem('my_likes') || '[]');
            if (myLikes.includes(id)) {
                return Swal.fire("Упс!", "Вы уже поставили лайк этому посту", "info");
            }
        }

        // 2. Запрос на сервер
        const response = await fetch('https://pro-info-api.onrender.com/api/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': session ? `Bearer ${session.access_token}` : ''
            },
            body: JSON.stringify({ postId: id })
        });

        const result = await response.json();

        if (response.ok) {
            // --- ПРАЗДНИК ТОЛЬКО ПРИ УСПЕХЕ ---
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.7 },
                    colors: ['#00d9ff', '#ffffff', '#a67358']
                });
            }

            // Обновляем число на странице
            const likesSpan = document.getElementById('artLikes');
            if (likesSpan) likesSpan.innerText = result.count;

            // Записываем анониму в локалку
            if (!user) {
                const myLikes = JSON.parse(localStorage.getItem('my_likes') || '[]');
                myLikes.push(id);
                localStorage.setItem('my_likes', JSON.stringify(myLikes));
            }
        } else if (result.error === "already_liked") {
            // Если сервер вернул, что лайк уже есть (для зареганных)
            Swal.fire("Упс!", "Вы уже поставили лайк этому посту", "info");
        }

    } catch (err) {
        console.error("Like error:", err);
    }
};






window.loadComments = async function () {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');
    const list = document.getElementById('comments-list');
    if (!list || !postId) return;

    try {
        // 1. Параллельно берем комменты с сервера и текущего юзера из Supabase Auth
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // const [commentsRes, authRes] = await Promise.all([
        //     fetch(`https://pro-info-api.onrender.com/api/comments/${postId}`),
        //     supabase.auth.getSession()
        // ]);
        const commentsRes = await fetch(`https://pro-info-api.onrender.com/api/comments/${postId}`);
        const comments = await commentsRes.json();




        if (!comments || comments.length === 0) {
            list.innerHTML = '<p style="color: gray;">Пока никто не прокомментировал. Будьте первым!</p>';
            return;
        }

        // 2. ОТРИСОВКА
        list.innerHTML = comments.map(c => {
            const isOwner = user && user.id === c.user_id;

            return `
            <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 30px; position: relative; box-shadow: 0 2px 5px rgb(235, 235, 235); border: 1px solid #bababa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <b style="color: #333; font-family: Arial; font-size: 15px">${c.user_name || 'Аноним'}</b>
                    <small style="color: #000000; margin: 0 auto; font-family: Arial">
                        ${new Date(c.created_at).toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
            })}
                    </small>
                </div>
                <p style="margin: 0; color: #000000; line-height: 1.5;">${c.content}</p>
                
                ${isOwner ? `
                    <button onclick="deleteComment('${c.id}')" 
                        style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 18px;" 
                        title="Удалить">🗑️</button>
                ` : ''}
            </div>`;
        }).join('');

    } catch (err) {
        console.error("Ошибка загрузки комментов:", err.message);
    }
};




// <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 30px; position: relative; box-shadow: 0 2px 5px rgb(235, 235, 235); border: 1px solid #bababa;">
//     <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
//         <b style="color: #333; font-family: Arial; font-size: 15px">${c.user_name || 'Аноним'}</b>
//         <small style="color: #000000; margin: 0 auto; font-family: Arial">
//             ${new Date(c.created_at).toLocaleString('ru-RU', {
//     day: '2-digit',
//     month: '2-digit',
//     hour: '2-digit',
//     minute: '2-digit'
// })}
//         </small>
//     </div>
//     <p style="margin: 0; color: #000000; line-height: 1.5;">${c.content}</p>

//     <!-- КНОПКА УДАЛЕНИЯ (появится только у автора) -->
//     ${isOwner ? `
//         <button onclick="deleteComment('${c.id}')" 
//             style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 18px; margin-right: auto" 
//             title="Удалить">
//             🗑️
//         </button>
//     ` : ''}
// </div>



// 2. ФУНКЦИЯ ОТПРАВКИ КОММЕНТАРИЯ
window.sendComment = async function () {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!text) return Swal.fire("Ошибка", "Напишите хотя бы пару слов!", "warning");

    // Берем сессию, чтобы получить токен доступа (JWT)
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return openAuthModal();

    try {
        const response = await fetch(`https://pro-info-api.onrender.com/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}` // Отправляем токен для проверки
            },
            body: JSON.stringify({ postId, text })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        input.value = '';
        loadComments(); // Перезагружаем список
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

window.openCreateModal = async function() {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    const ak = user.email.split('@')[0];
    await Swal.fire({
        title: `Напишите статью, ${ak}!`,
        // Вставляем твою верстку прямо сюда
        width: '1000px',
        html: `
        <div class="glass-card admin-zone" style="height: auto; border: none; box-shadow: none; background: transparent; padding: 0;">
            <input type="text" id="postImage" placeholder="Ссылка на картинку статьи (URL)..." style="width: 100%; margin-bottom: 10px;">
            <input type="text" id="postTitle" placeholder="Заголовок статьи..." style="width: 100%; margin-bottom: 10px;">
            <textarea id="postInput" placeholder="Текст статьи..." rows="20" style="width: 100%; margin-bottom: 10px;"></textarea>
        
        </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Опубликовать',
        confirmButtonColor: '#41cfff',
        showCancelButton: true,
        cancelButtonText: 'Отмена',
        focusConfirm: false,
        // Собираем данные перед тем как вызвать твою функцию
        preConfirm: () => {
            const title = document.getElementById('postTitle').value;
            const text = document.getElementById('postInput').value;
            const image = document.getElementById('postImage').value;

            if (!title || !text) {
                Swal.showValidationMessage('Заголовок и текст обязательны!');
                return false;
            }
            return { title, text, image };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Когда нажали "Опубликовать", вызываем твою функцию
            // Передаем туда данные из полей
            publishPost(result.value);
        }
    });
};




// ФУНКЦИЯ КОТОРАЯ СОЗДАЕТ ТОП 3 САМЫХ ЛУЧШИХ СТАТЬИ НА ГЛАВНОЙ

export function renderTrending(posts) {
    const trendingList = document.getElementById('trending-list');
    if (!trendingList) return;

    // Сортируем по лайкам и берем первые 3
    const topPosts = [...posts]
        .sort((a, b) => (b.real_likes || 0) - (a.real_likes || 0))
        .slice(0, 3);

    trendingList.innerHTML = topPosts.map((post, index) => `
        <a href="article.html?id=${post.id}" class="trending-item">
            <div class="trending-info">
                <span class="trending-title">${index === 0 ? '👑 ' : ''}${post.title}</span>
            
                <div class="stat">
                <span class="trending-likes">❤️ ${post.real_likes || 0}</span>
                
<span style="margin: 5px auto">💬 ${post.commentCount}</span>

<span style="margin: 5px auto">👁️ ${post.viewCount || 0}</span>
</div>
            </div>
        </a>
    `).join('');
}

// window.isClean = function (text) {
//     if (!text) return true;

//     // 1. ЖЕСТКИЕ КОРНИ (Ищем везде)
//     const heavyRoots = ['хуй', 'хуя', 'хуе', 'пизд', 'еба', 'бля'];

//     // 2. ОБЫЧНЫЕ ОСКОРБЛЕНИЯ (Ищем только как отдельные слова!)
//     const badWords = ['дебил', 'дибил', 'пидор', 'лох', 'чмо', 'ублюдок', 'сука'];

//     const lowerText = text.toLowerCase();

//     // Проверка 1: Склейка (для мата)
//     const compressed = lowerText.replace(/[^а-яёa-z]/g, '');

//     // Исключение для латыни Hydrochoerus (чтобы не путать с "хуе")
//     if (compressed.includes('hydrochoer')) {
//         // Пропускаем проверку тяжелых корней для этого научного термена
//     } else {
//         if (heavyRoots.some(root => compressed.includes(root))) return false;
//     }

//     // Проверка 2: По словам (чтобы "лохматой" и "присущих" прошли)
//     const words = lowerText.replace(/[^а-яёa-z\s]/g, ' ').split(/\s+/);

//     const hasBadWord = words.some(word => {
//         // Проверяем, не является ли всё слово целиком оскорблением
//         return badWords.includes(word);
//     });

//     if (hasBadWord) return false;

//     return true;
// };





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




function runSearch(el) {
    // Исправлено: берем или переданный элемент (this), или активный инпут
    const input = el || document.activeElement;
    const grid = document.getElementById('dynamic-cards');
    const loadMoreContainer = document.getElementById('load-more-container');
    const result = document.getElementById('result');
    const filters = document.getElementById('tag'); // или твой ID фильтров
    if (!input || !grid) return;


    const term = input.value.toLowerCase().trim();
    console.log("🔍 Ищем на iPosters:", term);
    if (filters) {
        filters.style.display = term === "" ? "block" : "none";
    }
    if (!window.allPostsData) {
        console.error("Данные еще не загружены в window.allPostsData");
        return;
    }

    const filtered = window.allPostsData.filter(post =>
        (post.title && post.title.toLowerCase().includes(term)) ||
        (post.text && post.text.toLowerCase().includes(term))
    );

    console.log("✅ Найдено статей:", filtered.length);

    grid.innerHTML = '';

    if (window.renderFilteredPosts) {
        window.renderFilteredPosts(filtered, true);

        if (loadMoreContainer) {
            loadMoreContainer.style.display = term === "" ? "block" : "none";
        }
        // Обновляем заголовок, если он есть
        if (result) {
            result.innerHTML = term === "" ? "Мои статьи" : `Результаты поиска для "${term}":`;
        }
    }

    if (filtered.length === 0 && term !== "") {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #00d4ff;">
                <span style="font-size: 40px;">🛸</span>
                <p style="margin-top: 15px; text-shadow: 0 0 10px #00d4ff;">Космос пуст. По запросу "${term}" ничего не найдено.</p>
            </div>
        `;
    }
}
// Присваиваем функцию без скобок, чтобы она не запускалась сама
window.runSearch = runSearch;


document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('searchToggle');
    const mobileBox = document.getElementById('mobileSearchBox');

    if (toggleBtn && mobileBox) {
        toggleBtn.onclick = function (e) {
            e.stopPropagation();
            // Проверяем через стиль: если скрыт — показываем
            const isHidden = mobileBox.style.display === 'none';
            mobileBox.style.display = isHidden ? 'block' : 'none';

            if (isHidden) {
                const inp = mobileBox.querySelector('input');
                if (inp) inp.focus();
            }
        };
    }

    // Закрываем мобильный поиск, если кликнули мимо
    document.addEventListener('click', (e) => {
        if (mobileBox && !mobileBox.contains(e.target) && e.target.id !== 'searchToggle') {
            mobileBox.style.display = 'none';
        }
    });
});