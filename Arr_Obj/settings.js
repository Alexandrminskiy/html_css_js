// settings.js

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsContainer = document.getElementById('settingsContainer');
    const mainContent = document.querySelector('body > *:not(#settingsContainer)'); // Выбираем все элементы body, кроме settingsContainer
    const backToMainBtn = document.getElementById('backToMainBtn');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');

    settingsBtn.addEventListener('click', () => {
        // Скрываем основное содержимое
        Array.from(document.body.children).forEach(child => {
            if (child.id !== 'settingsContainer') {
                child.style.display = 'none';
            }
        });

        // Показываем контейнер настроек
        settingsContainer.style.display = 'block';
    });

   backToMainBtn.addEventListener('click', () => {
    // Показываем основное содержимое
    Array.from(document.body.children).forEach(child => {
        child.style.display = '';
    });

    // Скрываем контейнер настроек
    settingsContainer.style.display = 'none';
    
    // Убедимся, что кнопка "Назад" из аналитики тоже скрыта
    document.getElementById('backBtn').style.display = 'none';
});

    exportBtn.addEventListener('click', async () => {
        const transactions = await getAllTransactions(); // Получаем транзакции из IndexedDB
        exportToCSV(transactions); // Вызываем функцию экспорта
    });

    importBtn.addEventListener('click', () => {
        importFromCSV(); // Вызываем функцию импорта
    });

    /**
     * Экспортирует данные в формат CSV.
     * @param {Array<Object>} data Массив объектов транзакций.
     */
    function exportToCSV(data) {
        if (!data || data.length === 0) {
            alert("Нет данных для экспорта.");
            return;
        }

        const csvRows = [];

        // Заголовки
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(';'));

        // Данные
        data.forEach(item => {
            const values = headers.map(header => {
                let value = item[header];
                // Экранирование значений, содержащих запятые, точки с запятой или кавычки
                if (typeof value === 'string') {
                    value = value.replace(/"/g, '""'); // Экранируем кавычки
                    if (value.includes(';') || value.includes('"') || value.includes('\n')) {
                        value = `"${value}"`; // Заключаем в кавычки, если есть специальные символы
                    }
                }
                return value;
            });
            csvRows.push(values.join(';'));
        });

        // Формируем CSV
        const csvString = csvRows.join('\n');

        // Создаем Blob и ссылку для скачивания
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "transactions.csv");
        document.body.appendChild(link); // Добавляем ссылку в DOM
        link.click(); // Кликаем по ссылке
        document.body.removeChild(link); // Удаляем ссылку из DOM
    }


    /**
     * Импортирует данные из CSV файла.
     */
    function importFromCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';

        input.onchange = async (event) => {
            const file = event.target.files[0];
            if (file) {
                const text = await file.text();
                const data = csvToArray(text);
                if (data && data.length > 0) {
                    // Сохраняем транзакции в IndexedDB
                    await saveTransactionsToDB(data);
                    alert('Импорт успешно завершен!');
                    location.reload(); // Перезагружаем страницу для обновления данных
                } else {
                    alert('Файл CSV пуст или имеет неверный формат.');
                }
            }
        };

        input.click();
    }

    /**
     * Преобразует CSV текст в массив объектов.
     * @param {string} csvText CSV текст.
     * @returns {Array<Object>} Массив объектов транзакций.
     */
    function csvToArray(csvText) {
        const rows = csvText.split('\n');
        if (rows.length < 2) {
            return []; // Пустой файл или только заголовки
        }

        const headers = rows[0].split(';').map(header => header.trim());
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(';');
            if (values.length !== headers.length) {
                console.warn(`Строка ${i + 1} имеет неверное количество столбцов и будет пропущена.`);
                continue; // Пропускаем строку с неверным количеством столбцов
            }

            const item = {};
            for (let j = 0; j < headers.length; j++) {
                let value = values[j] ? values[j].trim() : '';

                // Убираем кавычки, если они есть
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1).replace(/""/g, '"'); // Убираем кавычки и обрабатываем экранирование
                }

                item[headers[j]] = value;
            }
            data.push(item);
        }

        return data;
    }


    /**
     * Сохраняет массив транзакций в IndexedDB.
     * @param {Array<Object>} transactions Массив объектов транзакций.
     */
    async function saveTransactionsToDB(transactions) {
        for (const transaction of transactions) {
            // Преобразуем amount в число
            transaction.amount = parseFloat(transaction.amount);

            // Проверяем наличие обязательных полей
            if (!transaction.category || !transaction.type || isNaN(transaction.amount) || !transaction.date) {
                console.warn("Пропущена транзакция из-за неверных данных:", transaction);
                continue; // Пропускаем транзакцию
            }

            try {
                await addTransaction(transaction); // Используем существующую функцию для добавления транзакции
            } catch (error) {
                console.error("Ошибка при сохранении транзакции:", transaction, error);
                alert('Произошла ошибка при сохранении транзакций в базу данных.');
                return; // Прерываем процесс сохранения
            }
        }
    }
});
settingsBtn.addEventListener('click', () => {
    setScreen('settings');
});

backToMainBtn.addEventListener('click', () => {
    setScreen('main');
});