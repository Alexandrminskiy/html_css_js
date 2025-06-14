// analytics.js

/**
 * Рассчитывает аналитику доходов, расходов и баланса, а также детализацию по категориям.
 * @param {Array<Object>} transactions Массив объектов транзакций.
 * @returns {Object} Объект с общими доходами, расходами, балансом и детализацией по категориям.
 */
function calculateAnalytics(transactions) {
    const analytics = {
        income: 0,
        expense: 0,
        balance: 0,
        categoryTotals: {}
    };

    transactions.forEach(transaction => {
        const amount = parseFloat(transaction.amount);

        if (isNaN(amount)) {
            console.warn("Некорректная сумма транзакции:", transaction);
            return;
        }

        analytics.balance += amount;

        if (amount > 0) {
            analytics.income += amount;
        } else {
            analytics.expense += Math.abs(amount);
        }

        const category = transaction.type;

        if (!analytics.categoryTotals[category]) {
            analytics.categoryTotals[category] = {
                income: 0,
                expense: 0,
                total: 0
            };
        }

        if (amount > 0) {
            analytics.categoryTotals[category].income += amount;
        } else {
            analytics.categoryTotals[category].expense += Math.abs(amount);
        }

        analytics.categoryTotals[category].total += amount;
    });

    return analytics;
}

/**
 * Форматирует число в денежный формат.
 * @param {number} amount Сумма.
 * @returns {string} Отформатированная сумма.
 */
function formatCurrency(amount) {
    return amount.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
}

/**
 * Создает HTML для отображения аналитики (только контент, без обертки HTML).
 */
function generateAnalyticsHTML(analytics) {
    return `
    <header class="analytics-header">
        <h2>Аналитика денежных средств</h2>
        <p>Подробный отчет о ваших доходах и расходах</p>
    </header>

    <section class="summary-section">
        <div class="summary-item">
            <h3>Доходы</h3>
            <p class="positive">${formatCurrency(analytics.income)}</p>
        </div>
        <div class="summary-item">
            <h3>Расходы</h3>
            <p class="negative">${formatCurrency(analytics.expense)}</p>
        </div>
        <div class="summary-item">
            <h3>Баланс</h3>
            <p class="${analytics.balance >= 0 ? 'positive' : 'negative'}">
                ${formatCurrency(analytics.balance)}
            </p>
        </div>
    </section>

    <section class="category-section">
        <h3>Детализация по категориям</h3>
        <ul class="category-list">
            ${Object.entries(analytics.categoryTotals)
            .map(([category, data]) => `
                    <li class="category-item">
                        <span class="category-name">${category}</span>
                        <span class="category-total ${data.total >= 0 ? 'positive' : 'negative'}">
                            ${formatCurrency(data.total)}
                        </span>
                    </li>
                `).join('')}
        </ul>
    </section>
    `;
}

/**
 * Отображает аналитику на странице (SPA).
 * @param {Array<Object>} transactions Массив транзакций.
 */async function displayAnalyticsSPA(transactions) {
    const analytics = calculateAnalytics(transactions);
    const analyticsContent = document.getElementById('analyticsContent');
    analyticsContent.innerHTML = generateAnalyticsHTML(analytics);
}

export { displayAnalyticsSPA };