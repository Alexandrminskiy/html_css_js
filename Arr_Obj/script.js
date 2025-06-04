// script.js

// Импортируем функции из других файлов
import { displayAnalyticsInNewPage } from './analytics.js';

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Инициализация базы данных
        await initDB();

        // Загрузка категорий в выпадающие списки
        await loadCategories();

        // Настройка обработчиков событий
        setupEventListeners();

        // Загрузка и отображение транзакций
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
        // Получаем категории для доходов и расходов
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
 */
function fillSelect(selectId, categories) {
    const select = document.getElementById(selectId);
    if (!select) {
        console.error(`Элемент с ID ${selectId} не найден`);
        return;
    }

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
        radio.addEventListener('change', function () {
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

    // Кнопка обновления списка транзакций
    document.getElementById('refreshBtn').addEventListener('click', displayTransactions);

    // Кнопка вывода аналитики (получаем из HTML)
    const showAnalyticsBtn = document.getElementById('showAnalyticsBtn');
    showAnalyticsBtn.addEventListener('click', async () => {
        const transactions = await getAllTransactions();
        displayAnalyticsInNewPage(transactions); // Открываем в новой странице
    });
}

/**
 * Переключает видимость форм доходов/расходов
 */
function toggleTransactionType() {
    const isIncome = document.querySelector('input[name="balance"][value="income"]').checked;
    document.getElementById('incomeForm').style.display = isIncome ? 'block' : 'none';
    document.getElementById('expenseForm').style.display = isIncome ? 'none' : 'block';
}


/**
 * Обрабатывает добавление новой транзакции
 */
async function handleTransactionSubmit(type) {
    const amountInput = document.getElementById(`${type}Amount`);
    const typeSelect = document.getElementById(`${type}Type`);

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, введите корректную сумму (больше 0)');
        return;
    }

    const transaction = {
        category: type,
        type: typeSelect.options[typeSelect.selectedIndex].text,
        amount: type === 'income' ? amount : -amount,
        date: new Date().toISOString()
    };

    try {
        await addTransaction(transaction);
        amountInput.value = '';
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
        const transactions = await getAllTransactions();
        const output = document.getElementById('transactionsOutput');

        if (!output) {
            console.error('Элемент для вывода транзакций не найден');
            return;
        }

        // Сортируем транзакции по дате (новые сверху)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Генерируем HTML и выводим на страницу
        output.innerHTML = generateTransactionsHTML(transactions);

        // Настраиваем обработчики для кнопок действий
        setupTransactionActions();

    } catch (error) {
        console.error('Ошибка при загрузке транзакций:', error);
        alert('Не удалось загрузить транзакции');
    }
}

/**
 * Генерирует HTML для отображения транзакций
 */
function generateTransactionsHTML(transactions) {
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU');
    };

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Категория</th>
                    <th>Тип</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;

    transactions.forEach(trans => {
        const isIncome = trans.amount >= 0;
        const rowClass = isIncome ? 'income-row' : 'expense-row';
        const amountClass = isIncome ? 'positive' : 'negative';
        const amountSign = isIncome ? '+' : '-';
        const absoluteAmount = Math.abs(trans.amount);

        html += `
            <tr class="${rowClass}" data-id="${trans.id}">
                <td>${trans.type}</td>
                <td>${isIncome ? 'Доход' : 'Расход'}</td>
                <td class="${amountClass}">${amountSign}${absoluteAmount.toFixed(2)} ₽</td>
                <td>${formatDate(trans.date)}</td>
                <td class="actions">
                    <button class="edit-btn" data-id="${trans.id}">✏️</button>
                    <button class="delete-btn" data-id="${trans.id}">🗑️</button>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    return html;
}

/**
 * Настраивает обработчики для кнопок действий с транзакциями
 */
function setupTransactionActions() {
    // Обработчики для кнопок удаления
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
                await deleteTransaction(id);
                await displayTransactions();
            }
        });
    });

    // Обработчики для кнопок редактирования
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            await showEditTransactionModal(id);
        });
    });
}

/**
 * Показывает модальное окно для редактирования транзакции
 */
async function showEditTransactionModal(id) {
    const transaction = await getTransactionById(id);
    if (!transaction) return;

    const isIncome = transaction.amount >= 0;
    const type = isIncome ? 'income' : 'expense';
    const amount = Math.abs(transaction.amount);

    const modalHTML = `
        <div id="editTransactionModal" class="modal">
            <div class="modal-content">
                <h3>Редактирование транзакции</h3>
                <form id="editTransactionForm">
                    <input type="hidden" id="editTransactionId" value="${transaction.id}">
                    <div class="form-row">
                        <select id="editTransactionCategory" class="category-select">
                            <option value="income" ${type === 'income' ? 'selected' : ''}>Доход</option>
                            <option value="expense" ${type === 'expense' ? 'selected' : ''}>Расход</option>
                        </select>
                        <select id="editTransactionType" class="category-select">
                            ${generateCategoryOptions(type, transaction.type)}
                        </select>
                        <input type="number" id="editTransactionAmount" class="amount-input"
                               value="${amount.toFixed(2)}" min="0.01" step="0.01">
                    </div>
                    <div class="modal-buttons">
                        <button type="button" id="cancelEditBtn" class="modal-btn cancel-btn">Отмена</button>
                        <button type="submit" class="modal-btn save-btn">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('editTransactionModal');

    // Показываем модальное окно
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);

    // Обработчик изменения типа (доход/расход)
    document.getElementById('editTransactionCategory').addEventListener('change', async (e) => {
        const newType = e.target.value;
        const categories = await getCategories(newType);
        const select = document.getElementById('editTransactionType');
        select.innerHTML = categories.map(cat =>
            `<option value="${cat.value}">${cat.text}</option>`
        ).join('');
    });

    // Обработчики кнопок
    document.getElementById('cancelEditBtn').addEventListener('click', () => {
        modal.remove();
    });

    document.getElementById('editTransactionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateTransactionData();
        modal.remove();
        await displayTransactions();
    });
}

