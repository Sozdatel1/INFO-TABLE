

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

window.likePost = async function (postId) {
    // ВАЖНО: Теперь postId приходит как аргумент, а не из URL
    if (!postId) return;

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // 1. Быстрая проверка для анонимов через localStorage
        if (!user) {
            const myLikes = JSON.parse(localStorage.getItem('my_likes') || '[]');
            if (myLikes.includes(postId)) {
                return Swal.fire("Упс!", "Вы уже поставили лайк этому посту", "info");
            }
        }

        // 2. Запрос на сервер (передаем postId)
        const response = await fetch('https://pro-info-api.onrender.com/api/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': session ? `Bearer ${session.access_token}` : ''
            },
            body: JSON.stringify({ postId: postId }) // Передаем наш ID
        });

        const result = await response.json();

        if (response.ok) {
            // --- ПРАЗДНИК ТОЛЬКО ПРИ УСПЕХЕ ---
            if (typeof confetti === 'function') {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.7 },
                    colors: ['#41cfff', '#ffffff', '#ff8000']
                });
            }

            // Ищем спан именно ВНУТРИ этой карточки
            const likesSpan = document.getElementById(`likes-count-${postId}`);
            if (likesSpan) likesSpan.innerText = result.count;

            // Записываем анониму в локалку
            if (!user) {
                const myLikes = JSON.parse(localStorage.getItem('my_likes') || '[]');
                myLikes.push(postId);
                localStorage.setItem('my_likes', JSON.stringify(myLikes));
            }
        } else if (result.error === "already_liked") {
            Swal.fire("Упс!", "Вы уже поставили лайк этому посту", "info");
        }

    } catch (err) {
        console.error("Like error:", err);
    }
};





// Глобальный объект-счётчик лимитов (закинь в самый верх файла или оставь тут)
if (!window.commentsLimit) {
    window.commentsLimit = {};
}

function buildCommentTree(list, parentId = null) {
    return list
        .filter(item => item.parent_id == parentId)
        .map(item => ({ ...item, replies: buildCommentTree(list, item.id) }));
}

// window.loadComments = async function (postId, isLoadMore = false) {
//     // 1. Ищем список именно для ЭТОГО поста
//     const list = document.getElementById(`comments-list-${postId}`);
//     if (!list || !postId) return;

//     // 🔥 ИСПРАВИЛИ: Сначала ЖЕСТКО создаем объект, если его нет!
//     if (!window.commentsLimit) {
//         window.commentsLimit = {};
//     }

//     // Теперь эта проверка никогда не упадет в ошибку!
//     if (!window.commentsLimit[postId] || !isLoadMore) {
//         window.commentsLimit[postId] = 3;
//     } else if (isLoadMore) {
//         window.commentsLimit[postId] += 3;
//     }
//     try {
//         // Получаем сессию для проверки владельца (isOwner)
//         const { data: { session } } = await supabase.auth.getSession();
//         const user = session?.user;

//         // Запрос к твоему API на Рендере с динамическим лимитом
//         const currentLimit = window.commentsLimit[postId];
//         const response = await fetch(`https://pro-info-api.onrender.com/api/comments/${postId}?limit=${ currentLimit }`);
//         const comments = await response.json();

//         if (!comments || comments.length === 0) {
//             list.innerHTML = '<p style="color: gray; font-size: 14px; padding: 10px;">Пока никто не прокомментировал. Будьте первым!</p>';

//             // Удаляем старую кнопку, если комментов нет
//             const oldBtn = document.getElementById(`load-more-btn-${postId}`);
//             if (oldBtn) oldBtn.remove();
//             return;
//         }

//         // 3. ОТРИСОВКА ВНУТРИ КАРТОЧКИ (Твой оригинальный сочный шаблон)
//         list.innerHTML = comments.map(c => {
//             const isOwner = user && user.id === c.user_id;

//             return `
//             <div style="background: #fcfcfc; padding: 10px; border-radius: 4px; margin-bottom: 20px; position: relative; border: 1px solid #ececec;">
//                 <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
//                     <b style="color: #333; font-size: 15px;">${c.user_name || 'Аноним'}</b>
//                     <small style="color: #000000; font-size: 11px; margin: 0 auto;">
//                         ${new Date(c.created_at).toLocaleString('ru-RU', {
//                             day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
//                         })}
//                     </small>
//                 </div>
//                 <p style="margin: 0; color: #333; font-size: 17px; line-height: 1.4;">${c.content || c.text}</p>

//                 ${isOwner ? `
//                     <button onclick="window.deleteComment('${c.id}', '${postId}')" 
//                         style="position: absolute; top: 5px; right: 5px; background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 14px;" 
//                         title="Удалить">🗑️</button>
//                 ` : ''}
//             </div>`;
//         }).join('');

//         // 4. УМНОЕУПРАВЛЕНИЕ КНОПКОЙ "ПОКАЗАТЬ ЕЩЁ"
//         const oldBtn = document.getElementById(`load-more-btn-${postId}`);
//         if (oldBtn) oldBtn.remove();

//         // Если сервер вернул ровно столько комментов, сколько мы просили,
//         // значит в базе потенциально есть еще старые записи — рендерим кнопку!
//         if (comments.length >= currentLimit) {
//             list.insertAdjacentHTML('afterend', `
//                 <button id="load-more-btn-${postId}" onclick="window.loadComments('${postId}', true)" 
//                     style="display: block; width: 100%; background: none; border: none; color: #007bff; cursor: pointer; font-size: 14px; padding: 10px 0; text-align: center; font-weight: bold; margin-top: -10px; margin-bottom: 15px;">
//                     Показать ещё комментарии...
//                 </button>
//             `);
//         }

