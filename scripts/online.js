const RENDER_URL = 'https://pro-info-api.onrender.com';

// Подключаемся с настройками, чтобы быстрее работало через прокси
const socket = io(RENDER_URL, {
    transports: ['websocket', 'polling']
});

const counterElement = document.getElementById('online-counter');

if (counterElement) {
socket.on('updateCount', (count) => {
    counterElement.innerText = count;
    console.log('Текущий онлайн:', count);
});
}

socket.on('connect_error', (error) => {
    console.log('Ошибка подключения:', error);
    // counterElement.innerText = 'пробуждаю сервер...';
    counterElement.innerHTML = '<span class="spinner"></span>';
});

socket.on('connect', () => {
    console.log('Успешно подключено к серверу!');
});