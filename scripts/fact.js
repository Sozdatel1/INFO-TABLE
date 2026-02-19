const facts = [
    "К 2026 году Python останется самым популярным языком для обучения нейросетей.",
    "Весь интернет весит примерно 50 грамм — как одна большая клубника.",
    "Первый компьютерный баг был реальным мотыльком, застрявшим в реле компьютера.",
    "В 2025 году более 5 миллиардов человек по всему миру подключены к интернету.",
    "В Монако мобильных телефонов больше, чем реальных жителей.",
    "Символ @ в разных странах называют 'собакой', 'улиткой' и даже 'слоновьим хоботом'.",
    "Каждый день в мире создается более 2.5 квинтиллионов байт данных.",
    "Первый домен в истории интернета — symbolics.com — был зарегистрирован в 1985 году."
];

function showNextFact() {
    const factElement = document.getElementById('random-fact');
    if (!factElement) return;

    // Выбираем рандомный индекс из массива
    const randomIndex = Math.floor(Math.random() * facts.length);
    
    // Плавная смена текста
    factElement.style.opacity = 0;
    setTimeout(() => {
        factElement.innerText = facts[randomIndex];
        factElement.style.opacity = 1;
    }, 300);
}

// Показываем первый факт сразу при загрузке
document.addEventListener('DOMContentLoaded', showNextFact);
