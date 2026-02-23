import { getAutoCategory } from './utils.js'; // Маленькая матрешка
import { renderFilteredPosts } from './render.js'; // Средняя матрешка (если она в другом файле)


export async function likePost(id, event) {
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

window.likePost = likePost;

// --------------------------------------------------------


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






