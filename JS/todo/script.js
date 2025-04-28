const noteInput = document.getElementById('noteInput')
const addNoteBtn = document.getElementById('addNoteBtn')
const notesContainer = document.getElementById('notesContainer')

// Загрузка заметок из localStorage
document.addEventListener('DOMContentLoaded', loadNotes)

// Добавление новой заметки
addNoteBtn.addEventListener('click', () => {
  const noteText = noteInput.value.trim()

  if (noteText) {
    addNoteToStorage(noteText)
    noteInput.value = ''
    renderNotes()
  }
})

// Функция для добавления заметки в localStorage
function addNoteToStorage(note) {
  const notes = getNotesFromStorage()
  notes.push(note)
  localStorage.setItem('notes', JSON.stringify(notes))
}

// Получение заметок из localStorage
function getNotesFromStorage() {
  return JSON.parse(localStorage.getItem('notes')) || []
}

// Отображение заметок
function renderNotes() {
  const notes = getNotesFromStorage()
  notesContainer.innerHTML = ''

  notes.forEach((note, index) => {
    const noteDiv = document.createElement('div')
    noteDiv.classList.add('note')
    noteDiv.innerHTML = `<span>${note}</span>
            <div>
                <button class="edit" onclick="editNote(${index})">Редактировать</button>
                <button onclick="deleteNote(${index})">Удалить</button>
            </div>`
    notesContainer.appendChild(noteDiv)
  })
}

// Редактирование заметки
function editNote(index) {
  const notes = getNotesFromStorage()
  const newNote = prompt('Редактировать заметку:', notes[index])

  if (newNote !== null && newNote.trim() !== '') {
    notes[index] = newNote.trim()
    localStorage.setItem('notes', JSON.stringify(notes))
    renderNotes()
  }
}

// Удаление заметки
function deleteNote(index) {
  const notes = getNotesFromStorage()
  notes.splice(index, 1)
  localStorage.setItem('notes', JSON.stringify(notes))
  renderNotes()
}

// Загрузка заметок при загрузке страницы
function loadNotes() {
  renderNotes()
}
