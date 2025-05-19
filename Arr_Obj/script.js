const incomeRadio = document.getElementById('incomeRadio');
const expenseRadio = document.getElementById('expenseRadio');

const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');

// Функция для скрытия и отображения форм
function toggleForm() {
    incomeForm.style.display = incomeRadio.checked ? 'block' : 'none';
    expenseForm.style.display = expenseRadio.checked ? 'block' : 'none';
}

// Обработчики событий для радиокнопок
incomeRadio.addEventListener('change', toggleForm);
expenseRadio.addEventListener('change', toggleForm);

// Обновление select
function updateCategorySelect(selectId, categories) {
    const select = document.getElementById(selectId); // Исправлено: selectId вместо select
    if (select) {
        select.innerHTML = categories.map(cat =>
            `<option value="${cat.value}">${cat.text}</option>`
        ).join('');
    }
}

let currentCategoryType; // 'income' или 'expense'

// Открытие модального окна
function showCategoryModal(type) {
    currentCategoryType = type;
    const modal = document.getElementById('categoryModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

// Закрытие модального окна
const closeModalBtn = document.getElementById('cancelCategoryBtn'); // Исправлено: используем существующий элемент из HTML
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

// Сохранение новой категории
const saveCategoryBtn = document.getElementById('saveCategoryBtn');
if (saveCategoryBtn) {
    saveCategoryBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('newCategoryName');
        if (nameInput) {
            const name = nameInput.value.trim();
            if (name) {
                const newCategory = {
                    value: name.toLowerCase().replace(/\s+/g, '_'),
                    text: name
                };
                
                addCategory(currentCategoryType, newCategory, (success) => {
                    if (success) {
                        loadCategoriesToSelects();
                        const modal = document.getElementById('categoryModal');
                        if (modal) modal.style.display = 'none';
                        if (nameInput) nameInput.value = '';
                    } else {
                        alert('Категория уже существует!');
                    }
                });
            }
        }
    });
}