const inpText = document.createElement('input');
inpText.placeholder = 'Введите текст';
const btnText = document.createElement('button');
btnText.textContent='Введите задачу';
const textList = document.createElement('ul');


document.body.append(inpText, btnText, textList);

btnText.addEventListener('click', addTodo);

function addTodo(){
    const task = inpText.value.trim();
    console.log(task);
    if (task) {
        const li = document.createElement('li');
        li.textContent = task

        li.addEventListener('click', ()=>{
            li.style.textDecoration = li.style.textDecoration ? '' : 'line-through';
        });

        li.addEventListener('dblclick', ()=> li.remove())

        textList.append(li)
        inpText.value = ''
    }
    
}

// const titleElement = document.getElementById('title');
// const button = document.getElementById('changeTextBtn');
// button.addEventListener('click', () => {
//     titleElement.textContent = 'Добро пожаловать в js!';
//     button.textContent = 'Текст изменен!'
// })

// titleElement.style.color = 'blue';

// const changeColorBtn = document.createElement('button');
// changeColorBtn.textContent = 'Сменить цвет';
// document.body.appendChild(changeColorBtn);

// changeColorBtn.addEventListener('click', () => {
//     const colors = ['red', 'green', 'purple', 'orange'];
//     const randomColor = colors[Math.floor(Math.random() * colors.length)];
//     titleElement.style.color = randomColor;
//     changeColorBtn.style.background = randomColor;
//     titleElement.style.color = randomColor
// })



// const changeColor = ()=>{
    
// }


// const changeFontSizeBtn = document.createElement('button');
// changeFontSizeBtn.textContent = "Увеличить размер";
// document.body.insertBefore(changeFontSizeBtn, button);

// let count = window.getComputedStyle(titleElement).fontSize.replace(/[^0-9]/g, "");;
// // console.log(count);

// changeFontSizeBtn.addEventListener('click', () => {

//     count = +count + 2;
//     if (count > 60) {
//         count = 32
//     }

//     titleElement.style.fontSize = count + 'px';
//     console.log(count);
// })

// const input = document.getElementById('textInput');
// const updateBtn = document.getElementById('updateTextBtn');


// updateBtn.addEventListener('click', () => {
//     if (input.value.trim() !== '') {
//         titleElement.textContent = input.value;
//         input.value = '';
//     }
// })

// input.addEventListener('keydown', (event) => {
//     if (event.key === 'Enter') {
//         console.log('Enter');
//         if (input.value.trim() !== '' && input.value.trim().length <= 20) {
//             titleElement.textContent = input.value;
//             input.value = '';
//         }
//     }
// })

// const fruits = ['Яблоко', 'Банан', 'Апельсин', 'Груша'];
// const list = document.createElement('ul');
// document.body.appendChild(list);

// for (let fruit of fruits) {
//     const li = document.createElement('li');
//     li.textContent = fruit;
//     list.appendChild(li);
//   };


// const newFruitsInput = document.createElement('input');
// newFruitsInput.placeholder = 'Введите имя фрукта'
// newFruitsInput.id = 'textInputFruits';
// document.body.appendChild(newFruitsInput);
// const textInputFruits = document.getElementById('textInputFruits');

// const addFruitsBtn = document.createElement('button');
// addFruitsBtn.textContent = 'Добавить фрукт';
// document.body.appendChild(addFruitsBtn);



// addFruitsBtn.addEventListener('click', () => {
//     if (textInputFruits.value.trim() !== '') {
//         const li = document.createElement('li');
//         li.textContent = textInputFruits.value;
//         list.appendChild(li);
//         textInputFruits.value = ''
        
//     }
// })

// list.addEventListener('click', (event) => {
//     if (event.target.tagName === 'LI') {
//         console.log(event.target);
//         event.target.remove();
//     }
// })

// // const changeText = (newText) => {
// //     titleElement.textContent = newText;
// // }

// // const listItems = document.querySelectorAll('li');
// // console.log(listItems);
// // listItems.forEach(li => {
// //     li.addEventListener('click', () => {
// //       li.remove(); 
// //     });
// //   });

// // const addFruit = (fruit) => {
// //     const li = document.createElement('li');
// //     li.textContent = fruit;
// //     li.addEventListener('click', () => li.remove());
// //     list.appendChild(li);
// //     console.log(fruit);
// // }

