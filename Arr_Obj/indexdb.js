let db;
const request = indexedDB.open('Budget', 1.0);

// Обработчик создания/обновления БД
request.onupgradeneeded = (event) => {
    db = event.target.result;
    const store = db.createObjectStore('transactions', { 
        keyPath: 'id', 
        autoIncrement: true 
    });
    store.createIndex('type', 'type', { unique: false });
    store.createIndex('amount', 'amount', { unique: false });
    console.log('База данных создана');
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log('База данных открыта');
};

request.onerror = (event) => {
    console.error('Ошибка IndexedDB:', event.target.error);
};

// Обработчик формы
document.getElementById('incomeForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const type = document.getElementById('incomeType');
    const selectedText = type.options[type.selectedIndex].text;
    const amountInput = document.getElementById('incomeAmount');
    
    // Преобразуем в число и проверяем
    const amount = parseFloat(amountInput.value);
    if (isNaN(amount)) {
        alert('Пожалуйста, введите корректное число');
        return;
    }

    const transaction = {
        type: selectedText,
        amount: amount, // Сохраняем как число
        date: new Date().toLocaleDateString()
    };

    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    const request = store.add(transaction);

    request.onsuccess = () => {
        console.log('Транзакция добавлена:', transaction);
        amountInput.value = '';
    };

    request.onerror = (event) => {
        console.error('Ошибка добавления:', event.target.error);
    };
});

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
            // Преобразуем amount в число на случай, если оно сохранилось как строка
            const amount = typeof trans.amount === 'string' ? parseFloat(trans.amount) : trans.amount;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${trans.id}</td>
                <td>${trans.type}</td>
                <td>${amount.toFixed(2)}</td>
                <td>${trans.date || 'не указана'}</td>
            `;
            tbody.appendChild(row);

            total += amount;

            if (!typeTotals[trans.type]) {
                typeTotals[trans.type] = 0;
            }
            typeTotals[trans.type] += amount;
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