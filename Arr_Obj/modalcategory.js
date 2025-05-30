// modalcategory.js
let currentCategoryType = 'income';

/**
 * Показывает модальное окно для управления категориями
 * @param {string} type - Тип категории ('income' или 'expense')
 */
function showCategoryManagementModal(type) {
    currentCategoryType = type;
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalCategoryTitle');
    
    modalTitle.textContent = `Управление категориями (${type === 'income' ? 'Доходы' : 'Расходы'})`;
    
    // Загружаем список категорий
    loadCategoryList(type);

    // Показываем модальное окно
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

/**
 * Загружает список категорий с кнопками действий
 */
async function loadCategoryList(type) {
    const categories = await getCategories(type);
    const categoryList = document.getElementById('categoryList');
    
    categoryList.innerHTML = `
        <div class="add-category-form">
            <input type="text" id="newCategoryName" placeholder="Введите название категории">
            <button id="addCategoryBtn" class="action-btn add-btn">+ Добавить</button>
        </div>
        <ul class="categories-list">
            ${categories.map(cat => `
                <li class="category-item" data-value="${cat.value}">
                    <span class="category-name">${cat.text}</span>
                    <div class="category-actions">
                        <button class="action-btn edit-btn" data-value="${cat.value}">✏️</button>
                        ${cat.value !== 'dr' ? `<button class="action-btn delete-btn" data-value="${cat.value}">🗑️</button>` : ''}
                    </div>
                </li>
            `).join('')}
        </ul>
    `;
    
    // Настройка обработчиков событий
    setupCategoryListEvents();
}

/**
 * Настраивает обработчики событий для элементов списка категорий
 */
function setupCategoryListEvents() {
    // Добавление новой категории
    document.getElementById('addCategoryBtn').addEventListener('click', addNewCategory);
    
    // Редактирование категории
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = e.target.getAttribute('data-value');
            editCategory(value);
        });
    });
    
    // Удаление категории
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const value = e.target.getAttribute('data-value');
            deleteExistingCategory(value);
        });
    });
    
    // Добавляем возможность добавления по Enter
    document.getElementById('newCategoryName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addNewCategory();
        }
    });
}

/**
 * Добавляет новую категорию
 */
async function addNewCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Пожалуйста, введите название категории');
        return;
    }
    
    const newCategory = {
        value: name.toLowerCase().replace(/\s+/g, '_'),
        text: name
    };
    
    try {
        const categories = await getCategories(currentCategoryType);
        
        // Проверяем, что категория не существует
        if (categories.some(cat => cat.value === newCategory.value)) {
            alert('Категория с таким названием уже существует!');
            return;
        }
        
        // Добавляем новую категорию
        const updatedCategories = [...categories, newCategory];
        await updateCategories(currentCategoryType, updatedCategories);
        
        // Обновляем список и очищаем поле ввода
        await loadCategoryList(currentCategoryType);
        nameInput.value = '';
        
        // Обновляем выпадающие списки в формах
        if (typeof loadCategories === 'function') {
            await loadCategories();
        }
        
    } catch (error) {
        console.error('Ошибка при добавлении категории:', error);
        alert('Не удалось добавить категорию');
    }
}

/**
 * Редактирует существующую категорию
 */
async function editCategory(categoryValue) {
    const categories = await getCategories(currentCategoryType);
    const category = categories.find(cat => cat.value === categoryValue);
    
    if (!category) return;
    
    const newName = prompt('Введите новое название категории:', category.text);
    if (!newName || newName.trim() === '') return;
    
    try {
        // Обновляем категорию
        const updatedCategories = categories.map(cat => 
            cat.value === categoryValue ? { ...cat, text: newName } : cat
        );
        
        await updateCategories(currentCategoryType, updatedCategories);
        
        // Обновляем связанные транзакции
        await updateTransactionsWithNewCategory(
            categoryValue,
            categoryValue,
            newName
        );
        
        // Обновляем список категорий
        await loadCategoryList(currentCategoryType);
        
        // Обновляем выпадающие списки в формах
        if (typeof loadCategories === 'function') {
            await loadCategories();
        }
        
    } catch (error) {
        console.error('Ошибка при редактировании категории:', error);
        alert('Не удалось изменить категорию');
    }
}

/**
 * Удаляет существующую категорию
 */
async function deleteExistingCategory(categoryValue) {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?\nВсе связанные транзакции будут перемещены в категорию "Другое".')) {
        return;
    }
    
    try {
        const categories = await getCategories(currentCategoryType);
        
        // Удаляем категорию (кроме "Другое")
        if (categoryValue === 'dr') {
            alert('Категорию "Другое" нельзя удалить');
            return;
        }
        
        const updatedCategories = categories.filter(cat => cat.value !== categoryValue);
        await updateCategories(currentCategoryType, updatedCategories);
        
        // Обновляем связанные транзакции (перемещаем в "Другое")
        await updateTransactionsWithNewCategory(
            categoryValue,
            'dr',
            'Другое'
        );
        
        // Обновляем список категорий
        await loadCategoryList(currentCategoryType);
        
        // Обновляем выпадающие списки в формах
        if (typeof loadCategories === 'function') {
            await loadCategories();
        }
        
    } catch (error) {
        console.error('Ошибка при удалении категории:', error);
        alert('Не удалось удалить категорию');
    }
}

/**
 * Обновляет транзакции при изменении/удалении категории
 */
async function updateTransactionsWithNewCategory(oldValue, newValue, newText) {
    try {
        const transactions = await getAllTransactions();
        const transactionsToUpdate = transactions.filter(
            trans => trans.category === currentCategoryType && trans.type === oldValue
        );
        
        if (transactionsToUpdate.length > 0) {
            const tx = db.transaction('transactions', 'readwrite');
            const store = tx.objectStore('transactions');
            
            transactionsToUpdate.forEach(trans => {
                const updatedTransaction = { ...trans, type: newText };
                store.put(updatedTransaction);
            });
            
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = (event) => reject(event.target.error);
            });
        }
    } catch (error) {
        console.error('Ошибка при обновлении транзакций:', error);
        throw error;
    }
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
}

/**
 * Настройка обработчиков событий для кнопок управления
 */
function setupCategoryManagementListeners() {
    // Кнопки открытия модального окна
    document.getElementById('manageIncomeCategories').addEventListener('click', () => {
        showCategoryManagementModal('income');
    });
    
    document.getElementById('manageExpenseCategories').addEventListener('click', () => {
        showCategoryManagementModal('expense');
    });
    
    // Кнопка закрытия модального окна
    document.getElementById('cancelCategoryBtn').addEventListener('click', hideCategoryModal);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupCategoryManagementListeners();
});