/**
 * Генерирует опции для выпадающего списка категорий
 */
function generateCategoryOptions(currentType, currentValue) {
    let options = '';
    const types = currentType === 'income' ?
        ['Зарплата', 'Подработка', 'Пенсия', 'Другое'] :
        ['Еда', 'Машина', 'Квартира', 'Другое'];

    types.forEach(type => {
        const selected = type === currentValue ? 'selected' : '';
        options += `<option value="${type}" ${selected}>${type}</option>`;
    });

    return options;
}

/**
 * Обновляет транзакцию в базе данных
 */
async function updateTransactionData() {
    const id = parseInt(document.getElementById('editTransactionId').value);
    const category = document.getElementById('editTransactionCategory').value;
    const type = document.getElementById('editTransactionType').value;
    const amount = parseFloat(document.getElementById('editTransactionAmount').value);

    if (isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, введите корректную сумму');
        return;
    }

    const transaction = {
        id: id,
        category: category,
        type: type,
        amount: category === 'income' ? amount : -amount,
        date: new Date().toISOString()
    };

    try {
        await new Promise((resolve, reject) => {
            const tx = db.transaction('transactions', 'readwrite');
            const store = tx.objectStore('transactions');
            const request = store.put(transaction);

            request.onsuccess = () => resolve();
            request.onerror = (event) => reject(event.target.error);
        });
    } catch (error) {
        console.error('Ошибка при обновлении транзакции:', error);
        alert('Не удалось обновить транзакцию');
    }
}

/**
 * Получает транзакцию по ID
 */
async function getTransactionById(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('transactions', 'readonly');
        const store = tx.objectStore('transactions');
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Удаляет транзакцию
 */
async function deleteTransaction(id) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('transactions', 'readwrite');
        const store = tx.objectStore('transactions');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}