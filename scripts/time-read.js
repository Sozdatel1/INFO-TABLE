export function calculateReadingTimeStat() {
    const article = document.getElementById('artText'); // <--- Обновили здесь
    const display = document.getElementById('read-time');

    console.log("Элемент статьи:", article); 

    if (!article || !display) return false;

    const text = article.innerText.trim();
    console.log("Длина текста:", text.length);

    if (text.length > 0) {
        const wordsCount = text.split(/\s+/).length;
        const minutes = Math.ceil(wordsCount / 180);
        display.innerText = `Время на чтение: ${minutes} мин.`;
        return true;
    }
    return false;
}
