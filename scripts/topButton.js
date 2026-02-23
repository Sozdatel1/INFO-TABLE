window.onscroll = function() {
    const btn = document.getElementById("toTopBtn");
    // Если прокрутили больше 400 пикселей вниз
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 400) {
        btn.classList.add("show");
    } else {
        btn.classList.remove("show");
    }
};

function scrollToTop() {
    const startPos = window.pageYOffset || document.documentElement.scrollTop;
    const duration = 2000; // 2 секунды (измени на 3000, если хочешь ещё медленнее)
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        
        // Математическая функция "плавного старта и стопа" (easeInOutCubic)
        const run = easeInOutCubic(timeElapsed, startPos, -startPos, duration);
        
        window.scrollTo(0, run);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    // Формула для мягкого движения
    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    requestAnimationFrame(animation);
}