//     } catch (err) {
//         console.error("Ошибка загрузки комментов:", err);
//     }
// };
window.loadComments = async function (postId, isLoadMore = false) {
    const list = document.getElementById(`comments-list-${postId}`);
    if (!list || !postId) return;

    // 1. Инициализируем и управляем лимитом КОРНЕВЫХ комментов
    if (!window.commentsLimit) {
        window.commentsLimit = {};
    }
    if (!window.commentsLimit[postId] || !isLoadMore) {
        window.commentsLimit[postId] = 3; // Старт с 3 главных веток
    } else if (isLoadMore) {
        window.commentsLimit[postId] += 3; // Добавляем по 3 ветки по клику
    }

    const currentLimit = window.commentsLimit[postId];

    try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        // Запрос к бэкенду Express на Рендере
        const response = await fetch(`https://pro-info-api.onrender.com/api/comments/${postId}`);
        let allComments = await response.json();
        if (!Array.isArray(allComments)) {
            console.warn("Предупреждение: Сервер вернул ошибку, подменяем на пустой массив.");
            allComments = [];
        }
        if (!allComments || allComments.length === 0) {
            list.innerHTML = '<p style="color: gray; font-size: 14px; padding: 10px; text-align: center;">Пока никто не прокомментировал. Будьте первым!</p>';
            const oldBtn = document.getElementById(`load-more-btn-${postId}`);
            if (oldBtn) oldBtn.remove();
            return;
        }

        // Разделяем родителей и ответы на плоском уровне
        const rootComments = allComments.filter(c => !c.parent_id || c.parent_id === 0 || c.parent_id === 'null' || c.parent_id === '0' || c.parent_id === '');
        const replyComments = allComments.filter(c => c.parent_id && c.parent_id !== 'null' && c.parent_id !== '0');

        // Обрезаем родительские комменты по лимиту
        const limitedRoots = rootComments.slice(0, currentLimit);

        // Объединяем обратно для сборки рекурсивного дерева
        const filteredFlatList = [...limitedRoots, ...replyComments];
        const commentTree = buildCommentTree(filteredFlatList, null);

        // Рекурсивный генератор HTML (Вычищен до идеального блеска!)
        function generateCommentHtml(c, level = 0) {
            const isOwner = user && user.id === c.user_id;
            const marginShift = Math.min(level * 30, 90);

            const borderStyle = level > 0 ? 'border-left: 3px solid #41cfff;' : 'border: 1px solid #ececec;';
            const backgroundStyle = level > 0 ? 'background: #fafafa;' : 'background: #fcfcfc;';

            const rawText = c.content || c.text || '';
            const formattedText = rawText.replace(/(@[a-zA-Z0-9_а-яА-ЯёЁ]+)/g,
                `<span class="mention-tag" style="color: #41cfff; font-weight: bold; cursor: pointer; text-decoration: underline; text-decoration-color: transparent; transition: 0.2s;">$1</span>`
            );

            // 🔥 ФИКС СИНИОРА: Если коммент твой - берем красивый регистр Yaa / Kapibara из живых метаданных сессии!
            // Никаких split почты, которые выкатывали дефисы и хэши (kapibara-malo)!
            // Если коммент чужого автора - выводим c.user_name, присланный сервером Express!
            const currentAuthorName = isOwner 
                ? (user.user_metadata?.display_name || user.user_metadata?.name || "Автор") 
                : (c.user_name || 'Аноним');
            return `
            <div style="margin-left: ${marginShift}px; ${backgroundStyle} ${borderStyle} padding: 12px; border-radius: 6px; margin-bottom: 12px; position: relative; transition: 0.2s;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <b onclick="window.prepareReply('${postId}', '${c.id}', '${currentAuthorName}')" 
                       class="comment-author"
                       style="color: #333; font-size: 15px; cursor: pointer; text-decoration: underline; text-decoration-color: transparent; transition: 0.2s;">
                       ${currentAuthorName}
                    </b>
                    <small style="color: #000000; font-size: 11px; margin: 0 auto;">
                        ${new Date(c.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </small>
                </div>
                
                <p style="margin: 0; color: #222; font-size: 16px; line-height: 1.4; padding-right: 20px;">${formattedText}</p>
                
                <div style="margin-top: 6px;">
                    <span onclick="window.prepareReply('${postId}', '${c.id}', '${currentAuthorName}')" 
                          style="color: #007bff; font-size: 12px; cursor: pointer; font-weight: bold; transition: 0.2s;"
                          onmouseover="this.style.color='#41cfff'" onmouseout="this.style.color='#007bff'">
                          Ответить
                    </span>
                </div>

                ${isOwner ? `
                    <button onclick="window.deleteComment('${c.id}', '${postId}')" 
                        style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 14px; padding: 0;" title="Удалить">🗑️</button>
                ` : ''}
            </div>
            ${c.replies.map(reply => generateCommentHtml(reply, level + 1)).join('')}
            `;
        }

        // Выводим дерево на страницу
        list.innerHTML = commentTree.map(c => generateCommentHtml(c, 0)).join('');

        // 🔥 ШАГ 3. ЖЕЛЕЗОБЕТОННОЕ ВЫВЕДЕНИЕ КНОПКИПОДГРУЗКИ
        const oldBtn = document.getElementById(`load-more-btn-${postId}`);
        if (oldBtn) oldBtn.remove();

        // Если реальное количество КОРНЕВЫХ (главных) комментов в базе больше текущего лимита,
        // кнопка ОБЯЗАНА появиться на экране твоего ноута!
        if (allComments.length > filteredFlatList.length) {
            list.insertAdjacentHTML('afterend', `
                <button id="load-more-btn-${postId}" onclick="window.loadComments('${postId}', true)" 
                    style="display: block; width: 100%; background: none; border: none; color: #007bff; cursor: pointer; font-size: 14px; padding: 10px 0; text-align: center; font-weight: bold; margin-top: -10px; margin-bottom: 15px;">
                    Показать ещё комментарии...
                </button>
            `);
        }

    } catch (err) {
        console.error("Критический сбой рендера дерева комментов:", err);
    }
};


// 2. ФУНКЦИЯ ПОДГОТОВКИ ОТВЕТА (Вызывается по клику на автора или кнопку "Ответить")
window.prepareReply = function (postId, commentId, authorName) {
    const input = document.getElementById(`commentInput-${postId}`);
    if (!input) return;

    // Вшиваем ID родительского комментария в кастомный атрибут самого инпута
    input.setAttribute('data-parent-id', commentId);

    // Автоматически подставляем имя с собачкой и переводим фокус на поле ввода
    input.value = `@${authorName}, `;
    input.focus();
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



// // 2. ФУНКЦИЯ ОТПРАВКИ КОММЕНТАРИЯ
// window.sendComment = async function (postId) {
//     // ВАЖНО: Берем инпут именно из этой карточки по уникальному ID
//     const input = document.getElementById(`commentInput-${postId}`);
//     if (!input) return; // Страховка

//     const text = input.value.trim();

//     if (!text) return Swal.fire("Ошибка", "Напишите хотя бы пару слов!", "warning");

//     // Проверка сессии (всё как ты любишь)
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session) return openAuthModal();

