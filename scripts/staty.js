function calculateReadingTimeForCard(text) {
    if (!text) return "0 мин.";
    
    // Считаем слова
    const wordsCount = text.trim().split(/\s+/).length;
    const wpm = 180; // слов в минуту
    const minutes = Math.ceil(wordsCount / wpm);
    
    // Склонение (бонус!)
    let suffix = 'мин.';
    if (minutes === 1) suffix = 'минута';
    if (minutes >= 2 && minutes <= 4) suffix = 'минуты';
    
    return `${minutes} ${suffix}`;
}




// ФУНКИЦЯ КОТОРАЯ ОТПРАВЛЯЕТ НА СЕРВЕР ТЕКСТ, КАРТИНКУ, И ЗАГОЛОВОГ СТАТЬИ

async function publishPost() {
    // 1. Собираем данные из ВСЕХ инпутов
    const title = document.getElementById('postTitle').value;
    const text = document.getElementById('postInput').value;
    const image = document.getElementById('postImage').value; // Ссылка на фото

    // Простая проверка перед отправкой
    if (!title || !text) return Swal.fire({
        icon: "error",
        title: "Ошибка!",
        text: "Заполните все поля!",

    });

    const response = await fetch('https://pro-info-api.onrender.com/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 2. Отправляем полный объект, который ждет сервер
        body: JSON.stringify({
            title: title,
            text: text,
            image: image
        })
    });

    if (response.ok) {
        // alert("Статья успешно опубликована!");
        Swal.fire({
            title: "Опубликовано!",
            text: "Ваша статья появится в ленте через 5 минут",
            icon: "success"
        });
        // Очищаем поля
        document.getElementById('postTitle').value = "";
        document.getElementById('postInput').value = "";
        document.getElementById('postImage').value = "";
    } else {
        alert("Ошибка сервера: " + response.status);
    }
}
// -------------------------------------------------------------------------



// ФУНКЦИЯ КОТОРАЯ СОДЕРЖИТ СЛОВА ПО КОТОРЫМ РАСПРЕДЕЛЯЮТСЯ СТАТЬИ ПО ТЭГАМ

function getAutoCategory(title, content = '') {
    const source = (title + ' ' + content).toLowerCase().trim();
    if (!source) return 'Инфо';

    const keywordsMap = {
        'Код': ['код', 'js', 'html', 'css', 'скрипт', 'прогр', 'dev', 'api', 'сайт', 'проб', 'язык'],
        'Технологии': ['техн', 'соверш', 'робо', 'гейм', 'minecraft', 'cs', 'dota', 'xbox', 'пс5', 'плей'],
        'Природа': ['капибар', 'животн', 'кот', 'пес', 'лес', 'природ', 'море', 'птиц', 'эко', 'океан'],
        'Жизнь': ['школ', 'жизнь', 'день', 'учеба', 'хобби', 'отдых', 'мысли', 'совет', 'урок'],
        'Еда': ['гот', 'пригот', 'ед', 'печен', 'рецепт', 'кухня', 'пицца', 'бургер', 'вкусн', 'завтрак'],
        'Нейро': ['нейро', 'ai', 'ии', 'gpt', 'бот', 'чат', 'midjourney', 'генерация']
    };

    // 3. ПОИСК: Проверяем супер-строку по всем ключевым словам
    for (let category in keywordsMap) {
        if (keywordsMap[category].some(word => source.includes(word))) {
            return category;
        }
    }

    return 'Инфо';
}
// -------------------------------------------------------------------------


let allPostsData = [];

// async function loadPosts() {
//     const grid = document.getElementById('dynamic-cards'); // Берем твоюсетку
//     if (!grid) return;
let displayedCount = 8;



// ФУНКЦИЯ КОТОРАЯ БУДЕТ ОТРИСОВЫВАТЬ КАРТОЧКИ СТАТЕЙ В ЛЕНТЕ КАК ТОЛЬКО ФУНКЦИЯ ЛОАД ПОСТС СКАЧАЕТ ФАЙЛ ПОСТС ДЖСОН ИЗ ГИТХАБ В МАССИВ АЛЛ ПОСТ ДАТА

