import './style.css'
import { supabase } from './supabase.js'

const articlesContainer = document.querySelector('#articles')
const addArticleBtn = document.querySelector('#addArticleBtn')
const logoutBtn = document.querySelector('#logoutBtn')
const userStatus = document.querySelector('#userStatus')

const articleModal = document.querySelector('#articleModal')
const articleForm = document.querySelector('#articleForm')
const modalTitle = document.querySelector('#modalTitle')
const closeModalBtn = document.querySelector('#closeModalBtn')

const titleInput = document.querySelector('#titleInput')
const subtitleInput = document.querySelector('#subtitleInput')
const authorInput = document.querySelector('#authorInput')
const contentInput = document.querySelector('#contentInput')

let currentUser = null
let editingArticleId = null
let loadedArticles = []

async function checkUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error(error)
  }

  currentUser = data?.user || null

  if (currentUser) {
    logoutBtn.classList.remove('hidden')
    userStatus.textContent = `Zalogowano jako: ${currentUser.email}`
  } else {
    logoutBtn.classList.add('hidden')
    userStatus.textContent = 'Nie jesteś zalogowany. Możesz czytać artykuły, ale nie możesz ich dodawać, edytować ani usuwać.'
  }
}

function createTextElement(tagName, text, className = '') {
  const element = document.createElement(tagName)
  element.textContent = text
  element.className = className
  return element
}

async function loadArticles() {
  articlesContainer.innerHTML = '<p class="text-slate-600">Ładowanie artykułów...</p>'

  const { data, error } = await supabase
    .from('article')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    articlesContainer.innerHTML = '<p class="text-red-600">Nie udało się pobrać artykułów.</p>'
    return
  }

  loadedArticles = data || []
  articlesContainer.innerHTML = ''

  if (loadedArticles.length === 0) {
    articlesContainer.innerHTML = '<p class="text-slate-600">Brak artykułów w bazie.</p>'
    return
  }

  loadedArticles.forEach((article) => {
    const articleElement = document.createElement('article')
    articleElement.className = 'grid gap-3 rounded-lg bg-white p-5 shadow'

    const header = document.createElement('header')

    const title = createTextElement('h2', article.title || 'Brak tytułu', 'text-xl font-bold')
    const subtitle = createTextElement('p', article.subtitle || '', 'text-slate-600')

    header.append(title, subtitle)

    const date = article.created_at
      ? new Date(article.created_at).toLocaleString('pl-PL')
      : 'brak daty'

    const meta = createTextElement(
      'p',
      `Autor: ${article.author || 'brak autora'} | Data: ${date}`,
      'text-sm text-slate-500'
    )

    const content = createTextElement('p', article.content || '', 'leading-relaxed')

    articleElement.append(header, meta, content)

    if (currentUser) {
      const footer = document.createElement('footer')
      footer.className = 'flex flex-col gap-3 sm:flex-row'

      const editButton = document.createElement('button')
      editButton.textContent = 'Edytuj'
      editButton.className = 'rounded bg-yellow-500 px-4 py-2 text-white transition hover:bg-yellow-600'
      editButton.addEventListener('click', () => openEditModal(article.id))

      const deleteButton = document.createElement('button')
      deleteButton.textContent = 'Usuń'
      deleteButton.className = 'rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700'
      deleteButton.addEventListener('click', () => deleteArticle(article.id))

      footer.append(editButton, deleteButton)
      articleElement.append(footer)
    }

    articlesContainer.append(articleElement)
  })
}

function openAddModal() {
  editingArticleId = null
  modalTitle.textContent = 'Dodaj artykuł'
  articleForm.reset()
  articleModal.showModal()
}

function openEditModal(id) {
  const article = loadedArticles.find((item) => String(item.id) === String(id))

  if (!article) {
    alert('Nie znaleziono artykułu.')
    return
  }

  editingArticleId = id
  modalTitle.textContent = 'Edytuj artykuł'

  titleInput.value = article.title || ''
  subtitleInput.value = article.subtitle || ''
  authorInput.value = article.author || ''
  contentInput.value = article.content || ''

  articleModal.showModal()
}

async function saveArticle(event) {
  event.preventDefault()

  const articleData = {
    title: titleInput.value.trim(),
    subtitle: subtitleInput.value.trim(),
    author: authorInput.value.trim(),
    content: contentInput.value.trim(),
    created_at: new Date().toISOString(),
  }

  if (!articleData.title || !articleData.author || !articleData.content) {
    alert('Uzupełnij tytuł, autora i treść.')
    return
  }

  let result

  if (editingArticleId) {
    result = await supabase
      .from('article')
      .update(articleData)
      .eq('id', editingArticleId)
  } else {
    result = await supabase
      .from('article')
      .insert(articleData)
  }

  if (result.error) {
    console.error(result.error)
    alert('Nie udało się zapisać artykułu. Sprawdź RLS i policies w Supabase.')
    return
  }

  articleModal.close()
  await loadArticles()
}

async function deleteArticle(id) {
  const confirmed = confirm('Czy na pewno chcesz usunąć ten artykuł?')

  if (!confirmed) {
    return
  }

  const { error } = await supabase
    .from('article')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(error)
    alert('Nie udało się usunąć artykułu. Sprawdź RLS i policies w Supabase.')
    return
  }

  await loadArticles()
}

addArticleBtn.addEventListener('click', () => {
  if (!currentUser) {
    window.location.href = './login.html'
    return
  }

  openAddModal()
})

logoutBtn.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
    alert('Nie udało się wylogować.')
    return
  }

  currentUser = null
  await checkUser()
  await loadArticles()
})

closeModalBtn.addEventListener('click', () => {
  articleModal.close()
})

articleForm.addEventListener('submit', saveArticle)

async function initPage() {
  await checkUser()
  await loadArticles()
}

supabase.auth.onAuthStateChange(async () => {
  await checkUser()
  await loadArticles()
})

initPage()