//     try {
//         const response = await fetch(`https://pro-info-api.onrender.com/api/comments`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${session.access_token}`
//             },
//             body: JSON.stringify({ postId, text }) // postId теперь берется из аргумента
//         });

//         const result = await response.json();
//         if (!response.ok) throw new Error(result.error);

//         input.value = ''; // Очищаем поле

//         // ВАЖНО: Перезагружаем список комментов именно для этой статьи
//         if (window.loadComments) window.loadComments(postId); 

//     } catch (err) {
//         Swal.fire("Ошибка", err.message, "error");
//     }
// };

// 3. ОБНОВЛЕННАЯ ФУНКЦИЯ ОТПРАВКИ КОММЕНТАРИЯ (Умеет отправлять parentId)
window.sendComment = async function (postId, isLoadMore = false) {
    const input = document.getElementById(`commentInput-${postId}`);
    if (!input) return;

    const text = input.value.trim();
    if (!text) return Swal.fire("Ошибка", "Напишите хотя бы пару слов!", "warning");

    // Вытаскиваем parent_id из атрибута инпута (если его нет - улетит null, то есть главный коммент)
    const parentId = input.getAttribute('data-parent-id');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return openAuthModal();

    try {
        const response = await fetch(`https://pro-info-api.onrender.com/api/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                postId,
                text,
                parentId: parentId ? parseInt(parentId) : null
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        // Полная очистка поля и сброс состояния ответа после успешного сохранения в базу
        input.value = '';
        input.removeAttribute('data-parent-id');
        Swal.fire("Отправлено!", "Комментарий отправлен на модерацию.");
        // Мгновенно обновляем ветку комментов именно этой статьи
        if (window.loadComments) window.loadComments(postId);

    } catch (err) {
        Swal.fire("Ошибка", err.message, "error");
    }
};




// window.deleteComment = async function (commentId) {
//     const result = await Swal.fire({
//         title: 'Удалить комментарий?',
//         text: "Это действие нельзя отменить!",
//         icon: 'warning',
//         showCancelButton: true,
//         confirmButtonColor: '#ff4d4d',
//         cancelButtonColor: '#ccc',
//         confirmButtonText: 'Да, удалить!',
//         cancelButtonText: 'Отмена'
//     });

//     if (result.isConfirmed) {
//         try {
//             const { error } = await supabase
//                 .from('comments')
//                 .delete()
//                 .eq('id', commentId);

//             if (error) throw error;

//             Swal.fire('Удалено!', 'Комментарий стерт.', 'success');
//             loadComments(); // Обновляем список сразу
//         } catch (err) {
//             Swal.fire('Ошибка', err.message, 'error');
//         }
//     }
// };
// 4. ИСПРАВЛЕННАЯ ФУНКЦИЯ УДАЛЕНИЯ КОММЕНТАРИЯ (Каскад на бэкенде подчистит остальное)
window.deleteComment = async function (commentId, postId) {
    const result = await Swal.fire({
        title: 'Удалить комментарий?',
        text: "Все ответы на этот комментарий также будут уничтожены навсегда из базы данных!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ff4d4d',
        cancelButtonColor: '#ccc',
        confirmButtonText: 'Да, удалить!',
        cancelButtonText: 'Отмена'
    });

    if (result.isConfirmed) {
        try {
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;

            Swal.fire('Удалено!', 'Комментарий и вся его ветка успешно стерты.', 'success');
            if (window.loadComments) window.loadComments(postId);
        } catch (err) {
            Swal.fire('Ошибка', err.message, 'error');
        }
    }
};


// СНАЧАЛА МЫ ПОСЫЛАЕМ ДАННЫЕ НА СЕРВЕР РЕНДЕР, 
// ОН ПОСЫЛЕТ ИХ В РЕПО ГИТХАБ С ПОМОЩЬЮ ТОКЕНА ГИТХАБ, 
// А ПОТОМ МЫ ЗАПРАШИВАЕМ ДАННЫЕ ИЗ ФАЙЛА

// ------------------------------------------------------------
window.openCreateModal = async function () {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
   const ak = user.user_metadata?.display_name || user.user_metadata?.name || user.email.split('@')[0] || 'Аноним';
    await Swal.fire({
        title: `Напишите статью, ${ak}!`,
        // Вставляем твою верстку прямо сюда
        width: '1000px',
        html: `
        <div class="glass-card admin-zone" style="height: auto; border: none; box-shadow: none; background: transparent; padding: 0;">
            <input type="text" id="postImage" placeholder="Ссылка на картинку статьи (URL)..." style="width: 100%; margin-bottom: 10px;">
            <input type="text" id="postTitle" placeholder="Заголовок статьи..." style="width: 100%; margin-bottom: 10px;">
            <div class="toolbar" style="margin-bottom: 10px; display: flex; gap: 5px;">

    <!-- Кнопка жирности -->
    <button type="button" id="btn-bold"  onclick="window.formatDoc('bold')" style="padding: 5px 10px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Ж</button>
    
    <!-- Выбор размера текста -->
    <select id="select-size" onchange="window.formatDoc('fontSize', this.value)" style="padding: 5px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">
        <option value="2">Маленький</option> <!-- Было 3 -->
    <option value="4">Обычный / Средний</option> <!-- Стандартный размер твоего сайта -->
    <option value="5">Большой</option> <!-- Заметно крупнее -->
    <option value="7">Огромный</option> <!-- Реальный заголовок, сразу видно разницу -->
    </select>
     <button type="button" onclick="document.getElementById('fileInput').click()" style="padding: 5px 10px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">📎 Фото</button>
    
    <!-- Скрытый инпут, который откроет выбор файлов на компе/телефоне -->
    <input type="file" id="fileInput" accept="image/*" style="display: none;" multiple>
</div>

<!-- Смарт-поле ввода (замена textarea) -->
<div id="postInput" contenteditable="true" placeholder="Текст статьи..." style="
    width: 100%; 
    min-height: 300px; 
    border: 1px solid #ccc; 
    border-radius: 4px; 
    padding: 10px; 
    text-align: left; 
    color: black;
    background: white; 
    overflow-y: auto;
    white-space: pre-wrap;
"></div>
          
        
        </div>
        `,
        didOpen: () => {
            const input = document.getElementById('postInput');
            const boldBtn = document.getElementById('btn-bold');
            const sizeSelect = document.getElementById('select-size');
            const fileInput = document.getElementById('fileInput');
            // 1. Сначала вставляем текст (для окна редактирования)
            if (typeof oldText !== 'undefined' && input) {
                input.innerHTML = oldText;
            }

            if (input) {
                // 🔥 ЖЕСТКИЙ АВТОФОКУС: ставим курсор в самый конец текста
                input.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(input);
                range.collapse(false); // false означает поставить курсор в конец текста
                sel.removeAllRanges();
                sel.addRange(range);
                if (fileInput) {
                    fileInput.addEventListener('change', (event) => {
                        // Вызываем функцию и передаем файлы напрямую из события браузера!
                        window.uploadFile(event.target.files);
                    });
                }

                const checkState = () => {
                    // Подсветка кнопки Ж
                    if (boldBtn) {
                        const isBold = document.queryCommandState('bold');
                        boldBtn.style.background = isBold ? '#41cfff' : '#e0e0e0';
                        boldBtn.style.color = isBold ? 'white' : 'black';
                    }

                    // Переключение окошка размера за курсором
                    if (sizeSelect) {
                        let currentSize = document.queryCommandValue('fontSize');
                        // Если тегов нет, держим базовую 4-ку (Обычный)
                        if (!input.innerHTML.includes('font-size') && !input.innerHTML.includes('size=') && (currentSize == 4 || !currentSize)) {
                            currentSize = "4";
                        }
                        if (currentSize) {
                            sizeSelect.value = currentSize;
                        }
                    }
                };

                input.addEventListener('keyup', checkState);
                input.addEventListener('mouseup', checkState);

                // Даем браузеру 50мс отобразить модалку и ровно считываем стили
                setTimeout(() => {
                    checkState();
                }, 50);
            }
        },



        showConfirmButton: true,
        confirmButtonText: 'Опубликовать',
        confirmButtonColor: '#41cfff',
        showCancelButton: true,
        cancelButtonText: 'Отмена',
        focusConfirm: false,
        // Собираем данные перед тем как вызвать твою функцию
        preConfirm: () => {
            const title = document.getElementById('postTitle').value.trim();
            const image = document.getElementById('postImage').value.trim();

            // 1. Для проверки берем ЧИСТЫЙ ТЕКСТ без HTML-тегов и пробелов
            const checkText = document.getElementById('postInput').innerText.trim();

            // 2. Честная проверка: если букв нет — стопим отправку
            if (!title || !checkText) {
                Swal.showValidationMessage('Заголовок и текст обязательны!');
                return false;
            }

            // 3. Если всё ок — забираем со всеми тегами жирности и размеров!
            const htmlText = document.getElementById('postInput').innerHTML;

            return { title, text: htmlText, image };
        }

    }).then((result) => {
        if (result.isConfirmed) {
            // Когда нажали "Опубликовать", вызываем твою функцию
            // Передаем туда данные из полей
            window.publishPost(result.value);
        }
    });
};

window.openEditModal = async function (id) {
    // 1. ВМЕСТО ЗАПРОСА В БАЗУ — забираем данные прямо из DOM (с экрана)
    const oldTitle = document.querySelector(`#post-card-${id} h1`)?.innerText || '';
    const oldText = document.getElementById(`text-${id}`)?.innerHTML || '';
    const oldImage = document.querySelector(`#post-card-${id} img`)?.src || '';

    // 2. Получаем ник для заголовка
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user; 
    // const ak = session?.user?.email.split('@')[0] || 'Автор';
const ak = user.user_metadata?.display_name || user.user_metadata?.name || user.email.split('@')[0] || 'Аноним';
    // 3. Открываем твой стеклянный интерфейс
    const { value: formValues } = await Swal.fire({
        title: `Отредактируйте статью, ${ak}`,
        width: '1000px',
        background: '#ffffff',
        html: `
            <div class="glass-card admin-zone" style="height: auto; border: none; box-shadow: none; background: transparent; padding: 0;">
                <input type="text" id="postImage" placeholder="Ссылка на картинку статьи (URL)..." value="${oldImage || ''}" style="width: 100%; margin-bottom: 10px;">
                <input type="text" id="postTitle" placeholder="Заголовок статьи..." value="${oldTitle}"  style="width: 100%; margin-bottom: 10px;">
                
                <!-- ПАНЕЛЬ ИНСТРУМЕНТОВ -->
                <div class="toolbar" style="margin-bottom: 10px; display: flex; gap: 5px; text-align: left;">
                    <button type="button" id="btn-bold" onclick="window.formatDoc('bold')" style="padding: 6px 12px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; transition: background 0.2s;">Ж</button>
                    
                    <!-- ПОМЕНЯЛИ ШКАЛУ НА 2, 4, 5, 7 И ДОБАВИЛИ id="select-size" -->
                    <select id="select-size" onchange="window.formatDoc('fontSize', this.value)" style="padding: 6px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">
                        <option value="2">Маленький</option>
                        <option value="4">Обычный</option>
                        <option value="5">Большой</option>
                        <option value="7">Огромный</option>
                    </select>
                     <button type="button" onclick="document.getElementById('fileInput').click()" style="padding: 5px 10px; background: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">📎 Фото</button>
    
    <!-- Скрытый инпут, который откроет выбор файлов на компе/телефоне -->
    <input type="file" id="fileInput" accept="image/*" style="display: none;" multiple>
                </div>

                <!-- УМНОЕ ПОЛЕ ВВОДА -->
                <div id="postInput" contenteditable="true" placeholder="Текст статьи..." style="
                    width: 100%; 
                    min-height: 400px; 
                    border: 1px solid #ccc; 
                    border-radius: 4px; 
                    padding: 10px; 
                    text-align: left; 
                    background: white; 
                    color: black;
                    overflow-y: auto;
                    white-space: pre-wrap;
                "></div>
            </div>
        `,
        didOpen: () => {
            const input = document.getElementById('postInput');
            const boldBtn = document.getElementById('btn-bold');
            const sizeSelect = document.getElementById('select-size');

            if (typeof oldText !== 'undefined' && input) {
                // .trim() уберет все скрытые табы и переносы строк, которые прилетели из верстки HTML
                input.innerHTML = oldText.trim();
            }
            if (input) {
                // 🔥 ЖЕСТКИЙ АВТОФОКУС: ставим курсор в самый конец текста
                input.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(input);
                range.collapse(false); // false означает поставить курсор в конец текста
                sel.removeAllRanges();
                sel.addRange(range);
                if (fileInput) {
                    fileInput.addEventListener('change', (event) => {
                        // Вызываем функцию и передаем файлы напрямую из события браузера!
                        window.uploadFile(event.target.files);
                    });
                }
                const checkState = () => {
                    // Подсветка кнопки Ж
                    if (boldBtn) {
                        const isBold = document.queryCommandState('bold');
                        boldBtn.style.background = isBold ? '#41cfff' : '#e0e0e0';
                        boldBtn.style.color = isBold ? 'white' : 'black';
                    }

                    // Переключение окошка размера за курсором
                    if (sizeSelect) {
                        let currentSize = document.queryCommandValue('fontSize');
                        // Если тегов нет, держим базовую 4-ку (Обычный)
                        if (!input.innerHTML.includes('font-size') && !input.innerHTML.includes('size=') && (currentSize == 4 || !currentSize)) {
                            currentSize = "4";
                        }
                        if (currentSize) {
                            sizeSelect.value = currentSize;
                        }
                    }
                };

                input.addEventListener('keyup', checkState);
                input.addEventListener('mouseup', checkState);

                // Даем браузеру 50мс отобразить модалку и ровно считываем стили
                setTimeout(() => {
                    checkState();
                }, 50);
            }
        },

        showCancelButton: true,
        confirmButtonText: 'Сохранить изменения',
        confirmButtonColor: '#41cfff',
        cancelButtonText: 'Отмена',
        preConfirm: () => {
            const title = document.getElementById('postTitle').value.trim();
            const checkText = document.getElementById('postInput').innerText.trim();

            if (!title || !checkText) {
                Swal.showValidationMessage('Заголовок и текст обязательны!');
                return false;
            }

            return {
                image: document.getElementById('postImage').value.trim(),
                title: title,
                text: document.getElementById('postInput').innerHTML // Забираем HTML-код изменений
            }
        }
    });

    // 4. Если нажали "Сохранить" — пушим в базу без зависаний
    if (formValues) {
        Swal.close();
        Swal.fire({
            icon: 'success',
            title: 'Обновлено!',
            timer: 1000,
            showConfirmButton: false
        });

        const cardTitle = document.querySelector(`#post-card-${id} h1`);
        const cardText = document.getElementById(`text-${id}`);
        const cardImg = document.querySelector(`#post-card-${id} img`);

        if (cardTitle) cardTitle.innerText = formValues.title;
        if (cardText) cardText.innerHTML = formValues.text; // Меняем на innerHTML, чтобы стили сразу применились в ленте!
        if (cardImg && formValues.image) {
            cardImg.src = formValues.image;
            cardImg.style.display = 'block';
        }

        supabase
            .from('articles')
            .update({
                title: formValues.title,
                text: formValues.text,
                image: formValues.image
            })
            .eq('id', id)
            .then(({ error }) => {
                if (error) {
                    console.error("Ошибка сохранения в базу данных:", error.message);
                }
            });
    }
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
        <button onclick="window.scrollToPost('${post.id}')" class="trending-item">
            <div class="trending-info">
                <span class="trending-title">${index === 0 ? '👑 ' : ''}${post.title}</span>
            
                <div class="stat">
                <span class="trending-likes">❤️ ${post.real_likes || 0}</span>
                
<span style="margin: 5px auto">💬 ${post.commentCount}</span>

<span style="margin: 5px auto">👁️ ${post.viewCount || 0}</span>
</div>
            </div>
        </button>
    `).join('');
}
window.scrollToPost = function (postId) {
    const element = document.getElementById(`post-card-${postId}`);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth', // Плавный скролл
            block: 'start'      // Карточка встанет вверху экрана
        });

        // Маленький спецэффект: подсветим карточку, чтобы юзер её не потерял
        element.style.boxShadow = "0 0 30px rgba(65, 207, 255, 0.6)";
        setTimeout(() => element.style.boxShadow = "none", 2000);
    }
};

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



function formatTime(dateString) {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000); // Разница в секундах

    if (diff < 60) return 'только что';
    if (diff < 3600) return Math.floor(diff / 60) + ' мин. назад';
    if (diff < 86400) return Math.floor(diff / 3600) + ' час. назад';
    if (diff < 259200) return Math.floor(diff / 86400) + ' дн. назад';

    // Если очень старый пост, просто пишем дату
    return past.toLocaleDateString();
}
window.formatTime = formatTime
function runSearch(el) {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Делает прокрутку плавной
    });
    // Исправлено: берем или переданный элемент (this), или активный инпут
    const input = el || document.activeElement;
    const grid = document.getElementById('dynamic-cards');
    const loadMoreContainer = document.getElementById('load-more-container');
    const result = document.getElementById('result');
    const filters = document.getElementById('tag'); // или твой ID фильтров
    const my_stat = document.getElementById('my-stat')
    const prof = document.getElementById('prof')
    const stats = document.getElementById('stats')
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
            result.innerHTML = term === "" ? "Мои посты" : `Результаты поиска для "${term}":`;
        }
        if (stats) {
            stats.innerHTML = term === "" ? "" : `Результаты поиска для "${term}":`;
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


window.uploadFile = async function (files) {
    if (!files || files.length === 0) return;
    


    const inputField = document.getElementById('postInput');
    Swal.showLoading(); // Включаем красивый лоадер SweetAlert
    const imageUrls = [];
    // Упаковываем файл в специальный формат для отправки по сети


         // 🔥 НАДО СТРОГО ТАК (Метод .pop() забирает из массива СТРОГО чистую base64 строку без префикса!):
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',').pop()); // <-- ДОБАВИЛИ .pop() НА КОНЦЕ!
        reader.onerror = error => reject(error);
    })
    try {
        for (let i = 0; i < files.length; i++) {
              const currentFile = files[i];
            const base64Data = await toBase64(currentFile);

            // Штурмуем твой собственный бэкенд на Рендере (Тут CORS и 50-мегабайтные лимиты в идеале!)
            const response = await fetch('https://pro-info-api.onrender.com/api/upload-image', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ imageBase64: base64Data })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error("Детали ошибки твоего сервера Express:", errData);
                throw new Error(`Ошибка на файле №${i + 1}`);
            }

            const result = await response.json();
            
            // Твой сервер возвращает готовую прокси-ссылку в поле result.url
            if (result && result.url) {
                imageUrls.push(result.url); // Ссылка на твой собственный image-proxy встает в массив карусели!
            } else {
                throw new Error('Ошибка парсинга ответа бэкенда');
            }
        }

        if (imageUrls.length === 0) throw new Error("Массив картинок пуст");

        // ВЕРНУЛИ ФОКУС НА ТЕКСТ ПЕРЕД ВСТАВКОЙ
        if (inputField) inputField.focus();
        // 🔍 УМНАЯ ПРОВЕРКА НА СВЯЗКУ ПОДРЯД
        const selection = window.getSelection();
        let targetNode = null;

        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            // Ищем элемент, который стоит прямо перед курсором
            targetNode = range.startContainer.childNodes[range.startOffset - 1] || range.startContainer.previousSibling || range.startContainer.parentNode?.lastElementChild;
        }

        // Проверяем, является ли предыдущий элемент одиночной картинкой или уже существующей каруселью
        const isPrevImg = targetNode && targetNode.tagName === 'IMG';
        const isPrevCarousel = targetNode && targetNode.classList?.contains('post-carousel');

        if (isPrevImg || isPrevCarousel || imageUrls.length > 1) {
            // --- СОБИРАЕМ ВСЕ ССЫЛКИ В ОДНУ КАРУСЕЛЬ ---
            let allUrls = [];

            if (isPrevImg) {
                allUrls.push(targetNode.src); // Забираем ссылку из старой одиночной картинки
                targetNode.remove(); // Удаляем саму старую картинку с экрана
            } else if (isPrevCarousel) {
                // Забираем все старые ссылки из существующей карусели
                const oldImages = targetNode.querySelectorAll('.carousel-track img');
                oldImages.forEach(img => allUrls.push(img.src));
                targetNode.remove(); // Удаляем старую карусель, чтобы заменить её на расширенную
            }

            // Добавляем к старым ссылкам наши новые только что загруженные картинки
            allUrls = allUrls.concat(imageUrls);

            // Генерируем новый HTML карусели
            const carouselId = `carousel-${Date.now()}`;
            let carouselHtml = `<div id="${carouselId}" class="post-carousel" style="position: relative; width: 100%; height: 350px !important; margin: 15px 0; overflow: hidden; border-radius: 8px; background: black; "><div class="carousel-track" style="display: flex; align-items: center; transition: transform 0.4s ease; width: 100%; height: 100%;">`;

            allUrls.forEach(url => {
                carouselHtml += `<img src="${url}" style="width: 100%; height: 100%; object-fit: contain; background: #1a1a1a00; flex-shrink: 0;">`;
            });

            carouselHtml += `
                </div>
                <button type="button" onclick="window.moveCarousel('${carouselId}', -1)" style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); background: rgb(0, 0, 0); color: white; border: none; padding: 15px; border-radius: 50px; cursor: pointer; z-index: 10;"><img src="/img/arrow_left_alt_30dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"></button>
                <button type="button" onclick="window.moveCarousel('${carouselId}', 1)" style="position: absolute; top: 50%; right: 10px; transform: translateY(-50%); background: rgb(0, 0, 0); color: white; border: none; padding: 15px; border-radius: 50px; cursor: pointer; z-index: 10;"><img src="/img/arrow_right_alt_30dp_FFFFFF_FILL0_wght400_GRAD0_opsz24.svg"></button>
            </div>
            
            `;

            document.execCommand('insertHTML', false, carouselHtml);
        } else {
            // --- ОБЫЧНАЯ ОДИНОЧНАЯ ВСТАВКА (если рядом ничего не было) ---
            document.execCommand('insertImage', false, imageUrls[0]);
        }

        Swal.hideLoading();
    } catch (err) {
        console.error("Ошибка загрузки файла", err.message);
        Swal.fire("Ошибка сети", "Не удалось загрузить картинку. Попробуй другой файл.", "error");
    }
};
window.moveCarousel = function (carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;

    const track = carousel.querySelector('.carousel-track');
    const images = track.querySelectorAll('img');

    // Храним текущий индекс слайда прямо в атрибуте HTML-элемента
    let currentIndex = parseInt(carousel.getAttribute('data-index') || '0');

    // Меняем индекс
    currentIndex += direction;

    // Зацикливаем слайдер (если ушли за границы)
    if (currentIndex >= images.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = images.length - 1;

    // Запоминаем новый индекс
    carousel.setAttribute('data-index', currentIndex);

    // Сдвигаем трек на нужный процент (каждая фотка занимает 100% ширины)
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
};


window.checkUrlHash = function () {
    const hash = window.location.hash;
    if (!hash || !hash.startsWith('#post-')) return;

    const postId = hash.replace('#post-', '');

    // 🔥 ДОБАВИЛИ ТАЙМЕР ОЖИДАНИЯ: скрипт будет караулить пост в HTML, пока база данных его не отрисует!
    const checkInterval = setInterval(() => {
        const targetPost = document.getElementById(`post-card-${postId}`);
        const container = document.getElementById(`container-${postId}`);

        // Как только карточка поста родилась в HTML — запускаем скролл и раскрытие!
        if (targetPost) {
            clearInterval(checkInterval); // Выключаем таймер, цель поймана!



            // 2. Ждем 500мс (время полной CSS-анимации), пока пост раскроется до конца
            setTimeout(() => {
                targetPost.scrollIntoView({

                    block: 'center'     // Отцентрует раскрытый пост на экране!
                });
            }, 500);
        }
    }, 100); // Проверяем экран каждые 100мс

    // Страховка: если через 5 секунд пост так и не прилетел из базы, отключаем таймер
    setTimeout(() => clearInterval(checkInterval), 5000);
};

// Запускаем проверку хэша СРАЗУ при чтении скрипта браузером
window.checkUrlHash();


// Если хэш изменился прямо во время работы сайта — мгновенно летим к новому посту!
window.addEventListener('hashchange', window.checkUrlHash);
// 🔥 ФИНАЛЬНЫЙ СТАРТЕР: Запускаем проверку хэша при ПЕРВОЙ загрузке сайта
window.addEventListener('load', () => {
    // Даем браузеру 300 миллисекунд, чтобы догрузить все посты и карусели
    setTimeout(() => {
        window.checkUrlHash();
    }, 300);
});

// 🔥 Перепиши начало функции прямо так, чтобы она мгновенно регистрировалась в браузере
window.sharePost = async function (postId) {
    const postUrl = `${window.location.origin}/#post-${postId}`;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    // 🔥 ВОТ ТУТ ДОБАВИЛИ ПРОВЕРКУ: НАЛИЧИЕ SHARE *И* СЕНСОРНЫЙ ЭКРАН!
    if (navigator.share && isTouchDevice) {
        try {
            await navigator.share({
                title: 'Посмотри этот post на iPosters!',
                url: postUrl
            });
        } catch (err) { console.log('Отмена отправки'); }
    } else {
        try {
            await navigator.clipboard.writeText(postUrl);

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Ссылка на пост скопирована!',
                showConfirmButton: false,
                timer: 2000
            });
        } catch (err) {
            Swal.fire('Ошибка', 'Не удалось скопировать ссылку', 'error');
        }
    }
};

