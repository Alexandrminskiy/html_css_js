// Глобальная переменная для хранения текущего типа категории (доход/расход)
let currentCategoryType = 'income';

// Ждем полной загрузки DOM перед выполнением скриптов
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Инициализируем базу данных
        await initDB();
        
        // Загружаем категории в выпадающие списки
        await loadCategories();
        
        // Настраиваем все обработчики событий
        setupEventListeners();
        
        // Загружаем и отображаем транзакции
        await displayTransactions();
        
    } catch (error) {
        console.error('Ошибка при загрузке приложения:', error);
        alert('Произошла ошибка при загрузке приложения. Пожалуйста, перезагрузите страницу.');
    }
});

/**
 * Загружает категории из базы данных и заполняет выпадающие списки
 */
async function loadCategories() {
    try {
        // Получаем категории для доходов и расходов одновременно
        const [incomeCategories, expenseCategories] = await Promise.all([
            getCategories('income'),
            getCategories('expense')
        ]);
        
        // Заполняем соответствующие select-элементы
        fillSelect('incomeType', incomeCategories);
        fillSelect('expenseType', expenseCategories);
        
    } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        alert('Не удалось загрузить категории');
    }
}

/**
 * Заполняет выпадающий список категориями
 * @param {string} selectId - ID элемента select
 * @param {Array} categories - Массив категорий в формате {value: 'код', text: 'Название'}
 */
function fillSelect(selectId, categories) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`Элемент с ID ${selectId} не найден`);
        return;
    }
    
    // Очищаем список и добавляем новые варианты
    select.innerHTML = categories.map(cat => 
        `<option value="${cat.value}">${cat.text}</option>`
    ).join('');
}

/**
 * Настраивает все обработчики событий
 */
function setupEventListeners() {
    // Обработчики для переключателя доход/расход
    document.querySelectorAll('input[name="balance"]').forEach(radio => {
        radio.addEventListener('change', function() {
            currentCategoryType = this.value;
            toggleTransactionType();
        });
    });
    
    // Обработчики отправки форм
    document.getElementById('incomeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleTransactionSubmit('income');
    });
    
    document.getElementById('expenseForm').addEventListener('submit', (e) => {
        e.preventDefault();
        handleTransactionSubmit('expense');
    });
    
    // Кнопки добавления категорий
    document.getElementById('addIncomeCategory').addEventListener('click', () => {
        showCategoryModal('income');
    });
    
    document.getElementById('addExpenseCategory').addEventListener('click', () => {
        showCategoryModal('expense');
    });
    
    // Кнопки модального окна
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
    document.getElementById('cancelCategoryBtn').addEventListener('click', hideCategoryModal);
    
    // Кнопка обновления списка транзакций
    document.getElementById('refreshBtn').addEventListener('click', displayTransactions);
}

/**
 * Переключает видимость форм доходов/расходов
 */
function toggleTransactionType() {
    const isIncome = currentCategoryType === 'income';
    
    // Показываем нужную форму и скрываем другую
    document.getElementById('incomeForm').style.display = isIncome ? 'block' : 'none';
    document.getElementById('expenseForm').style.display = isIncome ? 'none' : 'block';
}

/**
 * Обрабатывает добавление новой транзакции (доход/расход)
 * @param {string} type - Тип транзакции ('income' или 'expense')
 */
async function handleTransactionSubmit(type) {
    const amountInput = document.getElementById(`${type}Amount`);
    const typeSelect = document.getElementById(`${type}Type`);
    
    // Проверяем, что введена корректная сумма
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, введите корректную сумму (больше 0)');
        return;
    }
    
    // Создаем объект транзакции
    const transaction = {
        category: type,
        type: typeSelect.options[typeSelect.selectedIndex].text,
        amount: type === 'income' ? amount : -amount, // Расходы сохраняем с минусом
        date: new Date().toISOString() // Сохраняем дату в стандартном формате
    };
    
    try {
        // Добавляем транзакцию в базу данных
        await addTransaction(transaction);
        
        // Очищаем поле ввода суммы
        amountInput.value = '';
        
        // Обновляем список транзакций
        await displayTransactions();
        
    } catch (error) {
        console.error('Ошибка при добавлении транзакции:', error);
        alert('Не удалось добавить транзакцию. Попробуйте снова.');
    }
}

/**
 * Отображает список всех транзакций
 */
