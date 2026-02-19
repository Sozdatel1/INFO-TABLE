const API_URL = "https://pro-info-api.onrender.com";
let myPass = localStorage.getItem('chat_pass') || '';
// if(API_URL) {
// Функция загрузки чата
async function loadChat() {
    if (!myPass) return; // Если пароля нет, ничего не делаем

    const res = await fetch(`${API_URL}/get-msgs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass: myPass })
    });


    // ЕСЛИ ПАРОЛЬ ПРАВИЛЬНЫЙ ПРИ ВХОДЕ В ЧАТ
    
    if (res.ok) {
        const msgs = await res.json();
        document.getElementById('login-ui').style.display = 'none';
        document.getElementById('chat-ui').style.display = 'block';

        const box = document.getElementById('msg-box');
        box.innerHTML = msgs.map(m => {
            const goldClass = m.author === "Главный разработчик" ? "gold-admin" : "";
            const reactions = m.reactions || {};
            const reactionsHtml = Object.entries(reactions)
                .map(([emo, count]) => `<span class="reaction-badge">${emo} ${count}</span>`)
                .join('');
            return `
        <div class="message-item">
            <div class="msg-info">
            <b class="${goldClass}">${m.author || "Аноним"}</b>
            <small>${m.time}</small>
            <span class="tooltip">
                <span class="delete-btn" onclick='deleteMsg(${JSON.stringify(m)})'>×</span>
                
            <span class="tooltiptext">УДАЛИТЬ</span>
            </span>
            </div>
        <div class="msg-text">${m.text}</div>
        
        </div>`;
        }).join('');
        box.scrollTop = box.scrollHeight;
        localStorage.setItem('chat_pass', myPass);


        // ЕСЛИ ПАРОЛЬ НЕПРАВИЛЬНЫЙ

    } else {
        if (myPass) Swal.fire({
            title: "Неправильный пароль!",
            icon: "error",
            draggable: true
        });
        localStorage.removeItem('chat_pass');
    }
}


// Отправка сообщения
async function send() {
    const ipt = document.getElementById('msg-input');
    if (!ipt.value.trim()) return;

    await fetch(`${API_URL}/add-msg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pass: myPass, text: ipt.value,
            author: localStorage.getItem('chat_name')
        })
    });
    ipt.value = '';
    loadChat();
}

// Кнопка входа
window.login = function () {
    const pinput = document.getElementById('pass-input');
    const ninput = document.getElementById('name-input');
    if (pinput && ninput) {
        myPass = pinput.value.trim(); // Добавили trim, чтобы не было ошибок из-за пробелов
        const name = ninput.value.trim() || "Аноним:";
        localStorage.setItem('chat_pass', myPass);
        localStorage.setItem('chat_name', name); // Сохраняем имя отдельно
        console.log("Пытаемся войти с паролем:", myPass);
        loadChat();
    } else {
        console.error("Поле pass-input не найдено в HTML!");
    }
}

window.deleteMsg = async function (msgData) {
    if (!confirm("Удалить это сообщение?")) return;

    const res = await fetch(`${API_URL}/delete-msg`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pass: myPass,
            msgData: msgData
        })
    });

    if (res.ok) {
        loadChat(); // Обновляем чат после удаления
    } else {
        alert("Ошибка при удалении");
    }
}


// СКРЫТИЕ И ПОКАЗ ПАРОЛЯ ПРИ ВВОДЕ В ВХОДЕ В ЧАТ

window.togglePass = function () {
    const passInput = document.getElementById('pass-input');
    const toggleIcon = document.getElementById('toggle-pass');

    if (passInput.type === "password") {
        passInput.type = "text";
        toggleIcon.textContent = "🙈"; // Меняем иконку на закрытый замок или другой глаз
    } else {
        passInput.type = "password";
        toggleIcon.textContent = "👁️";
    }
    passInput.focus();
}


// Запуск при открытии страницы
loadChat();

