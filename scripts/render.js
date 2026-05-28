import { getAutoCategory, calculateReadingTimeForCard } from './utils.js';
import { renderTrending } from './staty.js';
// import { likePost } from './staty.js';




// ФУНКЦИЯ КОТОРАЯ БУДЕТ ОТРИСОВЫВАТЬ КАРТОЧКИ СТАТЕЙ В ЛЕНТЕ КАК ТОЛЬКО ФУНКЦИЯ ЛОАД ПОСТС СКАЧАЕТ ФАЙЛ ПОСТС ДЖСОН ИЗ ГИТХАБ В МАССИВ АЛЛ ПОСТ ДАТА



export async function renderFilteredPosts(postsToRender, append = false) {

    const grid = document.getElementById('dynamic-cards');
    const loadMoreContainer = document.getElementById('load-more-container');
    if (!grid) return;

    if (postsToRender.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                <span style="font-size: 50px;">🏜️</span>
                <h3 style="margin-top: 20px; color: #555;">В этой категории пока пусто</h3>
                <p style="opacity: 0.6;">Статей с таким тегом еще не написали...</p>
            </div>
        `;
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        return; // Останавливаем функцию, чтобы не рисовать пустой список
    }
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;

    const dataToDraw = append ? postsToRender : postsToRender.slice(0, displayedCount);


    // ----------------------------------------------------------------------------

    // ВОТ ТУТ СОЗДАЕТСЯ ВРЕМЕННАЯ ПЕРЕМЕННАЯ post ОТ КОТОРОЙ МОЖНО ПЕРЕХОДИТЬ В КОНКРЕТНОЙ КАРТОЧКЕ
    //                                  \\//  
    //                                   ||
    // const response = await fetch(`https://pro-info-api.onrender.com/api/article/${id}`);
    const postsHtml = dataToDraw.map(post => {
        const isOwner = currentUser && (currentUser.id === post.user_id || currentUser.id === post.author_id);
        // КОГДА МЫ УПОМИНАЕМ post.text МЫ УПОМИНАЕМ ЭТУ ПЕРЕМЕННУЮ И ПУНКТ ТЕКСТ В МАССИВЕ КАРТОЧКИ И СТАТЬИ (на гитхаб файл постс джсон) ПРОСТО ЗДЕСЬ ОТРИСОВЫВАЕТСЯ ТОЛЬКО ЗАГОЛОВОК СТАТЬИ В КАРТОЧКЕ, А НА САМОМ ДЕЛЕ ОБРАТИТЬСЯ К ПЕРЕМЕННОЙ post МОЖНО И ЗА ТЕКСТОМ СТАТЬИ (post.text) КАК ЭТО ДЕЛАЕТ ФУНКЦИЯ ПЕРЕСЧЕТА СЛОВ calculateReadingTimeForCard

        // ------------------------------------------------------------------------------------------



        const timeAgo = formatTime(post.created_at); // Вот тут магия
//  ${(post.image || post.image_url) ? `<img src="${post.image || post.image_url}" style="width: calc(100% + 50px)! important; 
//            /* Добавь фиксированную высоту, чтобы object-fit сработал */
//             margin: 0 -25px 15px -25px !important; 
//             display: block; 
//             aspect-ratio: 2 / 1;
//             object-fit: cover; 
//             border-radius: 0px; 
//             flex-shrink: 0; 
//             overflow: hidden; 
//             background-color: #eee;">` : ''}

        const category = getAutoCategory(post.title, post.text); // ТЕПЕРЬ ПЕРЕДАЕМ И ТЕКСТ!

        // вызываем счетчик времени чтения
        const readingTime = calculateReadingTimeForCard(post.text);

        // Внутри твоего return `...`
        return `
    <div class="glass-card article-post" id="post-card-${post.id}" style="margin-bottom: 0px; border: 1px solid rgba(0, 0, 0, 0.09); padding: 30px 25px 25px 25px ; transition: all 0.5s ease; border-radius: 3px; background: rgb(255, 255, 255); scroll-margin-top: 0px; box-shadow: none !important; ">
      <span class="auto-tag"> • ${category} •</span>
        <p style="font-size: 15px; opacity: 0.7; margin-bottom: 15px;">
            Автор: <b>${post.author_name || "Аноним"} | ${timeAgo}</b> | 
        
            Читать ${readingTime} |
            Просмотров: <b id="viw-${post.id}">${post.viewCount || 0}</b>
        </p>
        <!-- Картинка: берем либо post.image, либо post.image_url (проверь как в базе) -->
       
         ${isOwner ? `
        <div class="author-panel" style="display: flex; gap: 10px; margin-bottom: 15px; padding: 10px; background: rgba(65, 207, 255, 0.1); border-radius: 10px;">
            <button onclick="window.openEditModal('${post.id}')" style="background:#41cfff; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">✏️ Редактировать</button>
            <button onclick="window.deletePost('${post.id}')" style="background:#fc2a00; color:white; border:none; padding:8px 15px; border-radius:8px; cursor:pointer; font-weight:bold;">🗑️ Удалить</button>
        </div>
    ` : ''}
        <h1 style="margin: 0 0 10px 0; font-family: Arial, sans-serif; font-size: 28px;">${post.title}</h1>
         <div id="container-${post.id}" class="text-container" style="max-height: 230px; overflow: hidden; position: relative; transition: max-height 0.5s ease;"><div id="text-${post.id}" style="overflow: hidden; transition: max-height 0.5s ease; font-size: 18px; line-height: 1.3; color: #333; white-space: pre-wrap; text-align: left; left: 0;">${post.text}
        </div>

    </div>
        <button onclick="window.togglePost('${post.id}')" id="btn-${post.id}" style="background: none; border: none; color: #41cfff; font-weight: bold; cursor: pointer; margin-top: 15px; padding: 0; font-size: 16px;">
            Развернуть пост ↓
        </button>
                <div style="display: flex; gap: 10px;">
        <div id="like-btn-container-${post.id}" onclick="window.likePost('${post.id}')" style="cursor: pointer; display: flex; align-items: center; margin: 15px 0;">
    <span style="border: 2px solid red; border-radius: 50px; padding: 6px 10px; background-color: #ff8000; display: flex; align-items: center;">
        <img src="/img/staty/thumb_up_24dp_1F1F1F_FILL0_wght400_GRAD0_opsz24.svg" style="width: 20px;">
    </span>
    <span id="likes-count-${post.id}" style="margin-left: 15px; color: #ff8000; font-weight: bold; font-size: 24px;">
        ${post.real_likes || 0}
    </span>
    
    
</div>
 <button onclick="window.sharePost('${post.id}')" class="share-btn" style="background: none; border: none;   cursor: pointer; font-size: 18px; padding: 5px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">Поделиться</button>
 </div>
<div id="comments-section-${post.id}" style="display: none; margin-top: 25px; border-top: 1px solid #eee; padding-top: 15px;">
            <h2>💬 Комментарии</h2>
            <textarea id="commentInput-${post.id}" placeholder="Ваш комментарий..." style="width: 100%; height: 60px; border-radius: 10px; padding: 10px; margin-bottom: 10px;"></textarea>
            <button onclick="window.sendComment('${post.id}')" style="background: #41cfff; color: white; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer;">Отправить</button>
            <div id="comments-list-${post.id}" style="margin-top: 15px;"></div>
        </div>
        

    </div>
`;
    }).join('');

    // СТРАБАТЫВАЕТ ЕСЛИ НАЖАЛ ПОКАЗАТЬ ЕЩЕ, ДОРИСОВЫВАЕТ ЕЩЕ 9 СТАТЕЙ
    if (append) {
        // grid.insertAdjacentHTML('beforeend', postsHtml);
        grid.innerHTML += postsHtml;


        // СТРАБАТЫВАЕТ ЕСЛИ ПЕРЕКЛЮЧИЛ ФИЛЬТР И ЧТОБЫ НЕ ОТРЫСОСВЫВАТЬ ВСЕ СТАТЬИ 

    } else {
        grid.innerHTML = postsHtml;
    }

    // ШАГ 3: Управление кнопкой
    // if (loadMoreContainer) {
    //     // ЕСЛИ ПОКАЗАНЫ ВСЕ КАРТОЧКИ, КНОПКА ПОКАЗАТЬ ЕЩЕ УБИРАЕТСЯ, ЕСЛИ ЕЩЕ МОЖНО ПОКАЗАТЬ, ТО ОНА ОСТАЁТСЯ

    //     loadMoreContainer.style.display = (displayedCount >= (window.currentFilteredCount || postsToRender.length)) ? 'none' : '';
    // }
    if (loadMoreContainer) {
        // 1. УЗНАЕМ РЕАЛЬНОЕ КОЛИЧЕСТВО:
        // Если мы фильтруем, берем длину отфильтрованного списка (postsToRender)
        // Если это общая лента, тоже берем длину того, что пришло в функцию
        const totalAvailable = postsToRender.length;

        // 2. СРАВНИВАЕМ:
        // Если мы уже показали (window.displayedCount) столько же или больше, 
        // чем есть всего в этом списке — ПРЯЧЕМ кнопку.
        if (window.displayedCount >= totalAvailable && !append) {
            loadMoreContainer.style.display = 'none';
        } else if (append && postsToRender.length < 8) {
            // Если мы нажали "еще", но пришло меньше 8 новых постов — ПРЯЧЕМ
            loadMoreContainer.style.display = 'none';
        } else {
            loadMoreContainer.style.display = 'block';
        }
    }

    // Ищем ТОЛЬКО ТЕ карточки, которые МЫ ТОЛЬКО ЧТО ДОБАВИЛИ КНОПКОЙ ПОКАЗАТЬ ЕЩЕ, ДЕЛАЕМ ИМ АНИМАЦИЮ ПОЯВЛЕНИЯ
    const newCards = grid.querySelectorAll('.article-post:not(.visible)');
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            newCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 50); // Уменьшил до 50мс для сочности и скорости
            }, 200);


        });
    });
};

