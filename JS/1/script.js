// Задание №1

const h1 = document.createElement('h1')

h1.textContent = 'Hello world!'

document.body.appendChild(h1)

// Задание №2

const ol = document.createElement('ol')

const employees = [
  { firstName: 'Petya', lastName: 'Petrov' },
  { firstName: 'Petya2', lastName: 'Petrov2' },
  { firstName: 'Petya3', lastName: 'Petrov3' },
  { firstName: 'Petya4', lastName: 'Petrov4' },
  { firstName: 'Petya5', lastName: 'Petrov5' },
]

for (let i = 0; i < employees.length; i++) {
  const li = document.createElement('li')

  li.textContent = `${employees[i].firstName} ${employees[i].lastName}`
  ol.appendChild(li)
}

document.body.appendChild(ol)

// Задание №3

const redSquare = document.createElement('div')

redSquare.style.width = '50px'
redSquare.style.height = '50px'
redSquare.style.backgroundColor = 'red'
redSquare.style.transition = 'border-radius 0.5s ease'

redSquare.addEventListener('click', () => {
  if (redSquare.style.borderRadius === '50%') {
    redSquare.style.borderRadius = '0'
  } else {
    redSquare.style.borderRadius = '50%'
  }
})

document.body.appendChild(redSquare)

// Задание №4

const calculator = {
  add: function (a, b) {
    this.validateNumbers(a, b)
    return a + b
  },

  subtract: function (a, b) {
    this.validateNumbers(a, b)
    return a - b
  },

  multiply: function (a, b) {
    this.validateNumbers(a, b)
    return a * b
  },

  divide: function (a, b) {
    this.validateNumbers(a, b)
    if (b === 0) {
      throw new Error('Ошибка: Деление на ноль невозможно.')
    }
    return a / b
  },

  validateNumbers: function (a, b) {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Ошибка: Оба аргумента должны быть числами.')
    }
  },
}

try {
  console.log(calculator.add(5, 3))
  console.log(calculator.subtract(10, 4))
  console.log(calculator.multiply(2, 3))
  console.log(calculator.divide(8, 2))
  console.log(calculator.divide(5, 0))
} catch (error) {
  console.error(error.message)
}

try {
  console.log(calculator.add('5', 3))
} catch (error) {
  console.error(error.message)
}

// Задание №5

const textInput = document.createElement('input')
textInput.type = 'text'
textInput.placeholder = 'Введите текст'
document.body.appendChild(textInput)

const saveButton = document.createElement('button')
saveButton.innerText = 'Сохранить'
document.body.appendChild(saveButton)

saveButton.addEventListener('click', function () {
  localStorage.setItem('Text', textInput.value)

  setTimeout(() => {
    const savedText = localStorage.getItem('Text')
    console.log(savedText)
  }, 2000)
})

document.body.appendChild(textInput)
document.body.appendChild(saveButton)
