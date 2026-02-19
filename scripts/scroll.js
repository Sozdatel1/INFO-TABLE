window.addEventListener('scroll', () => {
    const progress = document.getElementById("scrollProgress");
    if (!progress) return;

    // Считаем, сколько прокручено в процентах
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;

    // Обновляем ширину полоски
    progress.style.width = scrolled + "%";
});
