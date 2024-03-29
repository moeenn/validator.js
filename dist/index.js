/**
 *  validation handler functions
 *
 */
function required(data) {
    if (data.input.trim().length === 0)
        return { is_valid: false, message: "Please fill out this field" };
    return { is_valid: true };
}
function alpha(data) {
    const regexp = new RegExp("^[A-Za-z ]*$");
    const is_valid = regexp.test(data.input);
    if (!is_valid)
        return { is_valid, message: "Please enter alphabets only" };
    return { is_valid };
}
function num(data) {
    const is_valid = !isNaN(data.input);
    if (!is_valid)
        return { is_valid, message: "Please enter numbers only" };
    return { is_valid };
}
function alphanumeic(data) {
    const regexp = new RegExp("^[0-9A-Za-z ]*$");
    const is_valid = regexp.test(data.input);
    if (!is_valid)
        return { is_valid, message: "Please enter alphabets or numbers only" };
    return { is_valid };
}
function minlength(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-minlength validator");
    const is_valid = data.input.length >= parseInt(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter atleast ${data.validator_value} characters`,
        };
    return { is_valid };
}
function maxlength(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-maxlength validator");
    const is_valid = data.input.length <= parseInt(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter ${data.validator_value} or fewer characters`,
        };
    return { is_valid };
}
function min(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-min validator");
    const is_valid = parseFloat(data.input) >= parseFloat(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter a value greater than or equal to ${data.validator_value}`,
        };
    return { is_valid };
}
function max(data) {
    if (!data.validator_value)
        throw new Error("No value provided for data-max validator");
    const is_valid = parseFloat(data.input) <= parseFloat(data.validator_value);
    if (!is_valid)
        return {
            is_valid,
            message: `Please enter a value less than or equal to ${data.validator_value}`,
        };
    return { is_valid };
}
function same(data) {
    const target_selector = `form input[for='${data.validator_value}']`;
    const target_input = document.querySelector(target_selector);
    if (!target_input)
        throw new Error(`Target element with selector ${target_selector} not found`);
    if (target_input.value !== data.input)
        return {
            is_valid: false,
            message: `Input value does not match target ${data.validator_value} field`,
        };
    return { is_valid: true };
}
var validators = {
    required,
    alpha,
    num,
    alphanumeic,
    minlength,
    maxlength,
    min,
    max,
    same,
};

/**
 *  registered validators
 *
 */
const validations = new Map([
    ["required", { handler: validators.required, priority: 0 }],
    ["alpha", { handler: validators.alpha, priority: 1 }],
    ["num", { handler: validators.num, priority: 1 }],
    ["alphanumeric", { handler: validators.alphanumeic, priority: 1 }],
    ["minlength", { handler: validators.minlength, priority: 2 }],
    ["maxlength", { handler: validators.maxlength, priority: 2 }],
    ["min", { handler: validators.min, priority: 2 }],
    ["max", { handler: validators.max, priority: 2 }],
    ["same", { handler: validators.same, priority: 1 }],
]);
/**
 *  get all input fields from the provided form
 *
 */
function get_form_fields(form) {
    const inputs = form.querySelectorAll("input:not(input[type='submit'])");
    if (!inputs)
        throw new Error("Provided form does not have any valid input fields");
    return [...inputs];
}
/**
 *  clear all previous errors in the form
 *
 */
function clear_previous_errors(form) {
    const errors = form.querySelectorAll("[data-validator]");
    errors.forEach((error) => error.remove());
}
/**
 *  create element containing error message for insertion into DOM
 *
 */
function create_error_element(validation_name, error_message) {
    const error = document.createElement("p");
    error.dataset.validator = validation_name;
    error.classList.add("error");
    const validator = validations.get(validation_name);
    if (validator) {
        error.innerText = error_message;
    }
    return error;
}
/**
 *  check if a particular error is already being shown on a field
 *
 */
function contains_error(parent, validation_name) {
    const current_errors = parent.querySelectorAll(".error");
    if (current_errors.length === 0)
        return false;
    return ([...current_errors].findIndex((error) => {
        return error.dataset.validation_name === validation_name;
    }) !== -1);
}
/**
 *  show / hide validation errors from DOM
 *
 */
function show_error(field, validation_name, error_message) {
    const error = create_error_element(validation_name, error_message);
    const parent = field.parentElement;
    if (parent) {
        if (!contains_error(parent, validation_name)) {
            parent.appendChild(error);
        }
    }
}
/**
 *  entrypoint to the module
 *
 */
function validate(form) {
    const inputs = get_form_fields(form);
    clear_previous_errors(form);
    const results = [];
    for (const field of inputs) {
        const applied_validators = field.dataset;
        const field_value = field.value;
        /**
         *  fetch all know validators
         *
         */
        let known_validators = [];
        for (const [validator, value] of Object.entries(applied_validators)) {
            const known_validator = validations.get(validator);
            if (!known_validator) {
                console.warn(`Unrecognized validator: ${validator}`);
                results.push(false);
                continue;
            }
            known_validators.push({ handler: known_validator, validator, value });
        }
        /**
         *  known validators need to be sorted by priority
         *  if a validator with higher priority fails, we will not run other
         *  validators of lower priority
        */
        known_validators = known_validators.sort((a, b) => {
            return a.handler.priority - b.handler.priority;
        });
        /**
         *  run the actual validations
         *
        */
        for (const { validator, handler, value } of known_validators) {
            const result = handler.handler({
                input: field_value,
                validator_value: value,
            });
            results.push(result.is_valid);
            if (!result.is_valid && result.message) {
                show_error(field, validator, result.message);
                break;
            }
        }
    }
    return results.every(result => result);
}

export { validate };
