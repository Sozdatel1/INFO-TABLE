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


// ФУНКЦИЯ КОТОРАЯ БЕРЕТ ИЗ ФАЙЛА ЗАГОЛОВОК И ИЗОБРАЖЕНИЕ КОТОРЫЕ БЫЛИ ПОЛУЧЕНЫ С СЕРВЕРА И ВСТАВЛЯЕТ ИХ В ТАБЛИЦУ СО СТАТЬЯМИ

async function loadPosts() {
    const grid = document.getElementById('dynamic-cards'); // Берем твоюсетку
    if (!grid) return;

    try {
        const response = await fetch(`https://raw.githubusercontent.com/Sozdatel1/PRO-info/main/posts.json?v=${Date.now()}`);
        const posts = await response.json();

        // Очищаем сетку, если хочешь, чтобы статические карточки пропали, 
        // ИЛИ не очищай, если хочешь, чтобы новые посты добавились сверху
        // grid.innerHTML = ''; 

        // Генерируем HTML для новых постов
        const postsHtml = posts.map(post => `
    <a href="article.html?id=${post.id}" style="text-decoration: none; color: inherit;">
        <div class="news-card">
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
                <span style="font-size: 10px; opacity: 0.5;">Читать статью...</span>
            </p>
        </div>
    </a>
`).join('');


        // Вставляем новые посты в начало сетки
        grid.insertAdjacentHTML('afterbegin', postsHtml);

    } catch (err) {
        console.error("Ошибка загрузки:", err);
    }
}

// Вызываем при загрузке
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

// СНАЧАЛА МЫ ПОСЫЛАЕМ ДАННЫЕ НА СЕРВЕР, ОН ПОСЫЛЕТ ИХ В РЕПО ГИТХАБ С ПОМОЩЬЮ ТОКЕНА ГИТХАБ, А ПОТОМ МЫ ЗАПРАШИВАЕМ ДАННЫЕ ИЗ ФАЙЛА
