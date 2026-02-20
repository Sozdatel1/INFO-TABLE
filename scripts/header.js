const header = document.getElementById('header')
if (header) {
    header.innerHTML = `

<header class="header-content">


<div class="logo">
    <a href="index.html">
        <img src="/img/IT.png?v=777" class="logo-icon">
        <div class="logo-text"> <!-- ОБЕРТКА ДЛЯ СЛОВ -->
            <span class="logo-neon">INFO</span>TABLE
        </div>
    </a>
</div>




 <div class="nav-divider"></div> <!-- ВОТ ОНА -->

    <!-- Кнопка бургер (появится на моилах) -->
    <button class="menu-toggle" id="menuToggle" aria-label="Открыть меню">
        <span></span>
    </button>

    <nav class="dropdown-menu" id="headerNav">
        <ul>
            <li><a href="index.html"><img src="/img/images (1)-Photoroom.png" width="21"></a></li>
            
            <li class="dropdown">
                <div class="dropdown-link-wrapper">
                    
                </div>
            
            </li>

        
            <li class="dropdown">
                <div class="dropdown-link-wrapper">
                    <a href="#">Разработчик</a>
                    
                </div>
                <ul class="dropdown-content">
                    
                    <li><a href="https://github.com/Sozdatel1">Github</a></li>
                    <li><a href="https://github.com/Sozdatel1/Sozdatel1.github.io">Исходный код</a></li>
                </ul>
            </li>
            
        </ul>
       

    </nav>






<div id="scrollProgress"></div>
</header>

`
}
document.addEventListener('DOMContentLoaded', () => {
    let lastScrollTop = 0;
    const header = document.querySelector('.header-content');

    // Порог срабатывания (через сколько пикселей скролла прятать хедер)
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        // Текущее расстояние от верха страницы
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Логика направления
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            // Скролл вниз — добавляем класс скрытия
            header.classList.add('header--hidden');
        } else {
            // Скролл вверх — убираем класс скрытия
            header.classList.remove('header--hidden');
        }

        // Запоминаем позицию для следующего шага
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true }); // passive: true повышает плавность скролла
});


