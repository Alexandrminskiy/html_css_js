const input = document.createElement('input');
input.id = 'input';
const btn = document.createElement('button');
btn.textContent = 'Добавить в базу'

document.body.append(input, btn)



let database;
const request = indexedDB.open('TestD, 1');

request.onerror = (event) => {
    console.error('Ошибка IndexedDB:', event.target.error);
};

request.onupgradeneeded = (event) => {
    database = event.target.result;
    const store = database.createObjectStore('transactions', {
        keyPath: 'id',
        autoIncrement: true
    });
    store.createIndex('Element', 'Element', { unique: false });
    console.log('База создана')
};

request.onsuccess = (event) => {
    database = event.target.result;
    console.log('База успешно открыта');
};



btn.addEventListener('click', () => {
    let inputElement = document.getElementById('input').value;
    console.log(inputElement);

    const transaction = {
        Element: inputElement,
        date: new Date().toLocaleTimeString()
    };

    const tx = database.transaction('transactions', 'readwrite');
    const store = tx.objectStore('transactions');
    const request = store.add(transaction);

})


// Вывод

const btnOutput = document.createElement('button');
btnOutput.textContent = 'Вывод данных'
document.body.append(btnOutput)

function dataOutput() {
const tx = database.transaction('transactions', 'readonly');
const store = tx.objectStore('transactions');
console.log(tx, store);

const request = store.getAll();

}

btnOutput.addEventListener('click', dataOutput)