function renderFilteredPosts(postsToRender, append = false) {

    const grid = document.getElementById('dynamic-cards');
    const loadMoreContainer = document.getElementById('load-more-container');
    if (!grid) return;

    const dataToDraw = append ? postsToRender : postsToRender.slice(0, displayedCount);
    // const partToRender = postsToRender.slice(0, displayedCount);

    // grid.innerHTML =  partToRender.map(post => {
    //     const category = getAutoCategory(post.title);
    //     return `
    const postsHtml = dataToDraw.map(post => {

        const category = getAutoCategory(post.title, post.text); // ТЕПЕРЬ ПЕРЕДАЕМ И ТЕКСТ!

        return `
   
    <a href="article.html?id=${post.id}" style="text-decoration: none; color: inherit;">
        <div class="news-card">

        <span class="auto-tag">#${category}</span>
        <span id="reading-time-${post.id}" style=" position: absolute;
            top: 10px;
            left: 10px;
            background: #0044ff !important;
            /* Твой неоновый голубой */
            color: white !important;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            z-index: 100;

            /* ГЛАВНОЕ: Отключаем скрытие */
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            text-transform: uppercase;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);">
            ⏳ ${calculateReadingTimeForCard(post.text)}
            </span>
            <div class="card-icon">
            ${post.image ? `<img src="${post.image}" alt="icon" style="margin-bottom: 10px;
     background: #ffe5e000;
     width: 100%;

     border-radius: 5px;
     display: flex;
     text-align: center;
     align-items: center;
     justify-content: center;
     color: #ff5733;

     height: 50%;
     
     object-fit: cover;">` : ''}
            </div>
            <p>
                <strong>${post.title}</strong><br>
                <span style="  font-size: 10px; 
    opacity: 0.5; 
    display: block;
    width: 100%; 
    white-space: nowrap; 
    overflow: hidden;   
    text-overflow: ellipsis; /* Рисует три точки, если текст слишком длинный */">Читать статью...</span>
            </p>

            


        </div>
    </a>
`}).join('');

    // СТРАБАТЫВАЕТ ЕСЛИ НАЖАЛ ПОКАЗАТЬ ЕЩЕ, ДОРИСОВЫВАЕТ ЕЩЕ 9 СТАТЕЙ
    if (append) {
        grid.insertAdjacentHTML('beforeend', postsHtml);


        // СТРАБАТЫВАЕТ ЕСЛИ ПЕРЕКЛЮЧИЛ ФИЛЬТР И ЧТОБЫ НЕ ОТРЫСОСВЫВАТЬ ВСЕ СТАТЬИ 

    } else {
        grid.innerHTML = postsHtml;
    }

    // ШАГ 3: Управление кнопкой
    if (loadMoreContainer) {
        // ЕСЛИ ПОКАЗАНЫ ВСЕ КАРТОЧКИ, КНОПКА ПОКАЗАТЬ ЕЩЕ УБИРАЕТСЯ, ЕСЛИ ЕЩЕ МОЖНО ПОКАЗАТЬ, ТО ОНА ОСТАЁТСЯ

        loadMoreContainer.style.display = (displayedCount >= (window.currentFilteredCount || postsToRender.length)) ? 'none' : 'block';
    }


    // Ищем ТОЛЬКО ТЕ карточки, которые МЫ ТОЛЬКО ЧТО ДОБАВИЛИ КНОПКОЙ ПОКАЗАТЬ ЕЩЕ, ДЕЛАЕМ ИМ АНИМАЦИЮ ПОЯВЛЕНИЯ
    const newCards = grid.querySelectorAll('.news-card:not(.visible)');

    newCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 50); // Уменьшил до 50мс для сочности и скорости
    });

}



// ФУНКЦИЯ КОТОРАЯ С САМОГО НАЧАЛА ОТОБРАЖАЕТ ТОЛЬКО 9 КАРТОЧЕК И КОГДА НАЖИМАЕМ КНОПКУ ПОКАЗАТЬ ЕШЕ ОНА ПРОГОНАЯЕТ КАРТОЧКИ ЧЕРЕЗ ФИЛЬТР ТЭГА, ЧТОБЫ НЕ ОТКРЫТЬ ЕЩЕ 8 КАРТОЧЕК ДРУГОГО ФИЛЬТРА И ОТКРЫВАЕТ ЕЩЕ 8 КАРТОЧЕК С ТАКИМ ЖЕ ФИЛЬТРОМ

function loadMore() {
    const start = displayedCount;
    displayedCount += 8; // Прибавляем 8
    const end = displayedCount;
    // Чтобы кнопка работала с учетом фильтра, нам нужно знать, какой тег сейчас выбран
    const activeBtn = document.querySelector('.filter-btn.active');
    const currentTag = activeBtn ? activeBtn.innerText.replace('#', '') : 'Все';

    // Фильтруем данные заново и рисуем новую порцию
    const filtered = (currentTag === 'Все')
        ? allPostsData
        : allPostsData.filter(post => getAutoCategory(post.title) === currentTag);
    window.currentFilteredCount = filtered.length;
    const nextChunk = filtered.slice(start, end);
    renderFilteredPosts(nextChunk, true);
}



// ФУНКЦИЯ КОТОРАЯ БЕРЕТ ИЗ ФАЙЛА ГИТХАБ ТЕКСТ, ЗАГОЛОВОК, КАРТИНКУ, ЛАЙКИ СОХРАНЯЕТ ИХ В МАССИВ АЛЛ ПОСТ ДАТА И ВСТАВЛЯЕТ ИХ НА СТРАНИЦУ С ПОМОЩЬЮ ФУНКЦИИ renderFilteredPosts 

async function loadPosts() {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/Sozdatel1/PRO-info/main/posts.json?v=${Date.now()}`);
        allPostsData = await response.json();


        // Рисуем всё сразу
        renderFilteredPosts(allPostsData);
        renderTrending(allPostsData);
        if (typeof updateHubStats === 'function') {
            updateHubStats(allPostsData);
        }
        if (typeof calculateReadingTime === 'function') {
            calculateReadingTime();
        }

    } catch (err) {
        console.error("Ошибка загрузки:", err);
    }
}