window.togglePost = async function (postId) {
    const textBlock = document.getElementById(`text-${postId}`);
    const btn = document.getElementById(`btn-${postId}`);
    const commentSection = document.getElementById(`comments-section-${postId}`);
    const container = document.getElementById(`container-${postId}`);
    if (!container.classList.contains('expanded')) {
        // --- РАСКРЫВАЕМ ---
        container.classList.add('expanded');
        container.style.maxHeight = textBlock.scrollHeight + "px";
        btn.innerText = "Свернуть пост ↑";

        // 1. Считаем просмотр (localStorage внутри спасет от накрутки)
        if (typeof registerView === 'function') {
            await registerView(postId);
        }

        // 2. Показываем комменты
        if (commentSection) {
            commentSection.style.display = 'block';
            if (window.loadComments) window.loadComments(postId, 3);
        }

        // 3. Обновляем цифру просмотров в карточке
        try {
            const countRes = await fetch(`https://pro-info-api.onrender.com/api/view-count/${postId}`);
            if (countRes.ok) {
                const data = await countRes.json();
                const viewElem = document.getElementById(`viw-${postId}`);
                if (viewElem) viewElem.innerText = data.count;
            }
        } catch (e) { console.log("Счетчик пока спит..."); }

    } else {
        // --- СВОРАЧИВАЕМ ---
        container.classList.remove('expanded'); // Возвращаем градиент
        container.style.maxHeight = "230px"; // Возвр
        btn.innerText = "Развернуть пост ↓";
        if (commentSection) commentSection.style.display = 'none';

         const card = document.getElementById(`post-card-${postId}`);
        if (card) {
            const startTime = performance.now();
            const duration = 500; // Длительность твоей CSS анимации (0.5s)

            function scrollSync(now) {
                const elapsed = now - startTime;

                // Пока идет анимация, прижимаем нижний край карточки к низу экрана
                card.scrollIntoView({
                    behavior: 'auto', // 'auto' вместо 'smooth', чтобы не было конфликта скоростей
                    block: 'end'
                });

                // Если 500мс не прошло, запрашиваем следующий кадр анимации
                if (elapsed < duration) {
                    requestAnimationFrame(scrollSync);
                }
            }

            // Запускаем синхронизацию скролла
            requestAnimationFrame(scrollSync);
        }

    }
};



