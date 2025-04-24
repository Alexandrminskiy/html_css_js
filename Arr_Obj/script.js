const users = [
    { id: 1, name: 'Алексей', age: 25 },
    { id: 2, name: 'Мария', age: 32 },
    { id: 3, name: 'Ирина', age: 28 }
];

function renderUsers() {
    const userList = document.createElement('ul');
    userList.id = 'userList'
    document.body.append(userList)

    users.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${user.name}</strong> ${user.age}`
        userList.appendChild(li)
    })
    console.log();
}
renderUsers()

const addUserBtn = document.createElement('button');
addUserBtn.textContent = 'Добавить нового пользователя';
const delUserBtn = document.createElement('button');
delUserBtn.textContent = 'Удалить последнего пользователя';

document.body.append(addUserBtn, delUserBtn, userList);



addUserBtn.addEventListener('click', () => {
    const newUser = {
        id: users.length + 1,
        name: `Пользователь ${users.length + 1}`,
        age: Math.floor(Math.random() * 20) + 18
    };
    users.push(newUser);
    document.getElementById('userList').remove()
    renderUsers()
})

delUserBtn.addEventListener('click', () => {
    if(users != '') {
        console.log(users);
            users.pop(users)
    document.getElementById('userList').remove()
    renderUsers()} 
    else {
        alert('Список пуст');
    }
})










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


