import { validate } from '../dist/index.js'

const forms = document.querySelectorAll('form[data-validate]')
forms.forEach(form => {
  form.addEventListener("submit", (e) => {
    e.preventDefault()

    const is_valid = validate(e.target)
    console.log("Form valid?", is_valid)
  })
})