const { createClient } = window.supabase;

// 1. НАСТРОЙКА (Вставь свои данные из Settings -> API)
export const supabase = createClient('https://nwopcdkydnuudovkgvxs.supabase.co', 'sb_publishable_U38NKz2Gg_btgccNGzIDCA_ynTC9x7q')

// --- АВТОРИЗАЦИЯ (НИК + ПАРОЛЬ) ---
window.openAuthModal = function () {
    document.getElementById('auth-modal').style.display = 'flex';
};

// Закрыть модальное окно
window.closeAuthModal = function () {
    document.getElementById('auth-modal').style.display = 'none';
};
// --- ВХОД ---
export async function loginUser(username, password) {
    const errorDisplay = document.getElementById('auth-error-msg');
    if (errorDisplay) errorDisplay.innerText = "";

    // Сначала проверяем поля, чтобы не слать пустой запрос (избегаем ошибки 400)
    if (!username.trim() || !password.trim()) {
        if (errorDisplay) errorDisplay.innerText = "⚠️ Заполни все поля!";
        return;
    }

    const email = `${username.toLowerCase()}@app.local`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (errorDisplay) errorDisplay.innerText = "❌ Неверный ник или пароль";
        return;
    }

    location.reload();
}

// --- РЕГИСТРАЦИЯ ---
export async function registerUser(username, password) {
    const regErrorDisplay = document.getElementById('reg-error-msg'); // Сделай отдельный ID для модалки регистрации
    if (regErrorDisplay) regErrorDisplay.innerText = "";

    if (!username.trim() || !password.trim()) {
        if (regErrorDisplay) regErrorDisplay.innerText = "⚠️ Заполни все поля!";
        return;
    }

    const email = `${username.toLowerCase()}@app.local`;
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        if (regErrorDisplay) regErrorDisplay.innerText = `❌ ${error.message}`;
        return;
    }
    closeAuthModal()
    // Если всё ок, можно оставить SweetAlert для красоты
    await Swal.fire({
        title: "Готово!",
        text: `Аккаунт ${username} создан`,
        icon: "success",
        confirmButtonColor: "#00d4ff"
    });

    location.reload();
}



