// main.js
import { loadPosts } from './render.js';
import { loadFullArticle } from './render.js';
import { loadMore } from './utils.js';
import { calculateReadingTimeStat } from './time-read.js';

// Инициализируем глобальные данные
window.allPostsData = [];
window.displayedCount = 8;

// ПРОСТО ВЫЗОВ
// ЕСЛИ НА СТРАНИЦЕ ЕСТЬ АЙДИ АРТ ТЕКСТ (СТАТЬЯ)
if (document.getElementById('artText')) {

    await loadFullArticle();
    calculateReadingTimeStat()

}

// ПРОВЕРКА: Если мы на главной (index.html)
if (document.getElementById('dynamic-cards')) {
    console.log("Загружаем ленту постов...");
    await loadPosts();

}