/**
 * Показывает модальное окно для добавления категории
 * @param {string} type - Тип категории ('income' или 'expense')
 */
function showCategoryModal(type) {
    window.currentCategoryType = type; // Используем window для глобальной переменной
    const modal = document.getElementById('categoryModal');
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    document.getElementById('newCategoryName').focus();
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
    document.getElementById('newCategoryName').value = '';
}

/**
 * Сохраняет новую категорию в базу данных
 */
async function saveCategory() {
    const nameInput = document.getElementById('newCategoryName');
    const name = nameInput.value.trim();
    
    // Проверяем, что введено название
    if (!name) {
        alert('Введите название категории');
        return;
    }
    
    // Создаем объект новой категории
    const newCategory = {
        value: name.toLowerCase().replace(/\s+/g, '_'),
        text: name
    };
    
    try {
        // Получаем текущие категории этого типа
        const categories = await getCategories(window.currentCategoryType);
        
        // Проверяем, что такой категории еще нет
        if (categories.some(cat => cat.value === newCategory.value)) {
            alert('Такая категория уже существует!');
            return;
        }
        
        // Добавляем новую категорию и сохраняем
        categories.push(newCategory);
        await updateCategories(window.currentCategoryType, categories);
        
        // Обновляем выпадающий список
        if (typeof loadCategories === 'function') {
            await loadCategories();
        }
        
        // Закрываем модальное окно
        hideCategoryModal();
        
    } catch (error) {
        console.error('Ошибка при сохранении категории:', error);
        alert('Не удалось сохранить категорию');
    }
}

// Настройка обработчиков событий для модального окна
document.addEventListener('DOMContentLoaded', () => {
    // Кнопки модального окна
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);
    document.getElementById('cancelCategoryBtn').addEventListener('click', hideCategoryModal);
});