// ПРОСМОТРЫ

async function registerView(postId) {
    // 1. Проверяем метку в браузере
    const storageKey = `viewed_${postId}`;
    if (localStorage.getItem(storageKey)) {
        return; // Если уже смотрели, просто выходим
    }

    try {
        // 2. Если метки нет — пинаем сервер
        const response = await fetch(`https://pro-info-api.onrender.com/api/view/${postId}`, {
            method: 'POST'
        });

        // 3. Если сервер ответил успешно — ставим метку
        if (response.ok) {
            localStorage.setItem(storageKey, 'true');
        }
    } catch (err) {
        console.error('Ошибка регистрации просмотра');
    }
}
window.registerView = registerView;



function handleSearch(event) {
    const term = event.target.value.toLowerCase().trim();
    console.log("Печатаю:", event.target.value);
    if (!window.allPostsData) return console.warn("Нет данных!");

    // 1. Проверяем, есть ли данные для поиска
    if (!window.allPostsData) {
        console.warn("Данные еще не загружены!");
        return;
    }

    // 2. Фильтруем массив по заголовку и тексту
    const filtered = window.allPostsData.filter(post =>
        post.title.toLowerCase().includes(term) ||
        post.text.toLowerCase().includes(term)
    );
    console.log("Найдено статей:", filtered.length); // Проверка в консоли
    // 3. Вызываем твою функцию отрисовки
    if (typeof window.renderFilteredPosts === 'function') {
        window.renderFilteredPosts(filtered, false);
    }

    // 4. Если пусто — пишем сообщение
    const container = document.getElementById('articles-container');
    if (filtered.length === 0 && container) {
        container.innerHTML = `<p style="color: #00d4ff; text-align: center; padding: 20px;">Ничего не найдено... 🔍</p>`;
    }
}

