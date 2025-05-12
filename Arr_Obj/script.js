const incomeRadio = document.getElementById('incomeRadio');
const expenseRadio = document.getElementById('expenseRadio');

const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');

// Функция для скрытия и отображения форм
function toggleForm() {
    incomeForm.style.display = incomeRadio.checked ? 'block' : 'none';
    expenseForm.style.display = expenseRadio.checked ? 'block' : 'none';
}

// Обработчики событий для радиокнопок
incomeRadio.addEventListener('change', toggleForm);
expenseRadio.addEventListener('change', toggleForm);


// Обработчик отправки формы доходов
incomeForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const type = document.getElementById('incomeType');
    const selectedText = type.options[type.selectedIndex].text;
    const amount = (document.getElementById('incomeAmount').value);



    if (isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, введите корректную сумму дохода.');
        return;
    }

    // Здесь можно добавить логику для сохранения данных о доходе
    console.log('Доход:', type, amount);
    let incomeObj = { selectedText, amount }

    // Получаем существующий массив доходов из localStorage (если есть)
    let incomes = localStorage.getItem('incomeObj');

    incomes = incomes ? JSON.parse(incomes) : [];
    // Добавляем новый объект дохода в массив
    incomes.push(incomeObj);

    localStorage.setItem('incomeObj', JSON.stringify(incomes)); 



    // Очищаем поля формы после добавления
    document.getElementById('incomeAmount').value = '';
});


function getIncomesFromLocalStorage() {
    const incomesString = localStorage.getItem('incomeObj');
    return incomesString ? JSON.parse(incomesString) : [];
}

const allIncomes = getIncomesFromLocalStorage();
console.log('Все доходы:', allIncomes);




// Обработчик отправки формы расходов
expenseForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Предотвращаем стандартную отправку формы

    const type = document.getElementById('expenseType').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);

    if (isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, введите корректную сумму расхода.');
        return;
    }

    // Здесь можно добавить логику для сохранения данных о расходе
    console.log('Расход:', type, amount);

    // Очищаем поля формы после добавления
    document.getElementById('expenseAmount').value = '';
});