// Запуск ОТРИСОВКИ
document.addEventListener('DOMContentLoaded', loadPosts);




// ФУНКЦИЯ КОТОРАЯ БЕРЕТ ИЗ ФАЙЛА ТЕКСТ, КАРТИНКУ И ЗАГОЛОВОК, ЛАЙКИ И ОТОБРАЖАЕТ ИХ НА СТАТЬЕ С СОБСТВЕННЫМ ID

async function loadFullArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); // Получаем ID из ссылки

    const res = await fetch(`https://raw.githubusercontent.com/Sozdatel1/PRO-info/main/posts.json?v=${Date.now()}`);
    const posts = await res.json();

    const article = posts.find(p => p.id == id); // Ищем статью по ID

    if (article) {
        document.getElementById('artTitle').innerText = article.title;
        // Чтобы абзацы отображались корректно, заменяем переносы строк на <br>
        document.getElementById('artText').innerHTML = article.text.replace(/\n/g, '<br>');
        // --- ДОБАВЬ ЭТИ СТРОКИ НИЖЕ ---
        setTimeout(() => {
            if (window.updateScrollProgress) window.updateScrollProgress();
        }, 5000); // Половина секунды подождем, пока браузер отрисует текст

        const likeSpan = document.getElementById('artLikes');
        const likeBtn = document.getElementById('likeBtn');

        if (likeSpan) likeSpan.innerText = article.likes || 0;

        // Привязываем функцию лайка к кнопке
        if (likeBtn) {
            likeBtn.onclick = (event) => likePost(id, event);
        }
        const imgTag = document.getElementById('artImage'); // Твой ID из HTML
        if (article.image && imgTag) {
            imgTag.src = article.image;
            imgTag.style.display = 'block'; // Показываем картинку, если она есть
        }

    }
}
loadFullArticle();