// Делаем функцию доступной для HTML
window.handleSearch = handleSearch;


export async function loadPosts() {
    window.renderLoader.start();
    try {
        const response = await fetch('https://pro-info-api.onrender.com/api/posts');
        const data = await response.json();

        window.allPostsData = data;
        renderFilteredPosts(data);
        renderTrending(data);
        updateHubStats(data);
         // 🔥 ФИНАЛЬНЫЙ ШТРИХ: посты на экране, проверяем ссылку!
    window.checkUrlHash();
    } catch (err) {
        console.error("Ошибка фронтенда:", err.message);
    }
    finally {
        window.renderLoader.stop(); // 2. 🔥 ТУШИМ ЛОАДЕР сразу после ответа сервера!
    }
}


// 2. ЗАГРУЗКА ДЛЯ ЛИЧНОГО АККАУНТА

export async function loadMyArticles() {
    try {
        // 1. Получаем сессию, чтобы взять токен доступа
        const { data: { session } } = await supabase.auth.getSession();
        const currentUser = session?.user;
        if (!session) return;

        // 2. Стучимся на СВОЙ сервер, передавая токен в заголовке
        const response = await fetch('https://pro-info-api.onrender.com/api/my-articles', {
            headers: {
                'Authorization': `Bearer ${session.access_token}`
            }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);

        // 3. Сохраняем и отрисовываем
        window.displayedCount = data.length;
        window.allPostsData = data;

        if (typeof renderFilteredPosts === 'function') {
            renderFilteredPosts(data);
        }
    } catch (err) {
        console.error("Ошибка загрузки моих статей:", err.message);
    }
}


export async function loadFullArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    // Вызываем твою функцию регистрации просмотра (её тоже можно будет потом перенести)
    if (typeof registerView === 'function') registerView(id);

    try {
        // 1. Получаем данные от нашего сервера
        const response = await fetch(`https://pro-info-api.onrender.com/api/article/${id}`);
        const article = await response.json();
        if (!response.ok) throw new Error(article.error);

        // 2. Отрисовка текста и заголовков (ТВОЙ КОД)
        document.getElementById('artTitle').innerText = article.title;
        document.getElementById('artText').innerHTML = article.text.replace(/\n/g, '<br>');
        document.getElementById('arti').innerHTML = `${article.title} | iPosters`;

        const likesSpan = document.getElementById('artLikes');
        if (likesSpan) likesSpan.innerText = article.real_likes;



        const imgTag = document.getElementById('artImage');
        if (article.image && imgTag) {
            imgTag.src = article.image;
            imgTag.style.display = 'block';
        }
        if (document.getElementById('avtor')) {
            document.getElementById('avtor').innerText = article.author_name || "Аноним";
        }
        const postId = params.get('id');
        const count = await fetch(`https://pro-info-api.onrender.com/api/view-count/${postId}`);
        const data = await count.json();

        const viwElem = document.getElementById('viw');
        if (viwElem) {
            viwElem.innerHTML = `<span>${data.count}</span>`;
        }

        // 3. Проверка прав на удаление/редактирование
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        const delArt = document.getElementById('delete-art');

        if (delArt && user && user.id === article.user_id) {
            delArt.innerHTML = `
                <div class="panel" style="display: flex;">

        <button onclick="openEditModal ('${id}')" style="cursor: pointer; padding: 11px; background: #41cfff;
color: white;
border-color: #41cfff;
box-shadow: 0 4px 15px rgba(65, 207, 255, 0.4),
    0 0 5px rgba(0, 255, 65, 0.2); border: none; border-radius: 20px; font-size: 20px; margin: 20px auto">
                Редактировать
            </button>

            <p id="read-time" style="padding: 11px; background: #0019fc;
color: white;
border-color: #ff4141;
box-shadow: 0 4px 15px rgba(65, 106, 255, 0.4),
    0 0 5px rgba(0, 8, 255, 0.2); border: none; border-radius: 20px; font-size: 20px; margin: 20px">

    </p>
            <button onclick="deletePost('${id}')" style="  cursor: pointer; padding: 11px; background: #fc2a00;
color: white;
border-color: #ff4141;
box-shadow: 0 4px 15px rgba(255, 65, 65, 0.4),
    0 0 5px rgba(0, 255, 65, 0.2); border: none; border-radius: 20px; font-size: 20px; margin: 20px auto">
                Удалить статью
            </button></div>
            `;
        } else if (delArt) {
            // Если не автор — очищаем контейнер (на всякий случай)
            delArt.innerHTML = `
        <p id="read-time" style="padding: 11px; background: #0019fc;
color: white;
border-color: #ff4141;
box-shadow: 0 4px 15px rgba(65, 106, 255, 0.4),
    0 0 5px rgba(0, 8, 255, 0.2); border: none; border-radius: 20px; font-size: 20px; margin: 20px"></p>`;
        } else if (delArt) {
            delArt.innerHTML = `<p id="read-time" class="time-block"></p>`;
        }

    } catch (err) {
        console.error('Ошибка загрузки статьи:', err.message);
    }

    loadComments();
}










