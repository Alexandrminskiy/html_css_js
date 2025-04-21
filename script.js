console.log('123');
const changeTextBtn = document.getElementById("changeTextBtn");
const introText = document.getElementById("introText");

changeTextBtn.addEventListener("click", () => {
    introText.textContent = "Теперь я знаю, как работать с событиями в JS!";
});

const themeButton = document.getElementById("themeButton");

themeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
});

let clickCount = 0;

changeTextBtn.addEventListener("click", () => {
    clickCount++;
    introText.textContent = `Кнопка нажата ${clickCount} раз(а)`;
});