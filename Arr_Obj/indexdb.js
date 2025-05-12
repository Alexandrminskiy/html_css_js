let db;
const request = indexedDB.open('Budget', 1.0);

// Обработчик успешного открытия/создания БД
request.onupgradeneeded = (event) => {
    db = event.target.result;
    const store = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
    store.createIndex('type', 'type', { unique: false });
    store.createIndex('amount', 'amount', { unique: false });
    console.log('База данных создана');

}

request.onsuccess = (event) => {
    db = event.target.result;
    console.log('База данных открыта');

}

request.onerror = (event) => {
    console.error('Ошибка indexDB:', event.target.error);
};

document.getElementById('incomeForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const type = document.getElementById('incomeType');
    const selectedText = type.options[type.selectedIndex].text;

    const amount = Number(document.getElementById('incomeAmount').value);

    const transaction = { selectedText, amount };

    const tx = db.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    const request = store.add(transaction)

    request.onsuccess = () => {
        console.log('Транзакция добавлена');
        document.getElementById('incomeType').value = '';
        document.getElementById('incomeAmount').value = '';
    };

    request.onerror = () => {
        console.error('Ошибка добавления');
        
    }
})