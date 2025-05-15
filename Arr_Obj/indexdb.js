let db;
const request = indexedDB.open('Budget', 2);

// Обработчик создания/обновления БД
request.onupgradeneeded = (event) => {
    db = event.target.result;

    // Удаляем старое хранилище при обновлении версии
    if (db.objectStoreNames.contains('transactions')) {
        db.objectStorieName('transactions');
    }

    // Создаем хранилище
    const store = db.createObjectStore('transactions', {
        keyPath: 'id',
        autoIncrement: true
    });
    // Создаем индексы
    store.createIndex('category', 'category', { unique: false });
    store.createIndex('type', 'type', { unique: false });
    store.createIndex('amout', 'amout', { unique: false });
    store.createIndex('date', 'date', { unique: false });
    console.log('База данных создана');
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log('База данных открыта');
};

request.onerror = (event) => {
    console.error('Ошибка IndexedDB:', event.target.error);
};

// Обработчик форм
document.getElementById('incomeForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addTransaction('income');
});
document.getElementById('expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    addTransaction('expense');
});

// Общая функция добавления транзакции
function addTransaction(category) {
    const typeSelect = document.getElementById(`${category}Type`);
    const amountInput = document.getElementById(`${category}Amount`);
    const selectedText = type.options[type.selectedIndex].text;
    const amount = parseFloat(amountInput.value);
// Преобразуем в число и проверяем
    if (isNaN(amount)) {
        alert('Пожалуйста, введите корректное число');
        return;
    }

const transaction = {
    category:category,
    type: selectedText,
    amount: category === 'income' ? amount : -Math.abs(amount),
    date: new Date().toLocaleDateString()
};

const tx = db.transaction('transactions', 'readwrite');
const store = tx.objectStore('transactions');
const request = store.add(transaction);

request.onsuccess = () => {
    console.log('Транзакция добавлена:', transaction);
    amountInput.value = '';
    displayAllTransactions();
};

request.onerror = (event) => {
    console.error('Ошибка добавления:', event.target.error);
};
}

// Переключение между формами доходов/расходов
const xxx = document.querySelectorAll('input[name="balance"]')

// Функция вывода транзакций
function displayAllTransactions() {
    const tx = db.transaction('transactions', 'readonly');
    const store = tx.objectStore('transactions');
    const request = store.getAll();

    request.onsuccess = () => {
        const transactions = request.result;
        const output = document.getElementById('transactionsOutput');
        output.innerHTML = '';

        if (transactions.length === 0) {
            output.innerHTML = '<p>Нет данных для отображения</p>';
            return;
        }

        // Создаем таблицу
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Тип</th>
                    <th>Сумма</th>
                    <th>Дата</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const tbody = table.querySelector('tbody');
        let total = 0;
        const typeTotals = {};

        // Заполняем таблицу
        transactions.forEach(trans => {
            // Преобразуем incomeAmount в число на случай, если оно сохранилось как строка
            const incomeAmount = typeof trans.incomeAmount === 'string' ? parseFloat(trans.amount) : trans.amount;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trans.id}</td>
                <td>${trans.type}</td>
                <td>${incomeAmount.toFixed(2)}</td>
                <td>${trans.date || 'не указана'}</td>
            `;
            tbody.appendChild(row);

            total += incomeAmount;

            if (!typeTotals[trans.type]) {
                typeTotals[trans.type] = 0;
            }
            typeTotals[trans.type] += incomeAmount;
        });

        output.appendChild(table);

        // Выводим итоги
        const totalsDiv = document.createElement('div');
        totalsDiv.className = 'totals';

        let totalsHTML = `<h3>Общий итог: ${total.toFixed(2)}</h3>`;
        totalsHTML += '<h4>Итоги по типам:</h4><ul>';

        for (const [type, sum] of Object.entries(typeTotals)) {
            totalsHTML += `<li>${type}: ${sum.toFixed(2)}</li>`;
        }

        totalsHTML += '</ul>';
        totalsDiv.innerHTML = totalsHTML;

        output.appendChild(totalsDiv);
    };

    request.onerror = (event) => {
        console.error('Ошибка при загрузке транзакций:', event.target.error);
    };
}