async function displayTransactions() {
    try {
        // Получаем все транзакции из базы данных
        const transactions = await getAllTransactions();
        const output = document.getElementById('transactionsOutput');
        
        if (!output) {
            console.error('Элемент для вывода транзакций не найден');
            return;
        }
        
        // Сортируем транзакции по дате (новые сверху)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Рассчитываем итоговые суммы
        const summary = calculateSummary(transactions);
        
        // Генерируем HTML и выводим на страницу
        output.innerHTML = generateTransactionsHTML(transactions, summary);
        
    } catch (error) {
        console.error('Ошибка при загрузке транзакций:', error);
        alert('Не удалось загрузить транзакции');
    }
}

/**
 * Рассчитывает итоговые суммы доходов, расходов и баланс
 * @param {Array} transactions - Массив транзакций
 * @returns {Object} - Объект с суммами {income, expense, balance}
 */
function calculateSummary(transactions) {
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(trans => {
        if (trans.amount > 0) {
            totalIncome += trans.amount;
        } else {
            totalExpense += Math.abs(trans.amount);
        }
    });
    
    return {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
    };
}

/**
 * Генерирует HTML для отображения транзакций
 * @param {Array} transactions - Массив транзакций
 * @param {Object} summary - Итоговые суммы
 * @returns {string} - HTML-код для вставки на страницу
 */
function generateTransactionsHTML(transactions, summary) {
    // Форматируем дату для отображения
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU');
    };
    
    // Генерируем HTML для итоговых сумм
    let html = `
        <div class="summary">
            <div class="summary-item">
                <span>Доходы:</span>
                <span class="positive">+${summary.income.toFixed(2)} ₽</span>
            </div>
            <div class="summary-item">
                <span>Расходы:</span>
                <span class="negative">-${summary.expense.toFixed(2)} ₽</span>
            </div>
            <div class="summary-item balance">
                <span>Баланс:</span>
                <span class="${summary.balance >= 0 ? 'positive' : 'negative'}">
                    ${summary.balance >= 0 ? '+' : ''}${summary.balance.toFixed(2)} ₽
                </span>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Категория</th>
                    <th>Тип</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Добавляем строки таблицы для каждой транзакции
    transactions.forEach(trans => {
        const isIncome = trans.amount >= 0;
        const rowClass = isIncome ? 'income-row' : 'expense-row';
        const amountClass = isIncome ? 'positive' : 'negative';
        const amountSign = isIncome ? '+' : '-';
        const absoluteAmount = Math.abs(trans.amount);
        
        html += `
            <tr class="${rowClass}">
                <td>${trans.type}</td>
                <td>${isIncome ? 'Доход' : 'Расход'}</td>
                <td class="${amountClass}">${amountSign}${absoluteAmount.toFixed(2)} ₽</td>
                <td>${formatDate(trans.date)}</td>
            </tr>
        `;
    });
    
    html += `</tbody></table>`;
    return html;
}

/**
 * Показывает модальное окно для добавления категории
 */
function showCategoryModal(type) {
    currentCategoryType = type;
    const modal = document.getElementById('categoryModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    document.getElementById('newCategoryName').focus();
}

/**
 * Скрывает модальное окно
 */
function hideCategoryModal() {
    const modal = document.getElementById('categoryModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    document.getElementById('newCategoryName').value = '';
}
/**
 * Сохраняет новую категорию в базу данных
 */
async function saveCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput.value.trim();
    
    // Проверяем, что введено название
    if (!name) {
        alert('Введите название категории');
        return;
    }
    
    // Создаем объект новой категории
    const newCategory = {
        value: name.toLowerCase().replace(/\s+/g, '_'), // Формируем значение (без пробелов)
        text: name // Отображаемое название
    };
    
    try {
        // Получаем текущие категории этого типа
        const categories = await getCategories(currentCategoryType);
        
        // Проверяем, что такой категории еще нет
        if (categories.some(cat => cat.value === newCategory.value)) {
            alert('Такая категория уже существует!');
            return;
        }
        
        // Добавляем новую категорию и сохраняем
        categories.push(newCategory);
        await updateCategories(currentCategoryType, categories);
        
        // Обновляем выпадающий список
        await loadCategories();
        
        // Закрываем модальное окно
        hideCategoryModal();
        
    } catch (error) {
        console.error('Ошибка при сохранении категории:', error);
        alert('Не удалось сохранить категорию');
    }
}