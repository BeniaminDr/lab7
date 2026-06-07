import './style.css'
import { supabase } from './supabase.js'

const loginForm = document.querySelector('#loginForm')
const emailInput = document.querySelector('#emailInput')
const passwordInput = document.querySelector('#passwordInput')
const errorMessage = document.querySelector('#errorMessage')

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  errorMessage.textContent = ''

  const email = emailInput.value.trim()
  const password = passwordInput.value.trim()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error(error)
    errorMessage.textContent = 'Nieprawidłowy email lub hasło.'
    return
  }

  window.location.href = './index.html'
})
