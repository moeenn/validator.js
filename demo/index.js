import validate from '../dist/validator.js';

const form = document.querySelector('#sample_form');

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const is_valid = validate(e.target);  
  console.log("Is Form Valid?", is_valid);
})