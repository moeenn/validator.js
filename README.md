# Validator.js
A simple library for validating HTML forms. (because I hate jQuery)

# Usage
```html
<form id="sample_form">
  <fieldset>
    <label for="name">Name</label>
    <input
      for="name"
      type="text"
      data-required
      data-alpha
      data-minlength="5"
      data-same="password"
    />
  </fieldset>
</form>
```

```javascript
import validate from '../dist/validator.min.js';

const form = document.querySelector('#sample_form');

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const is_valid = validate(e.target);
  console.log("Is Form Valid?", is_valid);
});
```

See the Demo folder for a full example.


## TODO
- [ ] Implement a bundler (e.g. rollup)
- [ ] Update minification script to minify the bundle (i.e. all output .js files)
- [ ] When value is read from the form, its value should be trimmed
- [ ] If a required field is not filled out, don't run any other validators on it
