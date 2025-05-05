function processDate() {
  const input = document.getElementById('dateInput').value.trim()
  const daysDiv = document.getElementById('daysResult')
  const leapDiv = document.getElementById('leapResult')

  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/
  const match = input.match(dateRegex)

  if (!match) {
    daysDiv.textContent =
      'Ошибка: неправильный формат даты. Используйте дд.мм.гггг.'
    leapDiv.textContent = ''
    return
  }

  const day = parseInt(match[1], 10)
  const month = parseInt(match[2], 10) - 1 // Месяцы в JS с 0
  const year = parseInt(match[3], 10)

  const userDate = new Date(year, month, day)
  if (
    userDate.getDate() !== day ||
    userDate.getMonth() !== month ||
    userDate.getFullYear() !== year
  ) {
    daysDiv.textContent = 'Ошибка: некорректная дата.'
    leapDiv.textContent = ''
    return
  }

  const newYearDate = new Date(year, 11, 31) // 31 декабря
  const diffTime = newYearDate - userDate
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  daysDiv.textContent = `Дней до Нового года: ${diffDays}`

  function isLeapYear(y) {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  }

  leapDiv.textContent = `Год ${year} — ${
    isLeapYear(year) ? 'високосный' : 'не високосный'
  }`
}