export async function publishPost(data) {
    const title = data ? data.title : document.getElementById('postTitle').value;
    const image = data ? data.image : document.getElementById('postImage').value;

    // МАГИЯ ТУТ: если есть data, берем готовый текст. 
    // Если нет, проверяем сначала .value, а если это div — берем .innerHTML
    const text = data ? data.text : (document.getElementById('postInput').value || document.getElementById('postInput')?.innerHTML);
    if (!title || !text) {
        return Swal.fire({
            title: "Заполни поля!",
            text: "Статья не может быть без заголовка или текста.",
            icon: "warning",
            confirmButtonColor: "#ff8000"
        });
    }

    try {
        // 1. Получаем токен
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return openAuthModal();

        // 2. Отправляем данные на наш Node.js сервер
        const response = await fetch(`https://pro-info-api.onrender.com/api/publish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                title,
                text,
                image,
                id: window.currentEditId // Если null — сервер поймет, что это новый пост
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        // 3. Успех
        const isEdit = !!window.currentEditId;

        await Swal.fire({
            title: isEdit ? "Обновлено!" : "Опубликовано!",
            icon: "success",
            timer: 1500, // Окно само закроется через 1.5 сек
            showConfirmButton: false
        });

        location.reload();
        if (isEdit) {
            window.location.href = `article.html?id=${window.currentEditId}`;
        }

    } catch (err) {
        Swal.fire("Ошибка", err.message, "error");
    }
}


let isRegMode = false;

// Открыть модальное окно


// Переключение между Входом и Регистрацией
window.toggleModalMode = function () {
    isRegMode = !isRegMode;

    const title = document.getElementById('modal-title');
    const btn = document.getElementById('modal-btn');
    const switchText = document.getElementById('modal-switch-text');
    const switchLink = document.getElementById('modal-switch-link');

    if (isRegMode) {
        title.innerText = "Регистрация";
        btn.innerText = "Создать аккаунт";
        switchText.innerText = "Уже есть аккаунт?";
        switchLink.innerText = "Войти";
    } else {
        title.innerText = "Вход в аккаунт";
        btn.innerText = "Войти";
        switchText.innerText = "Еще нет аккаунта?";
        switchLink.innerText = "Создать аккаунт";
    }
};

// Срабатывает при нажатии на большую кнопку
window.handleModalAction = function () {
    const user = document.getElementById('user').value;
    const pass = document.getElementById('pass').value;
    const errorDisplay = document.getElementById('auth-error-msg');
    if (!user || !pass) {
        if (errorDisplay) {
            errorDisplay.innerText = "⚠️ Заполните все поля!";
        }
        return;
    }
    if (errorDisplay) errorDisplay.innerText = "";
    if (isRegMode) {
        registerUser(user, pass);
    } else {
        loginUser(user, pass);
    }
};

// Закрытие при клике вне карточки
window.addEventListener('click', (e) => {
    const modal = document.getElementById('auth-modal');
    if (e.target === modal) {
        closeAuthModal();
    }
});

// Функция, которая проверяет статус входа и меняет кнопки (ДЛЯ ГЛАВНОЙ)
async function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const profileBtn = document.getElementById('profile-btn');
    const usernameDisplay = document.getElementById('username-display');
    const plus = document.getElementById('plus')
    // Если кнопок нет на текущей странице, прерываем функцию
    // if (!loginBtn && !profileBtn) return;

    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (user) {

        if (usernameDisplay) {
            usernameDisplay.innerText = user.email.split('@')[0];
        }
        if (plus) {
            plus.style.display = 'flex';
        }
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'block';
    } else {
        loginBtn.style.display = 'flex';
        profileBtn.style.display = 'none';
        plus.style.display = 'none';

    }
}
window.updateAuthUI = updateAuthUI


// Функция защиты роута (ДЛЯ ПРОФИЛЯ)
export async function checkUserProfile() {
    const { data: { session }, error } = await supabase.auth.getSession();
    const user = session?.user;
    // Если не вошел — отправляем на главную БЕЗ сохранения в истории переходов
    if (!user || error) {
        window.location.replace('index.html');
        return;
    }

    // Показываем ник в шапке (отрезаем домен)
    const username = user.email.split('@')[0];
    const profileBtn = document.getElementById('profile-btn');
    const usernameDisplay = document.getElementById('username-display');
    const akk = document.getElementById('akk')
    const prof = document.getElementById('profile')
    // const avtor = document.getElementById('avtor');
    if (profileBtn) {
        profileBtn.style.setProperty('display', 'block', 'important');
    }
    if (usernameDisplay) {
        usernameDisplay.innerText = username;
    }
    if (akk) {
        const name = user.email.split('@')[0];
        akk.innerText = `${name} | Профиль`; // Получится: "ivan | Профиль"
    }
    if (prof) {
        const us = user.email.split('@')[0];
        prof.innerText = `${us} • Профиль | iPosters`; // Получится: "ivan | Профиль"
    }
    // Загружаем только статьи этого пользователя
    if (typeof loadMyArticles === 'function') {
        loadMyArticles(user.id);
    }
}
window.checkUserProfile = checkUserProfile;
// Функция для кнопки "Профиль"
window.goToProfile = function () {
    window.location.href = 'profile.html';
};

// Функция выхода
window.logoutUser = async function () {
    await supabase.auth.signOut();
    window.location.replace('index.html'); // replace спасает от зацикливания
};

// --- ГЛАВНОЕ ИСПРАВЛЕНИЕ: Разделение запуска по страницам ---
document.addEventListener('DOMContentLoaded', () => {
    const isProfilePage = document.getElementById('prof')

    if (isProfilePage) {
        // На странице профиля проверяем сессию и редиректим если не залогинен
        checkUserProfile();
    } else {
        // На остальных страницах (главной) просто переключаем кнопки Войти/Профиль
        updateAuthUI();
    }
});



// const delArt = document.getElementById('delete-art')
// if (delArt) {
//     delArt.innerHTML = `
//       <button onclick="deletePost('${postId}')" style="color: red; border: none; background: none; cursor: pointer;">
//         Удалить
//     </button>`}
window.deleteMyAccount = async function () {
    // 1. Показываем всплывающее окно с предупреждением
    const { data: { session }, error } = await supabase.auth.getSession();
    const user = session?.user;
    const username = user.email.split('@')[0];
    const result = await Swal.fire({
        title: `Удалить аккаунт ${username}?`,
        text: "Ваш профиль и ВСЕ ваши статьи будут безвозвратно удалены!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff4d4d",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Да, удалить всё",
        cancelButtonText: "Отмена"
    });

    // 2. Если пользователь нажал "Да, удалить всё"
    if (result.isConfirmed) {
        try {
            // Получаем ID текущего авторизованного пользователя
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                return Swal.fire("Ошибка", "Пользователь не найден", "error");
            }

            // Показываем индикатор загрузки
            Swal.fire({
                title: 'Удаление...',
                text: 'Пожалуйста, подождите',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // 3. Отправляем запрос на ваш бэкенд на Render
            const response = await fetch('https://pro-info-api.onrender.com/api/delete-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id })
            });

            const resData = await response.json();

            // Если сервер вернул ошибку
            if (!response.ok || resData.error) {
                throw new Error(resData.error || "Не удалось удалить аккаунт");
            }

            // 4. Уведомляем об успехе
            await Swal.fire({
                title: "Удалено!",
                text: "Ваш аккаунт был успешно стерт.",
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });

            // Выходим из сессии в браузере и редиректим на главную
            await supabase.auth.signOut();
            window.location.replace('index.html');

        } catch (err) {
            // Если что-то пошло не так (например, сервер Render спит)
            Swal.fire("Ошибка", err.message, "error");
            console.error("Ошибка удаления:", err);
        }
    }
}









window.deletePost = async function (postId) {
    // 1. Проверяем, что ID вообще пришел
    console.log("Пытаемся удалить статью с ID:", postId);

    if (!postId || postId === "undefined" || postId === "null") {
        console.error("Ошибка: ID статьи пустой или некорректный!");
        return Swal.fire("Ошибка", "Не удалось определить ID статьи для удаления", "error");
    }

    const result = await Swal.fire({
        title: "Вы уверены?",
        text: "Статью нельзя будет восстановить!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff4d4d",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Да, удалить!",
        cancelButtonText: "Отмена"
    });

    if (result.isConfirmed) {
        try {
            // 2. Делаем запрос на удаление
            const { error } = await supabase
                .from('articles')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            await Swal.fire({
                title: "Удалено!",
                text: "Статья успешно удалена.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });

            if (document.getElementById('artTitle')) { // Если на странице есть заголовок статьи
                window.location.href = '/profile'; // Vercel сам поймет, что это profile.html
            } else {
                // Если мы в профиле, просто обновляем страницу, чтобы статья исчезла из списка
                location.reload();
            }
        } catch (err) {
            Swal.fire("Ошибка", err.message || "Ошибка на стороне базы данных", "error");
            console.error("Ошибка удаления статьи:", err);
        }
    }
}






window.closeEditModal = function () {
    document.getElementById('edit-modal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Возвращаем скролл
};

window.saveChanges = async function () {
    const newTitle = document.getElementById('editTitle').value;
    const newText = document.getElementById('editText').value;
    const newImage = document.getElementById('editImage').value;

    // 1. Проверяем наличие ID
    if (!window.currentEditId) {
        return Swal.fire("Ошибка", "ID статьи не найден", "error");
    }

    if (!newTitle || !newText) {
        return Swal.fire("Ошибка", "Поля не могут быть пустыми", "warning");
    }

    try {
        // 2. Добавляем .select(), чтобы проверить, обновилось ли что-то реально
        const { data, error } = await supabase
            .from('articles')
            .update({ title: newTitle, text: newText, image: newImage })
            .eq('id', window.currentEditId)
            .select();

        if (error) throw error;

        // 3. Если data пустая — значит RLS заблокировал обновление
        if (!data || data.length === 0) {
            return Swal.fire("Доступ запрещен", "У вас нет прав на редактирование этой статьи.", "error");
        }

        await Swal.fire({
            title: "Обновлено!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
        });

        location.reload();
    } catch (err) {
        Swal.fire("Ошибка", err.message, "error");
        console.error("Ошибка при сохранении:", err);
    }
};

window.publishPost = publishPost;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.renderFilteredPosts = renderFilteredPosts;
