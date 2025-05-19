let db;
let currentCategoryType = '';

// Инициализация базы данных
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BudgetDB', 3);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('transactions')) {
                const store = db.createObjectStore('transactions', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('amount', 'amount', { unique: false });
                store.createIndex('date', 'date', { unique: false });
            }

            if (!db.objectStoreNames.contains('categories')) {
                const categoryStore = db.createObjectStore('categories', {
                    keyPath: 'type'
                });
                
                // Инициализация стандартных категорий
                categoryStore.put({
                    type: 'income',
                    categories: [
                        { value: 'zp', text: 'Зарплата' },
                        { value: 'pd', text: 'Подработка' },
                        { value: 'pn', text: 'Пенсия' },
                        { value: 'pr', text: 'Продажа' },
                        { value: 'dr', text: 'Другое' }
                    ]
                });

                categoryStore.put({
                    type: 'expense',
                    categories: [
                        { value: 'eda', text: 'Еда' },
                        { value: 'vel', text: 'Велосипед' },
                        { value: 'auto', text: 'Машина' },
                        { value: 'kv', text: 'Квартира' },
                        { value: 'dr', text: 'Другое' }
                    ]
                });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('Ошибка IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

// Получить категории по типу
function getCategories(type) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('categories', 'readonly');
        const store = tx.objectStore('categories');
        const request = store.get(type);

        request.onsuccess = () => {
            resolve(request.result?.categories || []);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Сохранить категории
function saveCategories(type, categories) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('categories', 'readwrite');
        const store = tx.objectStore('categories');
        const request = store.put({ type, categories });

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

// Обновить выпадающий список категорий
async function updateCategorySelect(selectId, type) {
    try {
        const categories = await getCategories(type);
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = categories.map(cat => 
                `<option value="${cat.value}">${cat.text}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('Ошибка обновления категорий:', error);
    }
}

// Добавить транзакцию
async function addTransaction(category) {
    const typeSelect = document.getElementById(`${category}Type`);
    const amountInput = document.getElementById(`${category}Amount`);

    const selectedText = typeSelect.options[typeSelect.selectedIndex].text;
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, введите корректную сумму');
        return;
    }

    const transaction = {
        category: category,
        type: selectedText,
        amount: category === 'income' ? amount : -amount,
        date: new Date().toLocaleDateString()
    };

    try {
        const tx = db.transaction('transactions', 'readwrite');
        const store = tx.objectStore('transactions');
        await store.add(transaction);
        
        amountInput.value = '';
        await displayAllTransactions();
    } catch (error) {
        console.error('Ошибка добавления транзакции:', error);
    }
}

// Показать все транзакции
async function displayAllTransactions() {
    try {
        const tx = db.transaction('transactions', 'readonly');
        const store = tx.objectStore('transactions');
        const request = store.getAll();

        const transactions = await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });

        const output = document.getElementById('transactionsOutput');
        if (!output) return;
        
        output.innerHTML = '';

        if (!transactions || transactions.length === 0) {
            output.innerHTML = '<p>Нет данных для отображения</p>';
            return;
        }

        // Создаем таблицу
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Тип</th>
                    <th>Категория</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        let totalIncome = 0;
        let totalExpense = 0;
        const typeTotals = {};

        // Сортируем по дате (новые сверху)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Заполняем таблицу
        transactions.forEach(trans => {
            const row = document.createElement('tr');
            row.className = trans.category === 'income' ? 'income-row' : 'expense-row';

            row.innerHTML = `
                <td>${trans.type}</td>
                <td>${trans.category === 'income' ? 'Доход' : 'Расход'}</td>
                <td class="${trans.amount >= 0 ? 'positive' : 'negative'}">
                    ${trans.amount >= 0 ? '+' : ''}${trans.amount.toFixed(2)}
                </td>
                <td>${trans.date}</td>
            `;
            tbody.appendChild(row);

            if (trans.category === 'income') {
                totalIncome += trans.amount;
            } else {
                totalExpense += Math.abs(trans.amount);
            }

            if (!typeTotals[trans.type]) {
                typeTotals[trans.type] = 0;
            }
            typeTotals[trans.type] += trans.amount;
        });

        output.appendChild(table);

        // Выводим итоги
        const totalsDiv = document.createElement('div');
        totalsDiv.className = 'totals';

        const balance = totalIncome - totalExpense;

        let totalsHTML = `<h3>Общий баланс: <span class="${balance >= 0 ? 'positive' : 'negative'}">
                ${balance >= 0 ? '+' : ''}${balance.toFixed(2)}
            </span></h3>
            <p>Всего доходов: <span class="positive">+${totalIncome.toFixed(2)}</span></p>
            <p>Всего расходов: <span class="negative">-${totalExpense.toFixed(2)}</span></p>
            <h4>Детализация по категориям:</h4>
            <ul>`;

        for (const [type, sum] of Object.entries(typeTotals)) {
            totalsHTML += `
            <li>
                ${type}: 
                <span class="${sum >= 0 ? 'positive' : 'negative'}">
                    ${sum >= 0 ? '+' : ''}${sum.toFixed(2)}
                </span>
            </li>`;
        }

        totalsHTML += '</ul>';
        totalsDiv.innerHTML = totalsHTML;
        output.appendChild(totalsDiv);
    } catch (error) {
        console.error('Ошибка при загрузке транзакций:', error);
    }
}

// Добавить новую категорию
async function addNewCategory() {
    const nameInput = document.getElementById('newCategoryName');
    if (!nameInput) return;
    
    const name = nameInput.value.trim();
    if (!name) return;

    const newCategory = {
        value: name.toLowerCase().replace(/\s+/g, '_'),
        text: name
    };

    try {
        const categories = await getCategories(currentCategoryType);
        
        if (categories.some(c => c.value === newCategory.value)) {
            alert('Такая категория уже существует!');
            return;
        }

        categories.push(newCategory);
        await saveCategories(currentCategoryType, categories);
        
        // Обновляем выпадающий список
        await updateCategorySelect(`${currentCategoryType}Type`, currentCategoryType);
        
        // Закрываем модальное окно
        const modal = document.getElementById('categoryModal');
        if (modal) modal.style.display = 'none';
        nameInput.value = '';
    } catch (error) {
        console.error('Ошибка добавления категории:', error);
    }
}

// Инициализация приложения
async function initApp() {
    try {
        await initDB();
        
        // Загружаем категории
        await updateCategorySelect('incomeType', 'income');
        await updateCategorySelect('expenseType', 'expense');
        
        // Показываем транзакции
        await displayAllTransactions();
        
        // Настройка обработчиков событий
        const incomeRadio = document.getElementById('incomeRadio');
        const expenseRadio = document.getElementById('expenseRadio');
        const incomeForm = document.getElementById('incomeForm');
        const expenseForm = document.getElementById('expenseForm');
        
        function toggleForms() {
            if (incomeRadio.checked) {
                incomeForm.style.display = 'block';
                expenseForm.style.display = 'none';
            } else {
                incomeForm.style.display = 'none';
                expenseForm.style.display = 'block';
            }
        }
        
        if (incomeRadio && expenseRadio) {
            incomeRadio.addEventListener('change', toggleForms);
            expenseRadio.addEventListener('change', toggleForms);
        }
        
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                addTransaction('income');
            });
        }
        
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                addTransaction('expense');
            });
        }
        
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', displayAllTransactions);
        }
        
        const addIncomeCategoryBtn = document.getElementById('addIncomeCategory');
        if (addIncomeCategoryBtn) {
            addIncomeCategoryBtn.addEventListener('click', () => {
                currentCategoryType = 'income';
                const modal = document.getElementById('categoryModal');
                if (modal) modal.style.display = 'block';
            });
        }
        
        const addExpenseCategoryBtn = document.getElementById('addExpenseCategory');
        if (addExpenseCategoryBtn) {
            addExpenseCategoryBtn.addEventListener('click', () => {
                currentCategoryType = 'expense';
                const modal = document.getElementById('categoryModal');
                if (modal) modal.style.display = 'block';
            });
        }
        
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', addNewCategory);
        }
        
        const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', () => {
                const modal = document.getElementById('categoryModal');
                if (modal) modal.style.display = 'none';
            });
        }
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
    }
}

// Запуск приложения
window.addEventListener('DOMContentLoaded', initApp);