// =========================================================================
// 🦫 ИНТЕРФЕЙС ЦЕНТРАЛЬНОГО ПУЛЬТА УПРАВЛЕНИЯ KAPIBARA (СТАТЬИ + КОММЕНТЫ)
// =========================================================================

window.currentUnapprovedCache = []; // Кэш комментариев

window.checkAdminProfile = async function () {
    const panel = document.getElementById('admin-moderation-panel');
    const articlesList = document.getElementById('admin-articles-queue-list');
    const commentsList = document.getElementById('admin-posts-queue');
    const globalBadge = document.getElementById('global-mod-badge');
    const artBadge = document.getElementById('articles-badge-count');
    const commBadge = document.getElementById('comments-badge-count');

    if (!panel || !articlesList || !commentsList) return;

    // 1. Получаем токен сессии
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

        // 🔥 СУВЕРЕННЫЙ ЖЕСТКИЙ ФАЙРВОЛ: Считываем имя из метаданных базы данных
    const currentAdminName = session.user.user_metadata?.display_name || session.user.user_metadata?.name || session.user.email.split('@')[0] || 'Аноним';

    // 🔥 ФИКС СИНИОРА: Убрали .toLowerCase()! Врубили точное регистрозависимое совпадение!
    // Теперь пустит ТОЛЬКО маленькую "kapibara". Любые большие буквы вызовут блок панели!
    if (currentAdminName !== 'kapibara') {
        panel.style.display = 'none';
        return;
    }

    // Открываем пульт админа! Проверка пройдена символ в символ!
    panel.style.display = 'block';


    try {
        // 2. ВЫСОКОНАГРУЖЕННЫЙ ПАРАЛЛЕЛЬНЫЙ ЗАПРОС К ДВУМ КАНТУРАМ КАРАНТИНА
        const [resPosts, resComments] = await Promise.all([
            fetch('https://pro-info-api.onrender.com/api/admin/unapproved-posts', { headers: { 'Authorization': `Bearer ${session.access_token}` } }),
            fetch('https://pro-info-api.onrender.com/api/admin/unapproved', { headers: { 'Authorization': `Bearer ${session.access_token}` } })
        ]);

        const unapprovedPosts = await resPosts.json();
        window.currentUnapprovedCache = await resComments.json();

        // Общий счетчик нарушителей для главного баджа
        const totalAlerts = (unapprovedPosts?.length || 0) + (window.currentUnapprovedCache?.length || 0);
        if (totalAlerts > 0) {
            globalBadge.style.display = 'inline-block';
            globalBadge.innerText = totalAlerts;
        } else {
            globalBadge.style.display = 'none';
        }

        // =========================================================================
        // РЕНДЕР КОНТУРА №1: СТАТЬИ (АРТИКЛЫ)
        // =========================================================================
        if (!unapprovedPosts || unapprovedPosts.length === 0) {
            artBadge.style.display = 'none';
            articlesList.innerHTML = '<p style="color: #28a745; font-size: 14px; font-weight: bold; margin: 0;">🏆 Нет новых статей на проверку. Вёрстка чиста!</p>';
        } else {
            artBadge.style.display = 'inline-block';
            artBadge.innerText = unapprovedPosts.length;

            articlesList.innerHTML = unapprovedPosts.map(p => `
                <div style="background: #fafafa; border: 1px solid rgba(0,0,0,0.06); padding: 15px; border-radius: 6px; margin-bottom: 12px; position: relative;">
                    <h5 style="margin: 0 0 6px 0; font-size: 16px; color: #222; font-weight: bold;">📄 ${p.title}</h5>
                    
                    <!-- Если у статьи есть картинка - рендерим её микро-превью -->
                    ${p.image ? `<img src="${p.image}" style="max-width: 120px; max-height: 80px; border-radius: 4px; margin-bottom: 8px; display: block; border: 1px solid #eee;">` : ''}
                    
                    <p style="margin: 0 0 12px 0; color: #444; font-size: 15px; line-height: 1.4; max-height: 100px; overflow: hidden; text-overflow: ellipsis;">${p.text || p.content || ''}</p>
                    
                    <div style="display: flex; gap: 10px;">
                        <button onclick="window.executePostAction('approve', '${p.id}')" style="background: #41cfff; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; transition: 0.2s;" onmouseover="this.style.background='#007bff'" onmouseout="this.style.background='#41cfff'">Одобрить статью 👍</button>
                        <button onclick="window.executePostAction('delete', '${p.id}')" style="background: #ff4d4d; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px; transition: 0.2s;" onmouseover="this.style.background='#cc0000'" onmouseout="this.style.background='#ff4d4d'">Удалить 🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        // =========================================================================
        // РЕНДЕР КОНТУРА №2: КОММЕНТАРИИ (Группировка по постам-аккордеонам)
        // =========================================================================
        if (!window.currentUnapprovedCache || window.currentUnapprovedCache.length === 0) {
            commBadge.style.display = 'none';
            commentsList.innerHTML = '<p style="color: #28a745; font-size: 14px; font-weight: bold; margin: 0;">🏆 Нет новых комментариев на проверку.</p>';
            return;
        }

        commBadge.style.display = 'inline-block';
        commBadge.innerText = window.currentUnapprovedCache.length;

        const uniquePostsMap = {};
        window.currentUnapprovedCache.forEach(c => {
            if (!uniquePostsMap[c.post_id]) {
                uniquePostsMap[c.post_id] = {
                    id: c.post_id,
                    title: c.post_title || `Статья ID: ${c.post_id.slice(0, 8)}...`,
                    count: 0
                };
            }
            uniquePostsMap[c.post_id].count++;
        });

        commentsList.innerHTML = Object.values(uniquePostsMap).map(p => `
            <div onclick="window.openModModal('${p.id}', '${p.title}')" 
                 style="background: #fafafa; border: 1px solid rgba(0,0,0,0.06); padding: 12px; border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: 0.2s;"
                 onmouseover="this.style.borderColor='#41cfff'; this.style.background='#fcfcfc';" onmouseout="this.style.borderColor='rgba(0,0,0,0.06)'; this.style.background='#fafafa';">
                <span style="font-size: 15px; font-weight: bold; color: #222;">📄 ${p.title}</span>
                <span style="background: #41cfff; color: white; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 12px;">${p.count} коммент.</span>
            </div>
        `).join('');

    } catch (err) {
        console.error("Сбой пульта управления Капибары:", err);
    }
};

// 3. УПРАВЛЕНИЕ СТАТЬЯМИ (ОДОБРЕНИЕ / УДАЛЕНИЕ)
window.executePostAction = async function (action, postId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
        if (action === 'approve') {
            const response = await fetch(`https://pro-info-api.onrender.com/api/posts/approve/${postId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            if (!response.ok) throw new Error("Ошибка сервера при аппруве статьи");
            Swal.fire("Статья выпущена! 📄👍", "Пост официально задеплоен на главную страницу сайта!", "success");
        } else if (action === 'delete') {
            const { error } = await supabase.from('articles').delete().eq('id', postId);
            if (error) throw error;
            Swal.fire("Уничтожено! 🗑️", "Статья навсегда стерта из базы данных Supabase.", "success");
        }

        window.checkAdminProfile(); // Мгновенный ререндер интерфейса
    } catch (err) {
        Swal.fire("Ошибка действия над статьей", err.message, "error");
    }
};

// 4. ОТКРЫТИЕ МОДАЛКИ С КОММЕНТАМИ К КОНКРЕТНОМУ ПОСТУ
window.openModModal = function (postId, postTitle) {
    const modal = document.getElementById('mod-comment-modal');
    const modalTitle = document.getElementById('modal-post-title');
    const stream = document.getElementById('modal-comments-stream');
    if (!modal || !stream) return;

    modalTitle.innerText = `Модерация комментов: ${postTitle}`;
    const postComments = window.currentUnapprovedCache.filter(c => c.post_id === postId);

    if (postComments.length === 0) {
        window.closeModModal();
        window.checkAdminProfile();
        return;
    }

    stream.innerHTML = postComments.map(c => `
        <div style="background: #fcfcfc; border: 1px solid #ececec; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <b style="color: #333; font-size: 14px;">👤 ${c.user_name}</b>
                <small style="color: #999; font-size: 11px;">${new Date(c.created_at).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</small>
            </div>
            <p style="margin: 0 0 12px 0; color: #222; font-size: 16px; line-height: 1.4;">${c.content || c.text}</p>
            <div style="display: flex; gap: 10px;">
                <button onclick="window.executeAdminAction('approve', '${c.id}', '${postId}', '${postTitle}')" style="background: #41cfff; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px;">Одобрить 👍</button>
                <button onclick="window.executeAdminAction('delete', '${c.id}', '${postId}', '${postTitle}')" style="background: #ff4d4d; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px;">Удалить 🗑️</button>
            </div>
        </div>
    `).join('');
    modal.style.display = 'flex';
};

window.closeModModal = function () {
    const modal = document.getElementById('mod-comment-modal');
    if (modal) modal.style.display = 'none';
};

// =========================================================================
// 5. ДЕЙСТВИЯ НАД КОММЕНТАМИ ВНУТРИ МОДАЛКИ (ОДОБРЕНИЕ / УДАЛЕНИЕ)
// =========================================================================
window.executeAdminAction = async function (action, commentId, postId, postTitle) {
    // 1. Вытаскиваем токен сессии Капибары
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
        let response;
        if (action === 'approve') {
            // 🔥 ЖЕСТКИЙ ФИКС: Точно прописали /api/ перед comments/approve!
            // Передаем токен Bearer в заголовках Headers для верификации на сервере Express
            response = await fetch(`https://pro-info-api.onrender.com/api/comments/approve/${commentId}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}` 
                }
            });
            
            // Если бэкенд выплюнул ошибку (например, ты вошел не под Капибарой)
            if (response.status === 403) throw new Error("У вас нет прав админа Капибары! 🛑");
            if (!response.ok) throw new Error("Ошибка сервера при одобрении");
            
        } else if (action === 'delete') {
            // Уничтожаем коммент напрямую через клиент Supabase
            // Ядерный каскад на уровне базы автоматически сотрет все ответы на него!
            const { error } = await supabase.from('comments').delete().eq('id', commentId);
            if (error) throw error;
        }

        // 2. РЕАКТИВНЫЙ АПДЕЙТ ИНТЕРФЕЙСА БЕЗ МОРГАНИЯ ЭКРАНА
        // На лету вырезаем отработанный комментарий из локального кэша фронтенда
        window.currentUnapprovedCache = window.currentUnapprovedCache.filter(c => c.id != commentId);
        
        // Перерисовываем модальное окно для этого поста, чтобы список обновился мгновенно!
        window.openModModal(postId, postTitle);
        
    } catch (err) {
        Swal.fire("Ошибка действия над комментарием", err.message, "error");
    }
};
// Вставляй этот бронебойный триггер в самый-самый конец файла staty.js:
document.addEventListener("DOMContentLoaded", () => {
    // Проверяем, что глобальный объект supabase уже точно инициализирован в памяти!
    if (window.supabase && typeof window.checkAdminProfile === "function") {
        window.checkAdminProfile();
    } else {
        // Страховка: если render.js еще грузится, даем микро-таймаут в 100 миллисекунд
        setTimeout(() => {
            if (typeof window.checkAdminProfile === "function") window.checkAdminProfile();
        }, 100);
    }
});
