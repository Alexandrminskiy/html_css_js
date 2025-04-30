// let products = ['Яблоки', 'Хлеб', 'Молоко', 'Сыр'];

// products.push('Торт');
// products.shift();
// products.unshift('сыр')
// console.log(products);

// let books = {
//     title:'Название',
//     autors: 'Автор',
// pages: 'Количество страниц'
// }

// books.isRead = false;

// console.log(books);

// let movies = [
//     {title:'Сумерки', year: 2009, rating: 5},
//     {title:'Zero', year: 2015, rating: 7}
// ]

// console.log(movies[1].title);

// const cars = [
//     { model: "Toyota", year: 2015 },
//     { model: "BMW", year: 2022 },
//     { model: "Audi", year: 2021 }
// ];

// const newCar = cars.filter(car=>car.year > 2020);
// console.log(newCar);

// const links = [
//     {title: 'Google', url: 'https://www.google.ru/'},
//     {title: 'Yandex', url: 'https://www.ya.ru/'},
//     {title: 'Mail', url: 'https://www.mail.ru/'},
//     {title: 'Rambler', url: 'https://www.rambler.ru/'},

// ];

// const postLinks = document.createElement('ul');
// document.body.append(postLinks)

// links.forEach(arr=>{
//     const li = document.createElement('li');
//     li.innerHTML = `<a href="${arr.url}">${arr.title}</a>`
//     postLinks.append(li);

// })
// const products = [
//     { name: "Яблоки", price: 280 },
//     { name: "Бананы", price: 220 },
//     { name: "Апельсины", price: 195}
// ];

// // products.sort((a, b) => a.price - b.price);
// console.log(products.sort((a, b) => a.price - b.price));

// const orders = [
//     { id: 1, amount: 200 },
//     { id: 2, amount: 350 },
//     { id: 3, amount: 120 }
// ];

// const total =orders.reduce((x, n)=> x+n.amount, 0);
// console.log(total);


// const person = {
//     firstName: "Иван",
//     lastName: "Петров",
//     age: 35}

// const {firstName: name, age:year, ist='tae'} = person;
// console.log(name, year, ist);



//  const users = [
//     { id: 1, name: 'Алексей', age: 25 },
//     { id: 2, name: 'Мария', age: 32 },
//     { id: 3, name: 'Ирина', age: 28 }
// ];

// function renderUsers() {
//     const userList = document.createElement('ul');
//     userList.id = 'userList'
//     document.body.append(userList)

//     users.forEach(user => {
//         const li = document.createElement('li');
//         li.innerHTML = `<strong>${user.name}</strong> ${user.age}`
//         userList.appendChild(li)
//     })
//     console.log();
// }
// renderUsers()

// const addUserBtn = document.createElement('button');
// addUserBtn.textContent = 'Добавить нового пользователя';
// const delUserBtn = document.createElement('button');
// delUserBtn.textContent = 'Удалить последнего пользователя';





// addUserBtn.addEventListener('click', () => {
//     const newUser = {
//         id: users.length + 1,
//         name: `Пользователь ${users.length + 1}`,
//         age: Math.floor(Math.random() * 20) + 18
//     };
//     users.push(newUser);
//     document.getElementById('userList').remove()
//     renderUsers()
// })

// delUserBtn.addEventListener('click', () => {
//     if (users != '') {
//         console.log(users);
//         users.pop(users)
//         document.getElementById('userList').remove()
//         renderUsers()
//     }
//     else {
//         alert('Список пуст');
//     }
// })


// const allButtons = document.querySelectorAll('button');

// function allFontSize(fontSize) {
//     allButtons.forEach(button => {
//         button.style.fomtSize = fontSize + 'px';
//     });
// }

// const settingsForm = document.getElementById('settingsForm')

// settingsForm.addEventListener('submit', (e) => {
//     e.preventDefault();

//     const userName = document.getElementById('userName').value;
//     const bgColor = document.getElementById('bgColor').value;
//     localStorage.setItem('userName', userName);
//     localStorage.setItem('bgColor', bgColor);
//     document.body.style.backgroundColor = bgColor;
//     alert(`Настройки сохраненны, ${userName}!`)
// })

// if (localStorage.getItem('bgColor')) {
//     document.body.style.backgroundColor = localStorage.getItem('bgColor')
// }

// const btnSizeText = document.createElement('button');
// btnSizeText.textContent = 'Размер шрифта';
// const inputSizeText = document.createElement('input');
// inputSizeText.type = 'number'
// inputSizeText.id = 'inputSizeText';
// inputSizeText.style.width = '50px';

