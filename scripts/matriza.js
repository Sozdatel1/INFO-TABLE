document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('matrixCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const fontSize = 16;
    
    // Сразу объявляем переменные как пустые массивы, чтобы .length не ругался
    let columns = 0;
    let drops = [];

    function resizeCanvas() {
        // Если хочешь на весь экран — оставляй window.innerWidth
        // Если хочешь внутри блока — замени на canvas.parentElement.offsetWidth
        canvas.width = window.innerWidth; 
        canvas.height = window.innerHeight;

        columns = Math.ceil(canvas.width / fontSize);
        // Заполняем массив единицами под новое количество колонок
        drops = Array(columns).fill(1);
    }

    // Инициализация
    resizeCanvas();

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>[]{}/?+*-%#@$";

    function drawMatrix() {
        // ПРОВЕРКА: если drops почему-то пустой, выходим из функции
        if (!drops || drops.length === 0) return;

        ctx.fillStyle = "rgba(13, 17, 23, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff41";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = letters.charAt(Math.floor(Math.random() * letters.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    // Запуск цикла
    setInterval(drawMatrix, 50);

    // Слушатель ресайза
    window.addEventListener('resize', resizeCanvas);
});
