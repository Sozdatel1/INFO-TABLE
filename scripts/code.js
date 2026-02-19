function runCodeCounter() {
    const counter = document.getElementById('linesCount');
    if (!counter) return;

    const target = 154320 + Math.floor(Math.random() * 500); // Базовое число + рандом
    let count = 0;
    const speed = 40; // Чем меньше, тем быстрее
    const increment = target / speed;

    const update = () => {
        count += increment;
        if (count < target) {
            counter.innerText = Math.floor(count).toLocaleString();
            setTimeout(update, 30);
        } else {
            counter.innerText = target.toLocaleString();
        }
    };
    update();
}

// Запускаем, когда страница готова
document.addEventListener('DOMContentLoaded', runCodeCounter);