// btnSizeText.addEventListener('click', () => {
//     if (inputSizeText) {
//         const inputSizeText = document.getElementById('inputSizeText').value;
//         document.body.style.fontSize = `${inputSizeText}px`;
//         allFontSize(inputSizeText)
//         localStorage.setItem('inputSizeText', inputSizeText); 
//     }
//     function allFontSize(fontSize) {
//         allButtons.forEach(button => {
//             button.style.fomtSize = fontSize + 'px';
//         });
//     }
// })


// if (localStorage.getItem('inputSizeText')) {
//     const iST = localStorage.getItem('inputSizeText');
//     document.body.style.fontSize = `${iST}px`;

// }

// document.body.append(inputSizeText, btnSizeText, addUserBtn, delUserBtn, userList);

// console.log('Старт');
// setTimeout(()=>{
//     console.log('Сообщение через 2 секунды'); 
// }, 2000);
// console.log('Конец');

// fetch('https://jsonplaceholder.typicode.com/posts/1')
// .then(responce => responce.json())
// .then(data => {
//     console.log('Загруженный контент:', data);
//     const postDiv = document.createElement('div');
//     postDiv.innerHTML = `<h3>${data.title}</h3><p>${data.body}</p>`;
//     document.body.appendChild(postDiv)
// })
// .catch(error=>console.error('Ошибка:', error));

// const btnNewPost = document.createElement('button');
// btnNewPost.textContent = 'Получить новый пост';

// const loadingIndicator = document.createElement('p');
// loadingIndicator.textContent = ('Загрузка');
// loadingIndicator.style.display = 'none';

// const postContainer = document.createElement('div');

// document.body.append(btnNewPost, loadingIndicator, postContainer);

// function getPostRandom(){
//     loadingIndicator.style.display='block';
//     postContainer.innerText='';

//     const randomPostId = Math.floor(Math.random()*100)+1;

//     fetch(`https://jsonplaceholder.typicode.com/posts/${randomPostId}`)
//     .then(Response =>{
//         if(!Response.ok){
//         throw new Error('Постт не найден');
//         }
//         return Response.json();
//     })
//     .then(data => {
//         console.log("Загруженный пост:", data);
//         const postDiv = document.createElement("div");
//         postDiv.innerHTML = `<h3>${data.title}</h3><p>${data.body}</p>`;
//         postContainer.appendChild(postDiv);
//       })
//       .catch(error => {
//         console.error("Ошибка:", error);
//         postContainer.innerHTML = `<p style="color: red;">Ошибка: ${error.message}</p>`;
//       })
//       .finally(() => {

//         loadingIndicator.style.display = 'none';
//       });
//   }btnNewPost.addEventListener('click', getPostRandom);

// const inpText = document.createElement('input');
// inpText.placeholder = 'Введите текст'
// const btnText = document.createElement('button');
// btnText.textContent = 'Добавить текст';
// const listText = document.createElement('ul');

// document.body.append(inpText, btnText, listText);

// btnText.addEventListener('click', addTodo);

// function addTodo() {
//     const task = inpText.value.trim();

//     if (task) {
//         const li = document.createElement('li')
//         li.textContent = task;
//         li.addEventListener('click', () => {
//             li.style.textDecoration = li.style.textDecoration ? '' : 'line-through';
//         })

//         li.addEventListener('dblclick', () => li.remove())

//         listText.appendChild(li);
//         inpText.value = ''
//     }
// }


const incomeRadio = document.getElementById('incomeRadio');
const expenseRadio = document.getElementById('expenseRadio');

const incomeForm = document.getElementById('incomeForm');
const expenseForm = document.getElementById('expenseForm');

function toggleForm() {
    if (incomeRadio.checked) {
        incomeForm.style.display = 'block';
        expenseForm.style.display = 'none';
        console.log(incomeRadio.checked);
        
    } else if (expenseRadio.checked) {
        expenseForm.style.display = 'block';
        incomeForm.style.display = 'none';
        console.log(expenseRadio.checked);
    } else { // Если ни одна радиокнопка не выбрана
        incomeForm.style.display = 'none';
        expenseForm.style.display = 'none';
    }
}

// Добавляем обработчики событий к радиокнопкам
incomeRadio.addEventListener('change', toggleForm);  // 'change' срабатывает при изменении состояния
expenseRadio.addEventListener('change', toggleForm);

const transactions = [
    { id: 1, type: "income", amount: 1000, category: "Зарплата" },
    { id: 2, type: "expense", amount: 300, category: "Еда" }
];

function radioChoice() {
    let radios = document.getElementsByName('balance');
    let selectedValue = null;

    for (const radio of radios) {
        if (radio.checked) {
            selectedValue = radio.value;
            console.log(selectedValue);
            break
        }    
}
const btn = document.createElement('button');
btn.textContent = 'Кнопка';
document.body.append(btn)
btn.addEventListener('click', radioChoice)}