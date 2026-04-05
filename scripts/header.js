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

        
            
            
        </ul>
       

    </nav>


<!-- Кнопка "Войти" (по умолчанию видна) -->
<button id="login-btn" onclick="openAuthModal()">Войти</button>

<!-- Кнопка "Профиль" (по умолчанию скрыта) -->
<button id="profile-btn" style="display: none; width: 90%; background: #ff4d4d00; color: rgb(0, 0, 0); border: none; padding: 8px;  font-size: 17px; border-radius: 4px; cursor: pointer; text-align: left;"><a href="profile.html"
                            style="color: #000000; text-decoration: none;  background-color: #41d0ff00;"  onclick="goToProfile()">Профиль</button>


<li class="profile-bth"
            style="margin-left: auto !important; position: relative; list-style: none; background:#41cfff !important; box-shadow: 0 4px 15px rgba(65, 207, 255, 0.4); padding: 1px; border-radius: 30px; display: none;">
            <a href="#" id="profile-trigger"
                style="text-decoration: none; font-weight: bold; padding: 10px; display: block; color: rgb(255, 251, 232); margin-left: auto !important; right: 0 !important;">
                <span id="username-display" style="margin-left: auto !important; font-size: 22px;">Загрузка...</span>
                <!-- Ник будет здесь -->
            </a>

            <!-- Выпадающее меню -->
            <ul id="profile-menu"
                style="display: none; position: absolute; top: 100%; left: 0; background: #ffffff; min-width: 220px; box-shadow: 0 4px 10px rgba(0,0,0,0.2); padding: 15px; border-radius: 8px; z-index: 1000; list-style: none;">
                <li style="margin-bottom: 1px;">
                    <button style="width: 90%; background: #ff4d4d00; color: rgb(0, 0, 0); border: none; padding: 8px;  font-size: 17px; border-radius: 4px; cursor: pointer; text-align: left;"><a href="profile.html"
                            style="color: #000000; text-decoration: none;  background-color: #41d0ff00;">Профиль</a></button>
                </li>
                <hr>
                <li style="margin-bottom: 1px;">
                    <button onclick="logoutUser()"
                        style="width: 90%; background: #ff4d4d00; color: rgb(0, 0, 0); border: none; padding: 8px;  font-size: 17px; border-radius: 4px; cursor: pointer; text-align: left;">Выйти</button>
                </li>
                <hr>
                <li>
                    <button onclick="deleteMyAccount()"
                        style="width: 90%; background: #ffffff00; color: rgb(0, 0, 0); border: none; padding: 8px;  text-align: left;  border-radius: 4px; cursor: pointer; font-size: 17px;">Удалить
                        аккаунт</button>
                </li>
            </ul>
        </li>


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



document.addEventListener('click', (e) => {
    const trigger = document.getElementById('profile-trigger');
    const menu = document.getElementById('profile-menu');

    // 1. Если нажали на ник — переключаем меню
    if (e.target === trigger || trigger.contains(e.target)) {
        e.preventDefault();
        const isHidden = menu.style.display === 'none' || menu.style.display === '';
        menu.style.display = isHidden ? 'block' : 'none';
    } 
    // 2. Если нажали в любое другое место — закрываем меню
    else if (menu && !menu.contains(e.target)) {
        menu.style.display = 'none';
    }
});


