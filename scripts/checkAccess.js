//  Эта функция проверяет залогин ли ты в кабинете разработчика, если да , показывает кабинет, если нет, то ведет на страницу входа. А также она выходит и стирает куки. ОН ПОДКЛЮЧАЕТСЯ К ФАЙЛУ КАБИНЕТА И ПРОВЕРЯЕТ НА УСЛОВИЯ ВЫШЕ.
 
    async function checkAccess() {
    try {
        const res = await fetch('https://pro-info-api.onrender.com/api/check', { 
            credentials: 'include' 
        });

        if (res.ok) {
            const result = await res.json();
            // Выводим данные в консоль для теста
            console.log("Ответ сервера:", result);
            
            // Заполняем поле data
            document.getElementById('secretData').innerText = result.data || "Нет данных";
            document.getElementById('content').style.display = 'block';
        } else {
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error("Ошибка сети:", err);
    }
}

async function logout() {
    try {
        // 1. Просим сервер стереть куку (добавь ПУТЬ /api/logout)
        await fetch('https://pro-info-api.onrender.com/api/logout', { 
            credentials: 'include' 
        });
    } catch (e) {
        console.log("Сервер не ответил, но выходим принудительно");
    }
    
    // 2. Очищаем локальную метку (если ты её создавал)
    localStorage.removeItem('isAuth'); 
    // Если в login.html ты назвал её иначе, например 'logged_in', удаляй её.

    // 3. Уходим на главную или страницу входа
    window.location.href = 'index.html';
    

 
}

checkAccess();