// ФУНКЦИЯ КОТОРАЯ ОТПРАВЛЯЕТ КОЛ ВО ЛАЙКОВ НА СЕРВЕР

async function likePost(id, event) {
    // Находим кнопку (если кликнули по иконке внутри неё — берем родителя)
    const likeBtn = event?.currentTarget || document.querySelector(`[onclick*="${id}"]`);
    if (likeBtn) {
        likeBtn.style.transform = 'scale(1.2) rotate(-5deg)';
        setTimeout(() => likeBtn.style.transform = 'scale(1) rotate(0)', 200);
    }
    // Защита от спам-кликов, пока идет запрос
    if (likeBtn && (likeBtn.disabled || likeBtn.dataset.loading === "true")) return;

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const likeCountSpan = document.getElementById('artLikes');
    if (!likeCountSpan) return;

    // Сохраняем состояние для отката
    const originalLikes = parseInt(likeCountSpan.innerText) || 0;

    // Блокируем кнопку и обновляем UI (Оптимистично)
    if (likeBtn) {
        likeBtn.dataset.loading = "true";
        likeBtn.style.opacity = "0.5";
    }
    likeCountSpan.innerText = originalLikes + 1;

    try {
        console.log("Нажали лайк, пускаем салют..."); // Проверка в консоли

        // ВЫЗЫВАЕМ САЛЮТ СРАЗУ (МГНОВЕНО!)
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
        const response = await fetch(`https://pro-info-api.onrender.com/like/${id}`, {
            method: 'POST'
        });

        // Пытаемся распарсить JSON
        const data = await response.json().catch(() => ({ success: false }));

        if (data.success) {
            // Синхронизируем число лайков с ответом сервера
            likeCountSpan.innerText = data.likes;
        } else {
            throw new Error("Server error");
        }

    } catch (err) {
        console.error("Ошибка при лайке:", err);
        // Откат при любой ошибке
        likeCountSpan.innerText = originalLikes;
        alert("Не удалось сохранить лайк. Попробуйте позже.");
    } finally {
        // Разблокируем кнопку
        if (likeBtn) {
            delete likeBtn.dataset.loading;
            likeBtn.style.opacity = "1";
        }
    }
}


// --------------------------------------------------------


// СНАЧАЛА МЫ ПОСЫЛАЕМ ДАННЫЕ НА СЕРВЕР РЕНДЕР, 
// ОН ПОСЫЛЕТ ИХ В РЕПО ГИТХАБ С ПОМОЩЬЮ ТОКЕНА ГИТХАБ, 
// А ПОТОМ МЫ ЗАПРАШИВАЕМ ДАННЫЕ ИЗ ФАЙЛА

// ------------------------------------------------------------



// ФУНКЦИЯ КОТОРАЯ СОЗДАЕТ ТОП 3 САМЫХ ЛУЧШИХ СТАТЬИ НА ГЛАВНОЙ

function renderTrending(posts) {
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



// ФУНКЦИЯ КОТОРАЯ СОРТИРУЕТ СТАТЬИ ПО ТЭГАМ КОГДА КЛИКАЮТ НА ФИЛЬТР ОПРЕДЕЛЕННОГО ТЭГА ТО ОТОБРАЖАЮТСЯ СТАТЬИ С ЭТИМ ТЭГОМ


function filterByTag(tag, button) {
    // 1. Сбрасываем счетчик, чтобы снова видеть первые 9 постов
    displayedCount = 9;


    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Очищаем пришедший тег от решетки (на всякий случай)
    const target = tag.replace('#', '').trim();

    // 3. Логика выбора: передаем И заголовок, И текст
    const filtered = (target === 'Все')
        ? allPostsData
        : allPostsData.filter(post => {
            // ВАЖНО: передаем два аргумента в getAutoCategory
            const category = getAutoCategory(post.title, post.text).trim();
            return category === target;
        });

    // 4. Отрисовываем результат (false - чтобы стереть старое и нарисовать новое)
    renderFilteredPosts(filtered, false);
}
