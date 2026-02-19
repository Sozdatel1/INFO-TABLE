// ЭТА ФУНКЦИЯ ПРОВЕРЯЕТ КОГДА НАЖИМАЕШЬ НА КНОПКУ КАБИНЕТ НА СТРАНИЦЕ, ЗАРЕГАН ЛИ ТЫ НА САЙТЕ В КАБИНЕТЕ ИЛИ НЕТ

window.onload = function() {
const cabinetBtn = document.getElementById('cabinetBtn');
if (cabinetBtn) {
cabinetBtn.onclick = async function(e) {
    e.preventDefault();
    
    // 1. Сразу даем понять, что процесс идет
    const originalText = cabinetBtn.innerText;
    cabinetBtn.innerText = "Проверка..."; 

    try {
        const res = await fetch('https://pro-info-api.onrender.com', { 
            credentials: 'include' 
        });

        if (res.ok) {
            // Кука жива — летим в кабинет
            window.location.href = 'cabinet.html';
        } else {
            // Куки нет — на вход
            window.location.href = 'login.html';
        }
    } catch (err) {
        // Если бэк спит (ошибка сети), лучше отправить на логин
        console.error(err);
        window.location.href = 'login.html';
    } finally {
        cabinetBtn.innerText = originalText;
    }
};
}

}