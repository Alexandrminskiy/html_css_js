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

    const selectedText = typeSelect[typeSelect.selectedIndex].text;
    const amount = parseFloat(amountInput.value);
    // Преобразуем в число и проверяем
    if (isNaN(amount)) {
        alert('Пожалуйста, введите корректное число');
        return;
    }

    const transaction = {
        category: category,
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
    };

    request.onerror = (event) => {
        console.error('Ошибка при загрузке транзакций:', event.target.error);
    };
}