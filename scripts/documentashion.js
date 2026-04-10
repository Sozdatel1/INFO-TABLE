const doc = document.getElementById('doc')


export function why(event) {
  const buttons = document.querySelectorAll('.doc-btn');
  
  // 1. Убираем активный класс у всех
  buttons.forEach(btn => btn.classList.remove('active'));

  // 2. Логика подсветки
  if (event && event.currentTarget) {
    // Если нажали вручную
    event.currentTarget.classList.add('active');
  } else if (buttons.length > 0) {
    // Если вызвали при загрузке (main.js) — подсвечиваем первую кнопку
    buttons[0].classList.add('active'); 
  }
  doc.innerHTML = `
     <h1>О чём этот сайт?</h1>
        
        <p>Добро пожаловать на iPosters - это сервис для публикации статей и их обсуждения.</p>
        <h2>Основные возможности сайта:</h2>
        <ul>
          <li>Публикация статей</li>
          <li>Комментирование статей</li>
          <li>Реакции под статьями</li>
          <li>Возможность удалять и редактировать СВОИ статьи</li>
        </ul>
        <h3>&#9664;    Чтобы уточнить свои вопросы или пройти короткую экскурсию по сайту, выберите пункт который вас интересует</h3>
    `
}
window.why = why;

// -------------------------------------------------

export function nachalo(event) {
  const buttons = document.querySelectorAll('.doc-btn');
  
  // 1. Убираем активный класс у всех
  buttons.forEach(btn => btn.classList.remove('active'));

  // 2. Логика подсветки
  if (event && event.currentTarget) {
    // Если нажали вручную
    event.currentTarget.classList.add('active');
  } else if (buttons.length > 0) {
    // Если вызвали при загрузке (main.js) — подсвечиваем первую кнопку
    buttons[0].classList.add('active'); 
  }
  doc.innerHTML = `
    <h1>Начало работы на iPosters</h1>
        <hr style="background-color: #000000 !important; width: 100%;">
        <p>Зайдя на iPosters, вы няверняка задумались - "что мне тут делать?"</p>
        <p>Чтобы на iPosters вы почувствовали себя как дома, зарегистрируйтесь и вы сможете комментировать чужие статьи, создавать и удалять свои статьи.</p>
        <h2>
          Как мне зарегистрироваться?
        </h2>
        <hr style="background-color: #000000 !important; width: 100%;">
        <p>Чтобы зарегистрироваться, вам нужно нажать на кнопку "Войти находящуюся в верхней части экрана"</p>
        <img src="/img/Снимок.PNG" width="100%">
        <hr style="background-color: #000000 !important; width: 100%;">
        <p>Затем, во всплывшем окне нажмите на текст "Создать аккаунт" и заполните поля "Ник" и "Пароль", при том в строчке "Пароль" должно быть не менее 6 символов.</p>
        <img src="/img/Снимок2.PNG" width="100%">
        <p>Если вы сделали всё правильно, нажмите кнопку "Создать аккаунт"</p>
        <p>Страница автоматически обновится и вы увидите название своего аккаунта на том месте, где была кнопка "Войти"</p>
    
    `
}
window.nachalo = nachalo;

// -----------------------------------------------------------------------------------------------

export function stat(event) {
  const buttons = document.querySelectorAll('.doc-btn');
  
  // 1. Убираем активный класс у всех
  buttons.forEach(btn => btn.classList.remove('active'));

  // 2. Логика подсветки
  if (event && event.currentTarget) {
    // Если нажали вручную
    event.currentTarget.classList.add('active');
  } else if (buttons.length > 0) {
    // Если вызвали при загрузке (main.js) — подсвечиваем первую кнопку
    buttons[0].classList.add('active'); 
  }
  doc.innerHTML = `
    <h1>Как мне опубликовать свою статью на iPosters?</h1>
        <hr style="background-color: #000000 !important; width: 100%;">
        <p>Вы можете опубликовать свою статью как на <a href="/index.html">главной странице</a>, так и в <a href="/profile.html">личном кабинете</a></p>
        <p>Для этого заполните поля "Заголовок статьи" и "Текст статьи" и по желанию "Ссылка на картинку статьи" и нажмите кнопку "Опубликовать".&#9660; </p>
        <img src="/img/Снимок3.PNG" width="100%">
        <p>	&#9664; Если всплыло окно входа, то действуйте инструкциям в разделе документации "Как мне зарегистрироваться на iPosters?"</p>
    
    `
}
window.stat = stat;

