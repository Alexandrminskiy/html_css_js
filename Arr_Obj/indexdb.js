let db; // Глобальная переменная для хранения подключения к базе данных

/**
 * Инициализация базы данных IndexedDB
 * @returns {Promise} Промис, который разрешается при успешном открытии БД
 */
function initDB() {
    return new Promise((resolve, reject) => {
        // Открываем базу данных с именем "BudgetApp" версии 1
        const request = indexedDB.open('BudgetApp', 1);

        // Срабатывает при первом создании или обновлении версии БД
        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Создаем хранилище для транзакций, если оно не существует
            if (!db.objectStoreNames.contains('transactions')) {
                const store = db.createObjectStore('transactions', {
                    keyPath: 'id',        // Поле, которое будет ключом
                    autoIncrement: true   // Автоматически генерируемый ID
                });
                
                // Создаем индексы для быстрого поиска
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('date', 'date', { unique: false });
            }

            // Создаем хранилище для категорий, если оно не существует
            if (!db.objectStoreNames.contains('categories')) {
                const categoryStore = db.createObjectStore('categories', {
                    keyPath: 'type'  // Ключом будет тип (income/expense)
                });

                // Добавляем начальные категории доходов
                categoryStore.put({
                    type: 'income',
                    items: [
                        { value: 'zp', text: 'Зарплата' },
                        { value: 'pd', text: 'Подработка' },
                        { value: 'pn', text: 'Пенсия' },
                        { value: 'dr', text: 'Другое' }
                    ]
                });

                // Добавляем начальные категории расходов
                categoryStore.put({
                    type: 'expense',
                    items: [
                        { value: 'eda', text: 'Еда' },
                        { value: 'auto', text: 'Машина' },
                        { value: 'kv', text: 'Квартира' },
                        { value: 'dr', text: 'Другое' }
                    ]
                });
            }
        };

        // При успешном открытии БД
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('База данных успешно открыта');
            resolve(db);
        };

        // При ошибке открытия БД
        request.onerror = (event) => {
            console.error('Ошибка базы данных:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Добавление новой транзакции
 * @param {Object} transaction Объект транзакции
 * @returns {Promise} Промис, который разрешается при успешном добавлении
 */
function addTransaction(transaction) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('transactions', 'readwrite');
        const store = tx.objectStore('transactions');
        const request = store.add(transaction);

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Получение всех транзакций из БД
 * @returns {Promise} Промис с массивом транзакций
 */
function getAllTransactions() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('transactions', 'readonly');
        const store = tx.objectStore('transactions');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Получение категорий по типу (income/expense)
 * @param {string} type Тип категории
 * @returns {Promise} Промис с массивом категорий
 */
function getCategories(type) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('categories', 'readonly');
        const store = tx.objectStore('categories');
        const request = store.get(type);

        request.onsuccess = () => resolve(request.result?.items || []);
        request.onerror = (event) => reject(event.target.error);
    });
}

/**
 * Добавление новой категории
 * @param {string} type Тип категории (income/expense)
 * @param {Array} categories Обновленный массив категорий
 * @returns {Promise} Промис, который разрешается при успешном обновлении
 */
function updateCategories(type, categories) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction('categories', 'readwrite');
        const store = tx.objectStore('categories');
        const request = store.put({ type, items: categories });

        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}