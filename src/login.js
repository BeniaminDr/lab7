import './style.css'
import { supabase } from './supabase.js'

const loginForm = document.querySelector('#loginForm')
const emailInput = document.querySelector('#emailInput')
const passwordInput = document.querySelector('#passwordInput')
const errorMessage = document.querySelector('#errorMessage')

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const { error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value,
  })

  if (error) {
    errorMessage.textContent = 'Nieprawidłowy email lub hasło.'
    console.error(error)
    return
  }

  window.location.href = '/index.html'
})