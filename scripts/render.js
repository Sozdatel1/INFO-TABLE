import { getAutoCategory, calculateReadingTimeForCard } from './utils.js';
import { renderTrending } from './staty.js';
import { likePost } from './staty.js';




// ФУНКЦИЯ КОТОРАЯ БУДЕТ ОТРИСОВЫВАТЬ КАРТОЧКИ СТАТЕЙ В ЛЕНТЕ КАК ТОЛЬКО ФУНКЦИЯ ЛОАД ПОСТС СКАЧАЕТ ФАЙЛ ПОСТС ДЖСОН ИЗ ГИТХАБ В МАССИВ АЛЛ ПОСТ ДАТА



export function renderFilteredPosts(postsToRender, append = false) {

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

    const dataToDraw = append ? postsToRender : postsToRender.slice(0, displayedCount);


// ----------------------------------------------------------------------------

// ВОТ ТУТ СОЗДАЕТСЯ ВРЕМЕННАЯ ПЕРЕМЕННАЯ post ОТ КОТОРОЙ МОЖНО ПЕРЕХОДИТЬ В КОНКРЕТНОЙ КАРТОЧКЕ
//                                  \\//  
//                                   ||
    const postsHtml = dataToDraw.map(post => {

// КОГДА МЫ УПОМИНАЕМ post.text МЫ УПОМИНАЕМ ЭТУ ПЕРЕМЕННУЮ И ПУНКТ ТЕКСТ В МАССИВЕ КАРТОЧКИ И СТАТЬИ (на гитхаб файл постс джсон) ПРОСТО ЗДЕСЬ ОТРИСОВЫВАЕТСЯ ТОЛЬКО ЗАГОЛОВОК СТАТЬИ В КАРТОЧКЕ, А НА САМОМ ДЕЛЕ ОБРАТИТЬСЯ К ПЕРЕМЕННОЙ post МОЖНО И ЗА ТЕКСТОМ СТАТЬИ (post.text) КАК ЭТО ДЕЛАЕТ ФУНКЦИЯ ПЕРЕСЧЕТА СЛОВ calculateReadingTimeForCard

// ------------------------------------------------------------------------------------------


        const category = getAutoCategory(post.title, post.text); // ТЕПЕРЬ ПЕРЕДАЕМ И ТЕКСТ!

        // вызываем счетчик времени чтения
        const readingTime = calculateReadingTimeForCard(post.text);

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
    const newCards = grid.querySelectorAll('.news-card:not(.visible)');

    newCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('visible');
        }, index * 50); // Уменьшил до 50мс для сочности и скорости
    });

}




// ФУНКЦИЯ КОТОРАЯ БЕРЕТ ИЗ ФАЙЛА ГИТХАБ ТЕКСТ, ЗАГОЛОВОК, КАРТИНКУ, ЛАЙКИ СОХРАНЯЕТ ИХ В МАССИВ АЛЛ ПОСТ ДАТА И ВСТАВЛЯЕТ ИХ НА СТРАНИЦУ С ПОМОЩЬЮ ФУНКЦИИ renderFilteredPosts 

export async function loadPosts() {
    try {
        const response = await fetch(`https://pro-info-api.onrender.com/loadPosts`);
        const allPostsData = await response.json();

        // Рисуем всё сразу
        if (typeof renderFilteredPosts === 'function') {
            renderFilteredPosts(allPostsData);
        }
        if (typeof renderTrending === 'function') {
            renderTrending(allPostsData);
        }
        if (typeof updateHubStats === 'function') {
            updateHubStats(allPostsData);
        }
    } catch (err) {
        console.error("Ошибка загрузки:", err);
    }
}



// ФУНКЦИЯ КОТОРАЯ БЕРЕТ ИЗ ФАЙЛА ТЕКСТ, КАРТИНКУ И ЗАГОЛОВОК, ЛАЙКИ И ОТОБРАЖАЕТ ИХ НА СТАТЬЕ С СОБСТВЕННЫМ ID
// ВЫЗЫВАЕТСЯ ТОЛЬКО НА СТРАНИЦЕ СТАТЬИ (СМ START-API.JS)

export async function loadFullArticle() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); // Получаем ID из ссылки

    if (!id) {
        console.error("ID статьи не передан");
        return;
    }

    try {
        const response = await fetch(`https://pro-info-api.onrender.com/loadFullArticle?id=${encodeURIComponent(id)}`);
        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status}`);
        }
        const article = await response.json();

        if (article) {
            // Вставляем данные в DOM
            document.getElementById('artTitle').innerText = article.title;
            document.getElementById('artText').innerHTML = article.text.replace(/\n/g, '<br>');

            setTimeout(() => {
                if (window.updateScrollProgress) window.updateScrollProgress();
            }, 5000);

            const likeSpan = document.getElementById('artLikes');
            const likeBtn = document.getElementById('likeBtn');

            if (likeSpan) likeSpan.innerText = article.likes || 0;

            if (likeBtn) {
                likeBtn.onclick = () => likePost(article.id);
            }

            const imgTag = document.getElementById('artImage');
            if (article.image && imgTag) {
                imgTag.src = article.image;
                imgTag.style.display = 'block';
            }
        }
    } catch (err) {
        console.error('Ошибка загрузки статьи:', err);
    }
}



// ФУНКИЦЯ КОТОРАЯ ОТПРАВЛЯЕТ НА СЕРВЕР ТЕКСТ, КАРТИНКУ, И ЗАГОЛОВОГ СТАТЬИ

export async function publishPost() {
    const title = document.getElementById('postTitle').value;
    const text = document.getElementById('postInput').value;
    const image = document.getElementById('postImage').value;

    if (!title || !text) {
        return Swal.fire({
            icon: "error",
            title: "Ошибка!",
            text: "Заполните все поля!"
        });
    }

    try {
        const response = await fetch(`https://pro-info-api.onrender.com/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, text, image })
        });

        if (response.ok) {
            Swal.fire({
                title: "Опубликовано!",
                text: "Ваша статья появится в ленте через некоторое время",
                icon: "success"
            });

            // Очистка полей
            document.getElementById('postTitle').value = "";
            document.getElementById('postInput').value = "";
            document.getElementById('postImage').value = "";
        } else {
            Swal.fire({
                icon: "error",
                title: "Ошибка сервера",
                text: `Код: ${response.status}`
            });
        }
    } catch (err) {
        Swal.fire({
            icon: "error",
            title: "Ошибка",
            text: err.message
        });
    }
}
window.publishPost = publishPost;